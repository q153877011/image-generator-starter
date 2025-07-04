export async function onRequest({ request, env }) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Only allow GET
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const hfTokenPresent = Boolean(env.HF_TOKEN);
  const nebiusTokenPresent = Boolean(env.NEBIUS_TOKEN);

  return new Response(
    JSON.stringify({ hfToken: hfTokenPresent, nebiusToken: nebiusTokenPresent }),
    {
      headers: {
        'content-type': 'application/json; charset=UTF-8',
        'Access-Control-Allow-Origin': '*',
      },
    }
  );
} 