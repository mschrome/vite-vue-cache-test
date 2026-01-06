/**
 * Node Function: 缓存测试
 * 
 * 测试路径：
 * GET /api/cache-test - 测试响应缓存
 * GET /api/cache-test?no-cache=1 - 禁用缓存
 */

export async function onRequestGet({ request }) {
  try {
    const url = new URL(request.url);
    const noCache = url.searchParams.get('no-cache');
    const timestamp = new Date().toISOString();
    const randomValue = Math.random();

    const cacheControl = noCache 
      ? 'no-store, no-cache, must-revalidate'
      : 'public, max-age=60, s-maxage=60'; // 缓存 60 秒

    return new Response(JSON.stringify({
      success: true,
      message: '缓存测试响应',
      data: {
        timestamp,
        randomValue,
        cached: !noCache,
        cacheMaxAge: noCache ? 0 : 60,
        tip: '如果看到相同的 timestamp 和 randomValue，说明响应被缓存了',
      },
    }, null, 2), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json; charset=UTF-8',
        'Cache-Control': cacheControl,
        'X-Cache-Test': 'true',
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '缓存测试失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

