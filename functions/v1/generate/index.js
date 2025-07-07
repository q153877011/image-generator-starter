// Import utilities
import { nebius_query, replicate_query, fal_query, processApiResponse } from './fetch_utils.js';
import { checkSensitiveContent } from './nfsw_limit.js';



export async function onRequest({ request, params, env }) {
  try {
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
    // Only parse JSON when method is POST and Content-Type is application/json
    let body = {};
    if (request.method === 'POST' && request.headers.get('content-type')?.includes('application/json')) {
      try {
        body = await request.json();
      } catch (parseErr) {
        throw new Error('Failed to parse request JSON');
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
          return new Response(JSON.stringify({ error: `The demo experience is limited to (${MAX_REQUESTS}) generations. For more AI image generation features, please deploy on EdgeOne Pages.` }), {
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
          return new Response(JSON.stringify({ error: `The demo experience is limited to (${MAX_REQUESTS}) generations. For more AI image generation features, please deploy on EdgeOne Pages.` }), {
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
    
    // Check for sensitive content using the utility function
    const { hasSensitive } = checkSensitiveContent(prompt);
    if (hasSensitive) {
      return new Response(JSON.stringify({ error: 
        "Sorry, we don't support generating NSFW content." }), {
        status: 400,
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    // Use front-end passed model value
    const model = body.model || "stability-ai/sdxl";
    const handlers = {
      'black-forest-labs/flux-schnell': () => nebius_query({
        response_format: 'b64_json',
        prompt,
        model,
      }, 'https://api.studio.nebius.com/v1/images/generations'),
      'black-forest-labs/flux-dev': () => nebius_query({
        response_format: 'b64_json',
        prompt,
        model,
      }, 'https://api.studio.nebius.com/v1/images/generations'),
      'stability-ai/sdxl': () => nebius_query({
        response_format: 'b64_json',
        prompt,
        model,
      }, 'https://api.studio.nebius.com/v1/images/generations'),
      'nerijs/pixel-art-xl': () => fal_query({
        prompt,
      }, 'https://router.huggingface.co/fal-ai/fal-ai/fast-sdxl'),
      'ByteDance/Hyper-SD': () => replicate_query({
        input: { prompt },
      }, 'https://router.huggingface.co/replicate/v1/predictions'),
      'HiDream-ai/HiDream-I1-Full': () => fal_query({ prompt }, 'https://router.huggingface.co/fal-ai/fal-ai/hidream-i1-full'),
      'stabilityai/sdxl-turbo': () => replicate_query({
        input: { prompt },
      }, 'https://router.huggingface.co/replicate/v1/models/jyoung105/sdxl-turbo/predictions'),
      'google/imagen-4': () => replicate_query({
        input: { prompt },
      }, 'https://api.replicate.com/v1/models/google/imagen-4/predictions'),
    };

    const handler = handlers[model];
    if (!handler) {
      throw new Error(`Unsupported model: ${model}`);
    }
    const result = await handler();
    
    // Extract image data from API response
    const imageData = await processApiResponse(result);
    
    // Return response with image data
    return new Response(JSON.stringify({
      success: true,
      prompt: prompt,
      imageData: imageData,
      message: 'Image generated successfully'
    }), {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('API Error:', err);
    
    // 构建详细的错误信息
    let errorMessage = 'Internal server error';
    let errorDetails = '';
    
    if (err && err.message) {
      errorMessage = err.message;
      
      // 如果是 JSON 解析错误，提供更友好的错误信息
      if (err.message.includes('Unexpected token') || err.message.includes('JSON')) {
        errorMessage = 'API returned invalid response format';
        errorDetails = `Original error: ${err.message}`;
      }
    }
    
    const errorResponse = {
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        status: 500,
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
}