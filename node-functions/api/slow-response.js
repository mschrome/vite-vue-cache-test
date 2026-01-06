/**
 * Node Function: 慢响应测试（用于测试热更新）
 * 
 * 测试路径：GET /api/slow-response?delay=1000
 * delay: 延迟毫秒数，默认 1000ms
 */

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export async function onRequestGet({ request }) {
  try {
    const url = new URL(request.url);
    const delay = parseInt(url.searchParams.get('delay')) || 1000;
    
    if (delay < 0 || delay > 10000) {
      return new Response(JSON.stringify({
        success: false,
        message: '延迟时间必须在 0-10000ms 之间',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    const startTime = Date.now();
    await sleep(delay);
    const endTime = Date.now();
    const actualDelay = endTime - startTime;

    return new Response(JSON.stringify({
      success: true,
      message: `延迟 ${actualDelay}ms 后响应`,
      data: {
        requestedDelay: delay,
        actualDelay,
        startTime: new Date(startTime).toISOString(),
        endTime: new Date(endTime).toISOString(),
      },
    }), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json; charset=UTF-8',
        'X-Response-Time': `${actualDelay}ms`,
      },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '请求失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

