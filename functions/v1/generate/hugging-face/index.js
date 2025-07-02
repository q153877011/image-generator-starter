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
		throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
	}
	
	// 解析 JSON 结果
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
		throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
	}
	
	// 解析 JSON 结果
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
		throw new Error(`API请求失败: ${response.status} ${response.statusText} - ${errorText}`);
	}
	
	// 解析 JSON 结果
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
    // 仅在 POST 且 Content-Type 为 application/json 时解析 JSON
    let body = {};
    if (request.method === 'POST' && request.headers.get('content-type')?.includes('application/json')) {
      try {
        body = await request.json();
      } catch (parseErr) {
        throw new Error('请求体 JSON 解析失败', parseErr);
      }
    }
    console.log('接收到的请求:', body);
    
    // ----  新增：EdgeOne 版 IP + 设备指纹 限流 ----
    const MAX_REQUESTS = 10;


    const userKey = `${eo.clientIp}__${eo.uuid}`;

    try {
      const kv = image_generage_cnt; // 在 pages.toml／控制台中绑定 KV
      if (kv) {
        const stored = await kv.get(userKey);
        const currentCount = stored ? parseInt(stored, 10) : 0;
        if (currentCount >= MAX_REQUESTS) {
          return new Response(JSON.stringify({ error: `请求次数已达到上限（${MAX_REQUESTS}）` }), {
            status: 429,
            headers: {
              'content-type': 'application/json; charset=UTF-8',
              'Access-Control-Allow-Origin': '*',
            },
          });
        }
        // 计数 +1，并设置 24 小时 TTL，防止 KV 无限增长
        await image_generage_cnt.put(userKey, String(currentCount + 1));
      } else {
        if(!image_generage_cnt) {
          throw new Error('image_generage_cnt 未设置');
        }
        // 如果没有 KV 绑定，则使用内存 Map 作为回退（仅适用于单实例，随 Worker 冷启会清空）
        globalThis.__rateLimitMap = globalThis.__rateLimitMap || new Map();
        const currentCount = globalThis.__rateLimitMap.get(userKey) || 0;
        if (currentCount >= MAX_REQUESTS) {
          return new Response(JSON.stringify({ error: `请求次数已达到上限（${MAX_REQUESTS}）` }), {
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
    // ----  限流结束  ----
    
    // 检查环境变量
    if (!env.HF_TOKEN) {
      throw new Error('HF_TOKEN 环境变量未设置');
    }

    // 从请求中获取用户输入的图像描述
    const prompt = body.image || "一幅美丽的风景画";
    
    // 使用前端传来的模型 value
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
      throw new Error(`不支持的模型: ${model}`);
    }

    const result = await handler();
        
    // 返回包含base64图片的响应
    return new Response(JSON.stringify({
      success: true,
      prompt: prompt,
      imageBase64: result.data?.[0]?.b64_json || result.b64_json, // 不同API可能返回格式不同
      message: '图像生成成功'
    }), {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err) {
    console.error('图像生成错误')
    console.error(err)
    return new Response(JSON.stringify({ error: err.message }), {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
}