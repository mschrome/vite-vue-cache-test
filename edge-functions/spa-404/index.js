// EdgeOne Pages - SPA fallback with proper 200/404 status codes
// - Known frontend routes → return index.html with 200
// - Unknown routes → return index.html with 404
// - Static assets and APIs should NOT be routed here; configure rewrites so
//   this function only runs after filesystem misses.

const allowedRoutePatterns = [
  /^\/$/,
  /^\/test$/,
]

export async function onRequest(context) {
  const { request } = context
  const url = new URL(request.url)

  // Only handle GET requests; others should not be routed here
  if (request.method !== 'GET') {
    return new Response('Method Not Allowed', { status: 405 })
  }

  // Determine if the path is a known frontend route
  const isKnownRoute = allowedRoutePatterns.some((re) => re.test(url.pathname))

  // Always render SPA shell (index.html)
  const indexResp = await fetch(new URL('/index.html', url))

  return new Response(indexResp.body, {
    status: isKnownRoute ? 200 : 404,
    headers: {
      'content-type': 'text/html; charset=utf-8',
      'cache-control': 'no-store',
    },
  })
}


