/**
 * Node Function: 二维码生成
 * 
 * 测试路径：GET /api/qrcode?text=Hello
 */

export async function onRequestGet({ request }) {
  try {
    const url = new URL(request.url);
    const text = url.searchParams.get('text') || 'https://edgeone.ai';
    const size = parseInt(url.searchParams.get('size')) || 200;

    if (!text) {
      return new Response(JSON.stringify({
        success: false,
        message: '请提供要编码的文本',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 使用 Google Charts API 生成二维码（简单方案）
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${size}x${size}&chl=${encodeURIComponent(text)}`;

    // 返回 JSON，包含二维码 URL
    return new Response(JSON.stringify({
      success: true,
      data: {
        text,
        size,
        qrCodeUrl: qrUrl,
        generatedAt: new Date().toISOString(),
      },
      usage: `<img src="${qrUrl}" alt="QR Code" />`,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '生成二维码失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

