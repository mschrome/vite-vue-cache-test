/**
 * EdgeOne Pages Webhook Handler - 最简示例
 * 
 * API 路径: /webhooks/demo
 * 
 * 支持的事件:
 * - deployment.created
 * - project.created
 * - domain.added
 */

/**
 * 验证 Bearer Token（可选）
 */
function verifyToken(authHeader, expectedToken) {
  if (!expectedToken) return true; // 未配置则跳过验证
  
  const parts = authHeader?.split(' ');
  if (parts?.length !== 2 || parts[0] !== 'Bearer') return false;
  
  return parts[1] === expectedToken;
}

/**
 * 处理 webhook 事件
 */
function handleEvent(eventType, data) {
  switch (eventType) {
    case 'deployment.created':
      console.log(`🚀 部署创建: ${data.projectName} (${data.repoBranch})`);
      // 在此添加你的业务逻辑
      // 例如: 发送通知、更新数据库等
      return { message: '部署事件已处理', projectName: data.projectName };
      
    case 'project.created':
      console.log(`📁 项目创建: ${data.projectName}`);
      return { message: '项目事件已处理', projectName: data.projectName };
      
    case 'domain.added':
      console.log(`🌐 域名添加: ${data.domainName}`);
      return { message: '域名事件已处理', domainName: data.domainName };
      
    default:
      console.log(`⚠️ 未知事件: ${eventType}`);
      return { message: '未知事件类型', eventType };
  }
}

/**
 * Node Function 入口
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 1. 健康检查
  if (request.method === 'GET') {
    return new Response(JSON.stringify({ status: 'ok', message: 'Webhook endpoint is ready' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. 只接受 POST
  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // 3. 验证 Bearer Token（可选）
    const authHeader = request.headers.get('authorization');
    const webhookToken = env.WEBHOOK_TOKEN;
    
    if (webhookToken && !verifyToken(authHeader, webhookToken)) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 4. 解析请求体
    const payload = await request.json();
    const eventType = payload.eventType || payload.type;

    // 5. 处理事件
    const result = handleEvent(eventType, payload);

    // 6. 返回成功响应
    return new Response(JSON.stringify({
      success: true,
      eventType,
      result,
      timestamp: new Date().toISOString()
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('处理错误:', error);
    return new Response(JSON.stringify({
      error: 'Internal server error',
      message: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

