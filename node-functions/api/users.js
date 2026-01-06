/**
 * Node Function: 用户管理 API
 * 
 * GET /api/users - 获取用户列表
 * GET /api/users?id=1 - 获取单个用户
 * POST /api/users - 创建用户
 * PUT /api/users - 更新用户
 * DELETE /api/users?id=1 - 删除用户
 */

import { randomUUID } from 'node:crypto';

// 模拟用户数据
let users = [
  { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active', createdAt: new Date('2024-01-01').toISOString() },
  { id: 2, username: 'user1', email: 'user1@example.com', role: 'user', status: 'active', createdAt: new Date('2024-01-05').toISOString() },
  { id: 3, username: 'user2', email: 'user2@example.com', role: 'user', status: 'inactive', createdAt: new Date('2024-01-10').toISOString() },
];

export async function onRequestGet({ request }) {
  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const role = url.searchParams.get('role');
    const status = url.searchParams.get('status');

    if (id) {
      const user = users.find(u => u.id === parseInt(id));
      if (!user) {
        return new Response(JSON.stringify({
          success: false,
          message: '用户不存在',
        }), {
          status: 404,
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        });
      }
      return new Response(JSON.stringify({
        success: true,
        data: user,
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    let filteredUsers = [...users];
    if (role) filteredUsers = filteredUsers.filter(u => u.role === role);
    if (status) filteredUsers = filteredUsers.filter(u => u.status === status);

    return new Response(JSON.stringify({
      success: true,
      data: filteredUsers,
      total: filteredUsers.length,
      filters: { role, status },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '获取用户失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const { username, email, role = 'user', status = 'active' } = body;

    if (!username || !email) {
      return new Response(JSON.stringify({
        success: false,
        message: '用户名和邮箱都是必填项',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    const newUser = {
      id: Math.max(...users.map(u => u.id), 0) + 1,
      username,
      email,
      role,
      status,
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);

    return new Response(JSON.stringify({
      success: true,
      message: '用户创建成功',
      data: newUser,
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '创建用户失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

export async function onRequestPut({ request }) {
  try {
    const body = await request.json();
    const { id, username, email, role, status } = body;

    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: '用户不存在',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    users[index] = {
      ...users[index],
      ...(username && { username }),
      ...(email && { email }),
      ...(role && { role }),
      ...(status && { status }),
      updatedAt: new Date().toISOString(),
    };

    return new Response(JSON.stringify({
      success: true,
      message: '用户更新成功',
      data: users[index],
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '更新用户失败',
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
    const id = url.searchParams.get('id');

    if (!id) {
      return new Response(JSON.stringify({
        success: false,
        message: '请提供用户 ID',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    const index = users.findIndex(u => u.id === parseInt(id));
    if (index === -1) {
      return new Response(JSON.stringify({
        success: false,
        message: '用户不存在',
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    const deletedUser = users.splice(index, 1)[0];

    return new Response(JSON.stringify({
      success: true,
      message: '用户删除成功',
      data: deletedUser,
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '删除用户失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

