/**
 * Node Function: Test simple string relative path
 * 
 * 使用字符串相对路径 + included_files 配置
 * 
 * 注意：本地开发和云函数环境目录结构不同：
 * - 本地：.edgeone/node-functions/ → 需要 ../../public/assets/
 * - 云函数：node-functions/ → 需要 ../assets/
 * 
 * Test URLs:
 * - /test-simple-path?file=config.json
 * - /test-simple-path?file=secret.txt
 */

import { readFileSync, existsSync } from 'fs';

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const fileName = url.searchParams.get('file') || 'config.json';
  
  // 判断文件在哪个目录
  const assetDir = fileName.includes('secret.txt') || fileName.includes('metadata.json') 
    ? 'assets2' 
    : 'assets';
  
  // 🎯 尝试两个可能的路径（本地开发 vs 云函数）
  const possiblePaths = [
    `./public/${assetDir}/${fileName}`,  // 本地开发
    // `../${assetDir}/${fileName}`,             // 云函数部署
  ];
  
  try {
    
    let filePath = null;
    let content = null;
    
    // 尝试读取
    for (const path of possiblePaths) {
      try {
        console.log('=====path1=====', path, existsSync(path));
        if (true) {
          filePath = path;
          content = readFileSync(path, 'utf-8');
          break;
        }
      } catch (e) {
        // 继续尝试下一个路径
      }
    }
    
    if (!filePath || !content) {
      throw new Error('File not found in any expected location');
    }
    
    // 确定内容类型
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
      contentType,
      content,
      fileSize: content.length,
      processCwd: process.cwd(),
      environment: filePath.includes('public') ? '本地开发' : '云函数',
      message: '✅ 成功！使用字符串相对路径 + included_files 配置'
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
      code: error.code,
      processCwd: process.cwd(),
      requestedFile: fileName,
      triedPaths: possiblePaths,
      message: '❌ 失败：文件未找到。确保已构建项目（npm run build）'
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
