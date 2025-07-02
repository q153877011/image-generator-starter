async function newbius_query(data, token, url) {
  const response = await fetch(
		url,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
  
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
	}
	
	// Parse JSON result
	const result = await response.json();
	return result;
}

async function replicate_query(data, token, url) {
  const response = await fetch(
		url,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
  
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
	}
	
	// Parse JSON result
	const result = await response.json();
	return result;
}

async function fal_query(data, token, url) {
  const response = await fetch(
		url,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				"Content-Type": "application/json",
			},
			method: "POST",
			body: JSON.stringify(data),
		}
	);
  
	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
	}
	
	// Parse JSON result
	const result = await response.json();
	return result;
}

export async function onRequest({ request, params, env }) {
  const eo = request.eo;
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
  try {
    // Only parse JSON when method is POST and Content-Type is application/json
    let body = {};
    if (request.method === 'POST' && request.headers.get('content-type')?.includes('application/json')) {
      try {
        body = await request.json();
      } catch (parseErr) {
        throw new Error('Failed to parse request JSON', parseErr);
      }
    }
    console.log('Incoming request:', body);
    
    // ----  EdgeOne version: rate-limit by IP + device fingerprint ----
    const MAX_REQUESTS = 10;

    const userKey = `${eo.clientIp}`;

    try {
      const kv = image_generage_cnt; // KV binding defined in pages.toml / dashboard
      if (kv) {
        const stored = await kv.get(userKey);
        const currentCount = stored ? parseInt(stored, 10) : 0;
        if (currentCount >= MAX_REQUESTS) {
          return new Response(JSON.stringify({ error: `Request limit (${MAX_REQUESTS}) reached` }), {
            status: 429,
            headers: {
              'content-type': 'application/json; charset=UTF-8',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        // Increment count and set 24-hour TTL to avoid unlimited growth
        await image_generage_cnt.put(userKey, String(currentCount + 1));
      } else {
        if(!image_generage_cnt) {
          throw new Error('image_generage_cnt KV binding is not configured');
        }
        // If KV is not bound, fall back to in-memory Map (single instance, resets on cold start)
        globalThis.__rateLimitMap = globalThis.__rateLimitMap || new Map();
        const currentCount = globalThis.__rateLimitMap.get(userKey) || 0;
        if (currentCount >= MAX_REQUESTS) {
          return new Response(JSON.stringify({ error: `Request limit (${MAX_REQUESTS}) reached` }), {
            status: 429,
            headers: {
              'content-type': 'application/json; charset=UTF-8',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        globalThis.__rateLimitMap.set(userKey, currentCount + 1);
      }
    } catch (rateErr) {
      console.warn('请求计数更新失败:', rateErr);
    }
    // ----  Rate-limit section end  ----
    
    // Check environment variable
    if (!env.HF_TOKEN) {
      throw new Error('HF_TOKEN environment variable is not set');
    }

    // Get prompt text from request
    const prompt = body.image || "一幅美丽的风景画";
    
    // Use front-end passed model value
    const model = body.model || "stability-ai/sdxl";
    
    const handlers = {
      'stability-ai/sdxl': () => newbius_query({
        response_format: 'b64_json',
        prompt,
        model,
      }, env.HF_TOKEN, 'https://router.huggingface.co/nebius/v1/images/generations'),

      'black-forest-labs/flux-dev': () => newbius_query({
        response_format: 'b64_json',
        prompt,
        model,
      }, env.HF_TOKEN, 'https://router.huggingface.co/nebius/v1/images/generations'),
      'nerijs/pixel-art-xl': () => fal_query({
        prompt,
      }, env.HF_TOKEN, 'https://router.huggingface.co/fal-ai/fal-ai/fast-sdxl'),
      'ByteDance/Hyper-SD': () => replicate_query({
        input: { prompt },
      }, env.HF_TOKEN, 'https://router.huggingface.co/replicate/v1/predictions'),

      'HiDream-ai/HiDream-I1-Full': () => fal_query({ prompt }, env.HF_TOKEN, 'https://router.huggingface.co/fal-ai/fal-ai/hidream-i1-full'),

      'stabilityai/sdxl-turbo': () => replicate_query({
        input: { prompt },
      }, env.HF_TOKEN, 'https://router.huggingface.co/replicate/v1/models/jyoung105/sdxl-turbo/predictions'),
    };

    const handler = handlers[model];
    if (!handler) {
      throw new Error(`Unsupported model: ${model}`);
    }

    const result = await handler();
        
    // Return response with base64 image
    return new Response(JSON.stringify({
      success: true,
      prompt: prompt,
      imageBase64: result.data?.[0]?.b64_json || result.b64_json, // Different APIs may return different formats
      message: 'Image generated successfully'
    }), {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('Image generation error')
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}