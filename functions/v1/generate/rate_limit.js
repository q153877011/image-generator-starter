/**
 * Rate Limiting Utility
 * Provides rate limiting functionality using KV storage with fallback to in-memory Map
 * Uses a single key to store all user rate limit data to save storage space
 */

const RATE_LIMIT_KEY = 'image_rate_limit_data';
const CLEANUP_INTERVAL = 24 * 7 * 60 * 60 * 1000; // 7 days in milliseconds

/**
 * Initialize rate limit data in KV storage
 * @param {Object} kv - KV binding
 * @returns {Promise<void>}
 */
async function initializeRateLimitData(kv) {
  try {
    const existing = await kv.get(RATE_LIMIT_KEY);
    if (!existing) {
      console.log('Initializing rate limit data in KV storage');
      await kv.put(RATE_LIMIT_KEY, JSON.stringify({}), { expirationTtl: 86400 });
      console.log('Rate limit data initialized successfully');
    } else {
      console.log('Rate limit data already exists in KV storage');
    }
  } catch (error) {
    console.warn('Failed to initialize rate limit data:', error);
  }
}

/**
 * Clean up old rate limit data
 * @param {Object} rateLimitData - Current rate limit data
 * @returns {Object} Cleaned rate limit data
 */
function cleanupRateLimitData(rateLimitData) {
  const now = Date.now();
  const cleaned = {};
  
  for (const [userKey, userData] of Object.entries(rateLimitData)) {
    // Keep data that's less than 24 hours old
    if (now - userData.timestamp < CLEANUP_INTERVAL) {
      cleaned[userKey] = userData;
    }
  }
  
  return cleaned;
}

/**
 * Check and update rate limit for a user
 * @param {string} userKey - Unique identifier for the user (usually IP address)
 * @param {Object} env - Environment variables containing KV bindings
 * @param {number} maxRequests - Maximum number of requests allowed
 * @returns {Promise<Object>} Result object with { allowed: boolean, error?: string }
 */
export async function checkRateLimit(userKey, env, maxRequests = 10) {
  try {
    console.log('Checking rate limit for user:', userKey);
    console.log('Available env keys:', Object.keys(env || {}));
    
    const kv = image_generage_cnt; // KV binding defined in dashboard
    console.log('KV binding available:', !!kv);
    
    if (kv) {
      // Initialize rate limit data if needed
      await initializeRateLimitData(kv);
      
      // Use KV storage for rate limiting with single key
      console.log('Fetching rate limit data from KV...');
      const stored = await kv.get(RATE_LIMIT_KEY);
      console.log('Stored data:', stored ? 'exists' : 'not found');
      
      let rateLimitData = {};
      
      if (stored) {
        try {
          rateLimitData = JSON.parse(stored);
          console.log('Parsed rate limit data:', Object.keys(rateLimitData));
        } catch (parseErr) {
          console.warn('Failed to parse rate limit data, starting fresh:', parseErr);
          rateLimitData = {};
        }
      } else {
        console.log('No existing rate limit data found, starting fresh');
      }
      
      // Clean up old data
      const beforeCleanup = Object.keys(rateLimitData).length;
      rateLimitData = cleanupRateLimitData(rateLimitData);
      const afterCleanup = Object.keys(rateLimitData).length;
      console.log(`Cleanup: ${beforeCleanup} -> ${afterCleanup} users`);
      
      // Get current user count
      const userData = rateLimitData[userKey] || { count: 0, timestamp: Date.now() };
      const currentCount = userData.count;
      console.log(`User ${userKey} current count: ${currentCount}/${maxRequests}`);
      
      if (currentCount >= maxRequests) {
        console.log(`Rate limit exceeded for user ${userKey}`);
        return {
          allowed: false,
          error: `The demo experience is limited to (${maxRequests}) generations. For more AI image generation features, please deploy on EdgeOne Pages.`
        };
      }
      
      // Update user count and timestamp
      rateLimitData[userKey] = {
        count: currentCount + 1,
        timestamp: Date.now()
      };
      
      // Store updated data with 24-hour TTL
      console.log('Storing updated rate limit data...');
      await kv.put(RATE_LIMIT_KEY, JSON.stringify(rateLimitData), { expirationTtl: 86400 });
      console.log('Rate limit data stored successfully');
      return { allowed: true };
      
    } else {
      console.log('KV not available, falling back to in-memory Map');
      // Fallback to in-memory Map if KV is not configured
      if (!env.image_generage_cnt) {
        throw new Error('image_generage_cnt KV binding is not configured');
      }
      
      // If KV is not bound, fall back to in-memory Map (single instance, resets on cold start)
      globalThis.__rateLimitMap = globalThis.__rateLimitMap || new Map();
      const currentCount = globalThis.__rateLimitMap.get(userKey) || 0;
      
      if (currentCount >= maxRequests) {
        return {
          allowed: false,
          error: `The demo experience is limited to (${maxRequests}) generations. For more AI image generation features, please deploy on EdgeOne Pages.`
        };
      }
      
      globalThis.__rateLimitMap.set(userKey, currentCount + 1);
      return { allowed: true };
    }
    
  } catch (rateErr) {
    console.warn('Rate limit check failed:', rateErr);
    // If rate limiting fails, allow the request to proceed
    return { allowed: true };
  }
}

/**
 * Create rate limit error response
 * @param {string} errorMessage - Error message to return
 * @returns {Response} HTTP response with rate limit error
 */
export function createRateLimitResponse(errorMessage) {
  return new Response(JSON.stringify({ error: errorMessage }), {
    status: 429,
    headers: {
      'content-type': 'application/json; charset=UTF-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
} 