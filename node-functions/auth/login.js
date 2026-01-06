/**
 * Node Function: 用户登录
 * 
 * 测试路径：POST /auth/login
 * 请求体：{ "username": "admin", "password": "123456" }
 */

import { randomUUID } from 'node:crypto';

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const { username, password } = body;

    // 模拟用户验证
    if (!username || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: '用户名和密码不能为空',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 模拟验证逻辑（实际应该查询数据库）
    if (username === 'admin' && password === '123456') {
      const token = randomUUID();
      
      return new Response(JSON.stringify({
        success: true,
        message: '登录成功',
        data: {
          token,
          user: {
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            role: 'admin',
          },
          expiresIn: 7200, // 2小时
        },
        timestamp: new Date().toISOString(),
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json; charset=UTF-8',
          'Set-Cookie': `token=${token}; HttpOnly; Max-Age=7200; Path=/`,
        },
      });
    }

    return new Response(JSON.stringify({
      success: false,
      message: '用户名或密码错误',
    }), {
      status: 401,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '登录失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

