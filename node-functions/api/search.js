/**
 * Node Function: 搜索功能
 * 
 * 测试路径：GET /api/search?q=关键词&type=all
 * 类型：all, products, articles, users
 */

// 模拟数据
const mockData = {
  products: [
    { id: 1, name: 'iPhone 15 Pro', description: '最新款苹果手机' },
    { id: 2, name: 'MacBook Pro', description: '专业级笔记本电脑' },
    { id: 3, name: 'AirPods Pro', description: '降噪耳机' },
  ],
  articles: [
    { id: 1, title: '如何使用 EdgeOne Pages', content: 'EdgeOne Pages 是一个强大的全栈平台...' },
    { id: 2, title: 'Vue 3 最佳实践', content: '本文介绍 Vue 3 的最佳实践...' },
    { id: 3, title: 'Node.js 性能优化', content: '提升 Node.js 应用性能的技巧...' },
  ],
  users: [
    { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin' },
    { id: 2, username: 'user123', email: 'user@example.com', role: 'user' },
  ],
};

export async function onRequestGet({ request }) {
  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    const type = url.searchParams.get('type') || 'all';
    const limit = parseInt(url.searchParams.get('limit')) || 10;

    if (!query.trim()) {
      return new Response(JSON.stringify({
        success: false,
        message: '请提供搜索关键词',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    const queryLower = query.toLowerCase();
    const results = {};

    // 搜索产品
    if (type === 'all' || type === 'products') {
      results.products = mockData.products.filter(item =>
        item.name.toLowerCase().includes(queryLower) ||
        item.description.toLowerCase().includes(queryLower)
      ).slice(0, limit);
    }

    // 搜索文章
    if (type === 'all' || type === 'articles') {
      results.articles = mockData.articles.filter(item =>
        item.title.toLowerCase().includes(queryLower) ||
        item.content.toLowerCase().includes(queryLower)
      ).slice(0, limit);
    }

    // 搜索用户
    if (type === 'all' || type === 'users') {
      results.users = mockData.users.filter(item =>
        item.username.toLowerCase().includes(queryLower) ||
        item.email.toLowerCase().includes(queryLower)
      ).slice(0, limit);
    }

    // 计算总结果数
    const totalResults = Object.values(results).reduce((sum, arr) => sum + arr.length, 0);

    return new Response(JSON.stringify({
      success: true,
      query,
      type,
      totalResults,
      results,
      searchedAt: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '搜索失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

