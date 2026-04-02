/**
 * Node Function: 邮件订阅
 * 
 * 测试路径：POST /forms/newsletter
 * 请求体：{ "email": "user@example.com" }
 */

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const { email, name, preferences } = body;

    // 验证邮箱
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: '请提供有效的邮箱地址',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 模拟保存订阅信息
    const subscriptionId = Date.now().toString(36);
    
    return new Response(JSON.stringify({
      success: true,
      message: '订阅成功！欢迎加入我们的邮件列表',
      data: {
        subscriptionId,
        email,
        name: name || null,
        preferences: preferences || ['general'],
        subscribedAt: new Date().toISOString(),
        status: 'active',
        verificationRequired: true,
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '订阅失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

export async function onRequestDelete({ request }) {
  try {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return new Response(JSON.stringify({
        success: false,
        message: '请提供邮箱地址',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 模拟取消订阅
    return new Response(JSON.stringify({
      success: true,
      message: '已成功取消订阅',
      data: {
        email,
        unsubscribedAt: new Date().toISOString(),
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '取消订阅失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

