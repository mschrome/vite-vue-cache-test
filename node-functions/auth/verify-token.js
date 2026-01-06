/**
 * Node Function: 验证 Token
 * 
 * 测试路径：GET /auth/verify-token
 * Headers: Authorization: Bearer <token>
 */

export async function onRequestGet({ request }) {
  try {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({
        success: false,
        message: '未提供认证令牌',
      }), {
        status: 401,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    const token = authHeader.substring(7);
    
    // 模拟 Token 验证（实际应该验证 JWT 或查询数据库）
    if (token.length > 20) {
      return new Response(JSON.stringify({
        success: true,
        message: 'Token 有效',
        data: {
          userId: 1,
          username: 'admin',
          role: 'admin',
          validUntil: new Date(Date.now() + 7200000).toISOString(),
        },
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: 'Token 无效或已过期',
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '验证失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

