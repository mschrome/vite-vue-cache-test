/**
 * Node Function: 哈希工具
 * 
 * 测试路径：
 * POST /utils/hash
 * 请求体：{ "text": "Hello World", "algorithm": "sha256" }
 * 支持算法：md5, sha1, sha256, sha512
 */

import { createHash } from 'node:crypto';

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const { text, algorithm = 'sha256' } = body;

    if (!text) {
      return new Response(JSON.stringify({
        success: false,
        message: '请提供要哈希的文本',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    const supportedAlgorithms = ['md5', 'sha1', 'sha256', 'sha512'];
    if (!supportedAlgorithms.includes(algorithm)) {
      return new Response(JSON.stringify({
        success: false,
        message: `不支持的算法: ${algorithm}`,
        supportedAlgorithms,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 生成多种哈希
    const hashes = {};
    for (const algo of supportedAlgorithms) {
      hashes[algo] = createHash(algo).update(text, 'utf8').digest('hex');
    }

    return new Response(JSON.stringify({
      success: true,
      data: {
        input: text,
        inputLength: text.length,
        hashes,
        primary: {
          algorithm,
          hash: hashes[algorithm],
        },
      },
      generatedAt: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '哈希生成失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

