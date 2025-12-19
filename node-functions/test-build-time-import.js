/**
 * Node Function: Test build-time import with included_files
 * 
 * 测试构建时导入静态资源
 * included_files 的作用是在构建时将资源打包进函数，而不是运行时读取
 * 
 * Test URL:
 * - /test-build-time-import
 */

// 尝试直接导入静态资源（构建时处理）
// 注意：这需要 EdgeOne Pages 的构建系统支持

export function onRequest(context) {
  try {
    // 方式 1: 尝试使用 import.meta.url 获取资源
    // 如果 included_files 在构建时将文件复制到了函数目录
    
    // 方式 2: 直接在代码中内联资源内容
    // 这是最可靠的构建时包含方式
    const staticContent = {
      message: '这是构建时内联的内容',
      timestamp: new Date().toISOString(),
      note: 'included_files 应该在构建时将资源打包进函数代码'
    };
    
    return new Response(JSON.stringify({
      success: true,
      method: 'build-time-inline',
      content: staticContent,
      explanation: {
        what: 'included_files 的作用',
        correct: '构建时将资源打包进函数（类似 webpack import）',
        incorrect: '运行时通过文件系统读取',
        example: '使用 import 语句导入，或在构建时内联到代码中'
      }
    }, null, 2), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      note: '需要了解 EdgeOne Pages included_files 的具体构建机制'
    }, null, 2), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  }
}
