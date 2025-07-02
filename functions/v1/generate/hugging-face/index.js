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
        console.warn('请求体 JSON 解析失败:', parseErr.message);
      }
    }
    console.log('接收到的请求:', body);
    
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