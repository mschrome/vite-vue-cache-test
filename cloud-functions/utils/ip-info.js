/**
 * Node Function: IP 信息查询
 * 
 * 测试路径：GET /utils/ip-info
 */

export async function onRequestGet({ request }) {
  try {
    // 获取客户端 IP
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
               request.headers.get('x-real-ip') ||
               '0.0.0.0';

    // 获取其他请求头信息
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const acceptLanguage = request.headers.get('accept-language') || 'Unknown';
    const referer = request.headers.get('referer') || 'Direct';

    // 模拟 IP 地理位置信息
    const ipInfo = {
      ip,
      country: '中国',
      region: '广东省',
      city: '深圳市',
      isp: '中国电信',
      timezone: 'Asia/Shanghai',
      latitude: 22.5431,
      longitude: 114.0579,
    };

    return new Response(JSON.stringify({
      success: true,
      data: {
        ...ipInfo,
        userAgent,
        language: acceptLanguage,
        referer,
        requestTime: new Date().toISOString(),
        headers: {
          'x-forwarded-for': request.headers.get('x-forwarded-for'),
          'x-real-ip': request.headers.get('x-real-ip'),
          'cf-connecting-ip': request.headers.get('cf-connecting-ip'),
        },
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '获取 IP 信息失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

