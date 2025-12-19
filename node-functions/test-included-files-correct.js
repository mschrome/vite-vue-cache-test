/**
 * Node Function: 正确测试 included_files
 * 
 * 根据用户纠正：
 * 1. 所有路径都是相对项目根目录
 * 2. 构建时处理静态文件
 * 
 * Test URL:
 * - /test-included-files-correct?file=config.json
 * - /test-included-files-correct?file=secret.txt
 */

import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const fileName = url.searchParams.get('file') || 'config.json';
  
  try {
    // 判断文件在哪个目录
    const assetDir = fileName.includes('secret.txt') || fileName.includes('metadata.json') 
      ? 'assets2' 
      : 'assets';
    
    // 🎯 关键：路径相对项目根目录
    // edgeone.json 配置：public/assets/**
    // 代码使用：./public/assets/file
    const filePath = `./public/${assetDir}/${fileName}`;
    
    // 调试信息
    const debugInfo = {
      requestedFile: fileName,
      constructedPath: filePath,
      processCwd: process.cwd(),
      dirname: __dirname,
      fileExists: existsSync(filePath)
    };
    
    // 尝试读取
    if (!existsSync(filePath)) {
      // 如果文件不存在，尝试其他可能的路径
      const alternativePaths = [
        filePath,
        `./${assetDir}/${fileName}`,
        `../public/${assetDir}/${fileName}`,
        `../../public/${assetDir}/${fileName}`,
        `../../../public/${assetDir}/${fileName}`,
      ];
      
      let foundPath = null;
      for (const altPath of alternativePaths) {
        if (existsSync(altPath)) {
          foundPath = altPath;
          break;
        }
      }
      
      if (!foundPath) {
        return new Response(JSON.stringify({
          success: false,
          error: 'File not found',
          debug: debugInfo,
          triedPaths: alternativePaths.map(p => ({
            path: p,
            exists: existsSync(p)
          })),
          message: '文件未找到。included_files 可能还未生效，或路径配置不正确。'
        }, null, 2), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // 使用找到的路径
      const content = readFileSync(foundPath, 'utf-8');
      
      return new Response(JSON.stringify({
        success: true,
        fileName,
        actualPath: foundPath,
        originalPath: filePath,
        content,
        fileSize: content.length,
        debug: debugInfo,
        message: '✅ 成功读取文件（使用备用路径）'
      }, null, 2), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // 文件存在，直接读取
    const content = readFileSync(filePath, 'utf-8');
    
    return new Response(JSON.stringify({
      success: true,
      fileName,
      filePath,
      content,
      fileSize: content.length,
      debug: debugInfo,
      message: '✅ 成功读取文件'
    }, null, 2), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      code: error.code,
      stack: error.stack,
      processCwd: process.cwd(),
      message: '❌ 读取失败'
    }, null, 2), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
