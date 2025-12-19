/**
 * Node Function: Test string-based relative paths
 * 
 * 严格按照字符串相对路径的方式读取文件
 * 对比 URL 对象方式和字符串路径方式的区别
 * 
 * Test URLs:
 * - /test-string-path?file=config.json (GET)
 * - /test-string-path?file=secret.txt (GET)
 */

import { readFileSync, existsSync } from 'fs';

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const fileName = url.searchParams.get('file') || 'config.json';
  
  try {
    // Determine which directory to read from
    const assetDir = fileName.includes('secret.txt') || fileName.includes('metadata.json') 
      ? 'assets2' 
      : 'assets';
    
    // 使用纯字符串相对路径（相对于 process.cwd()）
    // ⚠️ 注意：这种方式依赖启动目录，不推荐但可以用来测试
    const possiblePaths = [
      // 尝试各种可能的相对路径
      `../../assets/${fileName}`,
      `../../public/assets/${fileName}`,
      `../../public/assets2/${fileName}`,
      `../assets/${fileName}`,
      `../public/assets/${fileName}`,
      `./assets/${fileName}`,
      `./public/assets/${fileName}`,
      `assets/${fileName}`,
      `public/assets/${fileName}`,
      `public/assets2/${fileName}`,
    ];
    
    let filePath = null;
    let searchedPaths = [];
    
    // Try each possible path
    for (const path of possiblePaths) {
      searchedPaths.push(path);
      try {
        if (existsSync(path)) {
          filePath = path;
          break;
        }
      } catch (err) {
        // 忽略错误，继续尝试
      }
    }
    
    // Check if file exists
    if (!filePath) {
      return new Response(JSON.stringify({
        success: false,
        error: 'File not found',
        requestedFile: fileName,
        searchedPaths: searchedPaths,
        processCwd: process.cwd(),
        message: 'String-based relative paths - all attempts failed',
        tip: 'This demonstrates why string paths are unreliable'
      }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
        }
      });
    }
    
    // Read file content
    const content = readFileSync(filePath, 'utf-8');
    
    // Determine content type
    let contentType = 'text/plain';
    if (fileName.endsWith('.json')) {
      contentType = 'application/json';
    } else if (fileName.endsWith('.md')) {
      contentType = 'text/markdown';
    }
    
    return new Response(JSON.stringify({
      success: true,
      fileName,
      filePath,
      processCwd: process.cwd(),
      contentType,
      content,
      fileSize: content.length,
      message: '✅ Successfully read file via string-based relative paths'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      stack: error.stack,
      processCwd: process.cwd(),
      message: 'Failed to read file using string paths'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
