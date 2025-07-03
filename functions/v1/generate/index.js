const BODY_PARTS = [
  'penis', 'vagina', 'cock', 'dick', 'pussy', 'cunt', 'boobs', 'tits', 
  'nipples', 'breast', 'ass', 'butt', 'anus', 'genitals', 'crotch',
  'clitoris', 'labia', 'scrotum', 'testicles', 'balls',
  
  'p3nis', 'v4gina', 'c0ck', 'd1ck', 'b00bs', 't1ts', 'n1pples',
  'br3ast', '4ss', 'gen1tals', 'cr0tch',
  
  'boobies', 'titties', 'knockers', 'jugs', 'melons', 'hooters',
  'shaft', 'rod', 'member', 'manhood', 'package', 'junk',
  'rear', 'behind', 'bottom', 'backside', 'rump', 'bum'
]

const SEXUAL_ACTS = [
  'sex', 'fuck', 'fucking', 'intercourse', 'oral', 'anal', 'masturbate',
  'orgasm', 'climax', 'cum', 'cumming', 'ejaculate', 'penetration',
  'foreplay', 'handjob', 'blowjob', 'cunnilingus', 'fellatio',
  
  'f*ck', 'f**k', 'fck', 'fuk', 'phuck', 's3x', 'm4sturbate',
  'org4sm', 'cl1max', 'ej4culate', 'penetr4tion',
  
  'hook up', 'make love', 'get it on', 'do it', 'bang', 'screw',
  'shag', 'hump', 'bone', 'nail', 'pound', 'smash', 'tap',
  'ride', 'mount', 'thrust', 'stroke', 'rub', 'touch',
  
  'bdsm', 'bondage', 'domination', 'submission', 'sadism', 'masochism',
  'whip', 'spank', 'tie up', 'bound', 'slave', 'master', 'mistress'
]

const ADULT_CONTENT = [
  'porn', 'porno', 'pornography', 'xxx', 'adult', 'erotic', 'erotica',
  'nsfw', 'nude', 'naked', 'nudity', 'strip', 'stripper', 'escort',
  'prostitute', 'hooker', 'whore', 'slut', 'bitch',
  
  'p0rn', 'p*rn', 'pr0n', 'nud3', 'n4ked', 'n5fw', 'str1p',
  'escort', 'pr0stitute', 'h00ker', 'wh0re', 'sl*t', 'b*tch',
  
  'camgirl', 'webcam', 'onlyfans', 'chaturbate', 'pornhub',
  'milf', 'gilf', 'teen', 'barely legal', 'jailbait',
  
  'lesbian', 'gay', 'bisexual', 'threesome', 'orgy', 'gangbang',
  'bukkake', 'creampie', 'facial', 'dp', 'mmf', 'ffm'
]

const CLOTHING_STATE = [
  'topless', 'bottomless', 'braless', 'pantyless', 'commando',
  'undressed', 'unclothed', 'disrobed', 'exposed', 'revealing',
  'skimpy', 'scanty', 'provocative', 'seductive', 'sultry',
  'lingerie', 'underwear', 'panties', 'bra', 'thong', 'g-string',
  'bikini', 'swimsuit', 'bathing suit', 'negligee', 'teddy'
]

const CHINESE_BODY = [
  '阴茎', '阴道', '乳房', '胸部', '臀部', '屁股', '生殖器', '下体',
  '乳头', '阴唇', '阴蒂', '睾丸', '龟头', '包皮', '肛门',
  
  '鸡鸡', '小弟弟', '老二', '命根子', '鸟', '屌', '奶子', '咪咪',
  '波霸', '巨乳', '美乳', '翘臀', '肥臀', '蜜桃臀', '美臀',
  
  'jj', 'dd', 'nz', 'pp', '那里', '那个地方', '私处'
]

const CHINESE_SEXUAL = [
  '性交', '做爱', '性爱', '交配', '性行为', '房事', '云雨', '床笫',
  '手淫', '自慰', '撸管', '打飞机', '高潮', '射精', '性高潮',
  '口交', '肛交', '69', '后入', '传教士', '骑乘', '侧位',
  
  '啪啪啪', '嘿咻', '羞羞', '不可描述', '开车', '老司机',
  'xxoo', 'ml', 'ppp', '车震', '野战', '一夜情', '约炮',
  
  '鱼水之欢', '巫山云雨', '共赴云雨', '春宵一刻', '颠鸾倒凤'
]

const CHINESE_ADULT = [
  '色情', '黄片', '毛片', 'AV', '成人片', '三级片', '情色', '艳情',
  '裸体', '全裸', '半裸', '果体', '天体', '裸照', '艳照', '裸',
  '脱衣', '脱光', '一丝不挂', '赤身裸体', '光着身子',
  
  '妓女', '鸡', '小姐', '失足妇女', '援交', '包养', '二奶',
  '鸭子', '牛郎', '陪酒女', '红灯区', '风月场所',
  
  '老湿', '湿了', '硬了', '撸', '鲁', '屌丝', '骚', '浪', '荡'
]

async function nebius_query(data, token, url) {
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
    // Combine all sensitive words into one array
    const SENSITIVE_WORDS = [
      ...BODY_PARTS,
      ...SEXUAL_ACTS,
      ...ADULT_CONTENT,
      ...CLOTHING_STATE,
      ...CHINESE_BODY,
      ...CHINESE_SEXUAL,
      ...CHINESE_ADULT,
    ];
    // Check if prompt contains any sensitive word (case-insensitive)
    const lowerPrompt = prompt.toLowerCase();
    const hasSensitive = SENSITIVE_WORDS.some(word =>
      lowerPrompt.includes(word.toLowerCase())
    );
    if (hasSensitive) {
      return new Response(JSON.stringify({ error: 'The input content is illegal!' }), {
        status: 400,
        headers: {
          'content-type': 'application/json; charset=UTF-8',
          'Access-Control-Allow-Origin': '*',
        },
      });
    }
    // Use front-end passed model value
    const model = body.model || "stability-ai/sdxl";
    console.log('token', env.NEBIUS_TOKEN);
    const handlers = {
      'black-forest-labs/flux-schnell': () => nebius_query({
        response_format: 'b64_json',
        prompt,
        model,
      }, env.NEBIUS_TOKEN, 'https://api.studio.nebius.com/v1/images/generations'),
      'black-forest-labs/flux-dev': () => nebius_query({
        response_format: 'b64_json',
        prompt,
        model,
      }, env.NEBIUS_TOKEN, 'https://api.studio.nebius.com/v1/images/generations'),
      'stability-ai/sdxl': () => nebius_query({
        response_format: 'b64_json',
        prompt,
        model,
      }, env.NEBIUS_TOKEN, 'https://api.studio.nebius.com/v1/images/generations'),
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
    return new Response(
      JSON.stringify({ error: err && err.message ? err.message : String(err) || 'Internal server error' }),
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