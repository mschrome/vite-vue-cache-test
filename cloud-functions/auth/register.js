/**
 * Node Function: 用户注册
 * 
 * 测试路径：POST /auth/register
 * 请求体：{ "username": "newuser", "email": "user@example.com", "password": "pass123" }
 */

import { createHash, randomUUID } from 'node:crypto';

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const { username, email, password } = body;

    // 验证必填字段
    if (!username || !email || !password) {
      return new Response(JSON.stringify({
        success: false,
        message: '用户名、邮箱和密码都是必填项',
        errors: {
          username: !username ? '用户名不能为空' : null,
          email: !email ? '邮箱不能为空' : null,
          password: !password ? '密码不能为空' : null,
        },
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({
        success: false,
        message: '邮箱格式不正确',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 验证密码强度
    if (password.length < 6) {
      return new Response(JSON.stringify({
        success: false,
        message: '密码长度至少为6位',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 模拟密码加密
    const passwordHash = createHash('sha256').update(password).digest('hex');

    // 模拟用户创建（实际应该写入数据库）
    const userId = randomUUID();
    
    return new Response(JSON.stringify({
      success: true,
      message: '注册成功',
      data: {
        userId,
        username,
        email,
        createdAt: new Date().toISOString(),
      },
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '注册失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

