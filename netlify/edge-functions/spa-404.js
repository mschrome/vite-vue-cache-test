export default async (request, context) => {
  const response = await context.next()
  // 仅当未命中静态资源/函数并返回 404 时介入
  if (response.status !== 404 || request.method !== 'GET') {
    return response
  }

  // 内置路由白名单（正则）
  const url = new URL(request.url)
  const allowedRoutePatterns = [
    /^\/$/,
    /^\/test$/,
  ]
  const isKnownRoute = allowedRoutePatterns.some((re) => re.test(url.pathname))

  // 读取构建产物的 index.html 作为内容
  const origin = url.origin
  const indexUrl = `${origin}/index.html`
  const indexResp = await fetch(indexUrl)

  return new Response(indexResp.body, {
    status: isKnownRoute ? 200 : 404,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      // 继承一些常见缓存策略，可按需调整
      'Cache-Control': 'no-store'
    }
  })
}

export const config = {
  path: '/*'
}


