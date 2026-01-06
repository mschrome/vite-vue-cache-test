/**
 * Node Function: UUID 生成器
 * 
 * 测试路径：
 * GET /utils/uuid - 生成单个 UUID
 * GET /utils/uuid?count=10 - 生成多个 UUID
 */

import { randomUUID } from 'node:crypto';

export async function onRequestGet({ request }) {
  try {
    const url = new URL(request.url);
    const count = parseInt(url.searchParams.get('count')) || 1;
    const format = url.searchParams.get('format') || 'default'; // default, uppercase, no-dashes

    if (count < 1 || count > 100) {
      return new Response(JSON.stringify({
        success: false,
        message: '数量必须在 1-100 之间',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    const uuids = [];
    for (let i = 0; i < count; i++) {
      let uuid = randomUUID();
      
      if (format === 'uppercase') {
        uuid = uuid.toUpperCase();
      } else if (format === 'no-dashes') {
        uuid = uuid.replace(/-/g, '');
      }
      
      uuids.push(uuid);
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        uuids,
        count: uuids.length,
        format,
      },
      generatedAt: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: 'UUID 生成失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

