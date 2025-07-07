/**
 * Fetch utilities for API queries
 * Provides unified functions for making authenticated API requests
 */

/**
 * Generic API query function
 * @param {Object} data - Request data to send
 * @param {string} token - Authentication token
 * @param {string} url - API endpoint URL
 * @returns {Promise<Object>} API response data
 */
async function apiQuery(data, token, url) {
  const response = await PROVIDERS.fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  // Parse JSON result
  const result = await response.json();
  return result;
}

/**
 * Nebius API query function
 * @param {Object} data - Request data
 * @param {string} url - Nebius API endpoint
 * @returns {Promise<Object>} API response
 */
async function nebius_query(data, url) {
  return apiQuery(data, env.NEBIUS_TOKEN, url);
}

/**
 * Replicate API query function
 * @param {Object} data - Request data
 * @param {string} url - Replicate API endpoint
 * @returns {Promise<Object>} API response
 */
async function replicate_query(data, url) {
  return apiQuery(data, env.REPLICATE_TOKEN, url);
}

/**
 * FAL API query function
 * @param {Object} data - Request data
 * @param {string} url - FAL API endpoint
 * @returns {Promise<Object>} API response
 */
async function fal_query(data, url) {
  return apiQuery(data, env.HF_TOKEN, url);
}

/**
 * Poll Replicate API for completion
 * @param {string} predictionId - Prediction ID from initial response
 * @param {string} getUrl - URL to poll for results
 * @returns {Promise<Object>} Final result with output
 */
async function pollReplicateResult(predictionId, getUrl) {
  const maxAttempts = 120; // 10 minutes with 5-second intervals
  const interval = 2000; // 5 seconds
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const response = await PROVIDERS.fetch(getUrl, {
        headers: {
          'Authorization': `Bearer ${env.REPLICATE_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Polling failed: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Check if response is JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        throw new Error(`Invalid response format: expected JSON but got ${contentType}. Response: ${responseText.substring(0, 200)}`);
      }
      
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        const responseText = await response.text();
        throw new Error(`JSON parsing failed: ${jsonError.message}. Response: ${responseText.substring(0, 200)}`);
      }
      
      console.log(`Polling attempt ${attempt + 1}, status: ${result.status}`);
      
      if (result.status === 'succeeded') {
        console.log('result', result);
        return result;
      } else if (result.status === 'failed') {
        throw new Error(`Generation failed: ${result.error || 'Unknown error'}`);
      } else if (result.status === 'canceled') {
        throw new Error('Generation was canceled');
      }
      
      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, interval));
      
    } catch (error) {
      console.error(`Polling error on attempt ${attempt + 1}:`, error);
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  throw new Error('Generation timed out after 10 minutes');
}

/**
 * Extract image data from API response
 * @param {Object} result - API response result
 * @returns {Promise<string>} Image data (URL or base64)
 */
async function processApiResponse(result) {
  console.log('Processing API response...');
  
  // Check if result is null or undefined
  if (!result) {
    throw new Error('Invalid API response: result is null or undefined');
  }

  // Handle Replicate API async response
  if (result.id && result.status && result.urls && result.urls.get) {
    console.log('Detected Replicate API response, status:', result.status);
    // This is a Replicate API response, need to poll for completion
    if (result.status === 'starting' || result.status === 'processing') {
      console.log('Replicate API: Polling for completion...');
      const finalResult = await pollReplicateResult(result.id, result.urls.get);
      result = finalResult;
      console.log('Polling completed successfully');
    } else if (result.status === 'succeeded') {
      // Already completed
      console.log('Replicate API: Already completed');
    } else if (result.status === 'failed') {
      throw new Error(`Generation failed: ${result.error || 'Unknown error'}`);
    }
  }

  // Handle Replicate API format (URL output)
  if (result.output && typeof result.output === 'string' && result.output.startsWith('http')) {
    console.log('Found Replicate API URL output');
    return result.output;
  }

  // Handle Replicate API format (array of URLs)
  if (result.output && Array.isArray(result.output) && result.output.length > 0) {
    const firstUrl = result.output[0];
    if (typeof firstUrl === 'string' && firstUrl.startsWith('http')) {
      console.log('Found Replicate API array URL output');
      return firstUrl;
    }
  }

  // Handle other API formats (Nebius, FAL, etc.)
  if (result.data) {
    // Handle Nebius API format (base64)
    if (Array.isArray(result.data) && result.data.length > 0) {
      const firstImage = result.data[0];
      if (firstImage.b64_json) {
        console.log('Found Nebius API base64 output');
        return firstImage.b64_json;
      }
    }
    
    // Handle FAL API format (base64 in data field)
    if (result.data.b64_json) {
      console.log('Found FAL API base64 output');
      return result.data.b64_json;
    }
  }

  // Handle direct base64 format
  if (result.b64_json) {
    console.log('Found direct base64 output');
    return result.b64_json;
  }

  // If no recognized format, throw error
  console.log('No recognized format found, throwing error');
  throw new Error('Unsupported API response format');
}

// Export all functions
export {
  apiQuery,
  nebius_query,
  replicate_query,
  fal_query,
  pollReplicateResult,
  processApiResponse
}; 