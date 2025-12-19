/**
 * Node Function: 正确测试 included_files（模块加载时读取）
 * 
 * 关键点：
 * 1. 在模块加载时（顶层作用域）读取所有静态文件
 * 2. included_files 确保这些文件在模块加载时可用
 * 3. 请求时直接使用已读取的内容，不再访问文件系统
 * 
 * Test URL:
 * - /test-included-files-final?file=config
 * - /test-included-files-final?file=secret
 */

import { readFileSync } from 'fs';

// 🎯 关键：在模块加载时读取所有文件（不是在请求时）
// included_files 配置确保这些文件在此时可用

let assetsData = {};
let loadErrors = [];

try {
  // 读取 assets/ 目录的文件
  assetsData.config = readFileSync('./public/assets/config.json', 'utf-8');
  console.log('✅ 成功加载 config.json');
} catch (error) {
  loadErrors.push({ file: 'config.json', error: error.message });
  console.error('❌ 加载 config.json 失败:', error.message);
}

try {
  assetsData.data = readFileSync('./public/assets/data.md', 'utf-8');
  console.log('✅ 成功加载 data.md');
} catch (error) {
  loadErrors.push({ file: 'data.md', error: error.message });
  console.error('❌ 加载 data.md 失败:', error.message);
}

// 读取 assets2/ 目录的文件
try {
  assetsData.secret = readFileSync('./public/assets2/secret.txt', 'utf-8');
  console.log('✅ 成功加载 secret.txt');
} catch (error) {
  loadErrors.push({ file: 'secret.txt', error: error.message });
  console.error('❌ 加载 secret.txt 失败:', error.message);
}

try {
  assetsData.metadata = readFileSync('./public/assets2/metadata.json', 'utf-8');
  console.log('✅ 成功加载 metadata.json');
} catch (error) {
  loadErrors.push({ file: 'metadata.json', error: error.message });
  console.error('❌ 加载 metadata.json 失败:', error.message);
}

// 模块加载完成日志
console.log('📦 模块加载完成，已读取文件：', Object.keys(assetsData));
if (loadErrors.length > 0) {
  console.error('⚠️  部分文件加载失败：', loadErrors);
}

// 导出请求处理函数
export function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const fileParam = url.searchParams.get('file') || 'all';
  
  // 🎯 请求时直接使用已加载的数据，不再读取文件系统
  
  if (fileParam === 'all') {
    // 返回所有已加载的文件信息
    return new Response(JSON.stringify({
      success: true,
      loadedAt: 'module initialization',
      files: Object.keys(assetsData),
      loadErrors: loadErrors,
      totalFiles: Object.keys(assetsData).length,
      totalErrors: loadErrors.length,
      message: `✅ 模块加载时已读取 ${Object.keys(assetsData).length} 个文件`,
      data: assetsData,
      explanation: {
        key: 'included_files 的正确用法',
        correct: '在模块加载时（顶层作用域）读取文件',
        incorrect: '在请求处理函数内读取文件',
        advantage: '每次请求不需要访问文件系统，性能更好'
      }
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
  
  // 返回指定文件的内容
  const fileMap = {
    'config': { key: 'config', name: 'config.json' },
    'data': { key: 'data', name: 'data.md' },
    'secret': { key: 'secret', name: 'secret.txt' },
    'metadata': { key: 'metadata', name: 'metadata.json' }
  };
  
  const fileInfo = fileMap[fileParam];
  
  if (!fileInfo) {
    return new Response(JSON.stringify({
      success: false,
      error: 'Invalid file parameter',
      available: Object.keys(fileMap),
      message: '请使用有效的文件参数：config, data, secret, metadata, 或 all'
    }, null, 2), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
  
  if (!assetsData[fileInfo.key]) {
    // 文件在模块加载时未能读取
    const error = loadErrors.find(e => e.file === fileInfo.name);
    return new Response(JSON.stringify({
      success: false,
      error: 'File not loaded at module initialization',
      fileName: fileInfo.name,
      loadError: error,
      message: `❌ 文件 ${fileInfo.name} 在模块加载时读取失败`
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
  
  // 返回已加载的文件内容
  return new Response(JSON.stringify({
    success: true,
    fileName: fileInfo.name,
    loadedAt: 'module initialization',
    content: assetsData[fileInfo.key],
    contentLength: assetsData[fileInfo.key].length,
    message: `✅ 返回模块加载时读取的内容（无需访问文件系统）`
  }, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    }
  });
}
