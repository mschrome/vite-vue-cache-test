export default async (request, context) => {
  const response = await context.next()
  // 仅当未命中静态资源/函数并返回 404 时介入
  if (response.status !== 404 || request.method !== 'GET') {
    return response
  }

  // 读取构建产物的 index.html 作为内容
  const url = new URL(request.url)
  const origin = url.origin
  const indexUrl = `${origin}/index.html`
  const indexResp = await fetch(indexUrl)

  return new Response(indexResp.body, {
    status: 404,
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


