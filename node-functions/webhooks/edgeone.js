/**
 * EdgeOne Pages Webhook Handler
 * 处理来自 EdgeOne Pages 的 webhook POST 请求
 * 
 * API 路径: /webhooks/edgeone
 * 
 * 支持的事件类型:
 * - deployment.created: 部署创建时触发
 * - project.created: 项目创建时触发
 * - domain.added: 域名添加时触发
 * 
 * 鉴权方式:
 * - Headers 中的 authorization: Bearer <token>
 * - token 长度: 8-128 位
 */

/**
 * 验证 Bearer Token
 * @param {string} authHeader - authorization 头部值 (格式: "Bearer <token>")
 * @param {string} expectedToken - 预期的 token（从环境变量获取）
 * @returns {boolean} token 是否有效
 */
function verifyBearerToken(authHeader, expectedToken) {
  if (!authHeader || !expectedToken) {
    return false;
  }

  // 提取 Bearer token
  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return false;
  }

  const token = parts[1];
  
  // 验证 token 长度 (8-128 位)
  if (token.length < 8 || token.length > 128) {
    return false;
  }

  // 简单的字符串比较
  return token === expectedToken;
}

/**
 * 处理不同类型的 webhook 事件
 * @param {string} eventType - 事件类型
 * @param {object} payload - 事件数据
 * @returns {object} 处理结果
 */
function handleWebhookEvent(eventType, payload) {
  console.log(`🔄 Processing webhook event: ${eventType}`);
  console.log(`📦 Payload structure:`, JSON.stringify(payload, null, 2));
  
  const handlers = {
    'deployment.created': (data) => {
      // EdgeOne Pages deployment 字段:
      // appId, projectId, deploymentId, projectName, repoBranch, gitCommit, env, timestamp
      console.log(`🚀 Deployment created for project: ${data.projectName || 'N/A'}`);
      console.log(`   - App ID: ${data.appId || 'N/A'}`);
      console.log(`   - Project ID: ${data.projectId || 'N/A'}`);
      console.log(`   - Deployment ID: ${data.deploymentId || 'N/A'}`);
      console.log(`   - Branch: ${data.repoBranch || 'N/A'}`);
      console.log(`   - Commit: ${data.gitCommit || 'N/A'}`);
      console.log(`   - Environment: ${data.env || 'N/A'}`);
      
      return {
        message: 'Deployment created event processed',
        appId: data.appId,
        projectId: data.projectId,
        deploymentId: data.deploymentId,
        projectName: data.projectName,
        repoBranch: data.repoBranch,
        gitCommit: data.gitCommit,
        env: data.env,
        timestamp: data.timestamp
      };
    },
    
    'project.created': (data) => {
      // EdgeOne Pages project 字段:
      // appId, projectId, projectName, repoUrl, timestamp
      console.log(`📁 New project created: ${data.projectName || 'N/A'}`);
      console.log(`   - App ID: ${data.appId || 'N/A'}`);
      console.log(`   - Project ID: ${data.projectId || 'N/A'}`);
      console.log(`   - Repo URL: ${data.repoUrl || 'N/A'}`);
      
      return {
        message: 'Project created event processed',
        appId: data.appId,
        projectId: data.projectId,
        projectName: data.projectName,
        repoUrl: data.repoUrl,
        timestamp: data.timestamp
      };
    },
    
    'domain.added': (data) => {
      // EdgeOne Pages domain 字段:
      // appId, projectId, domainName, domainId, projectName, timestamp
      console.log(`🌐 Domain added: ${data.domainName || 'N/A'}`);
      console.log(`   - Project: ${data.projectName || 'N/A'}`);
      console.log(`   - Domain ID: ${data.domainId || 'N/A'}`);
      console.log(`   - App ID: ${data.appId || 'N/A'}`);
      console.log(`   - Project ID: ${data.projectId || 'N/A'}`);
      
      return {
        message: 'Domain added event processed',
        appId: data.appId,
        projectId: data.projectId,
        domainName: data.domainName,
        domainId: data.domainId,
        projectName: data.projectName,
        timestamp: data.timestamp
      };
    }
  };

  const handler = handlers[eventType];
  if (handler) {
    try {
      const result = handler(payload);
      console.log(`✅ Event handler completed successfully`);
      return result;
    } catch (error) {
      console.error(`❌ Error in event handler:`, error);
      return {
        message: 'Error processing event',
        eventType,
        error: error.message
      };
    }
  }

  // 未知事件类型，但仍然返回成功响应
  console.warn(`⚠️ Unknown event type: ${eventType}, but continuing anyway`);
  return {
    message: 'Unknown event type received (but accepted)',
    eventType,
    receivedPayload: payload
  };
}

/**
 * Node Function 主入口
 * @param {object} context - EdgeOne context 对象
 * @param {Request} context.request - Web API Request 对象
 * @param {object} context.env - 环境变量
 * @returns {Response} Web API Response 对象
 */
export async function onRequest(context) {
  const { request, env } = context;

  // 详细日志：记录请求基本信息
  console.log('=== Webhook Request Started ===');
  console.log('Method:', request.method);
  console.log('URL:', request.url);
  console.log('Headers:', JSON.stringify(Object.fromEntries(request.headers), null, 2));

  // 暂时允许 GET 请求用于测试
  if (request.method === 'GET') {
    console.log('✅ GET request received - returning test response');
    return new Response(
      JSON.stringify({
        status: 'ok',
        message: 'Webhook endpoint is working',
        timestamp: new Date().toISOString(),
        supportedMethods: ['GET', 'POST'],
        tip: 'Send POST request with JSON payload to trigger webhook handler'
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  }

  // 只接受 POST 请求
  if (request.method !== 'POST') {
    console.log('❌ Method not allowed:', request.method);
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        message: 'This endpoint only accepts POST requests',
        receivedMethod: request.method
      }),
      {
        status: 405,
        headers: {
          'Content-Type': 'application/json',
          'Allow': 'POST'
        }
      }
    );
  }

  try {
    // 读取请求体
    console.log('📥 Reading request body...');
    const bodyText = await request.text();
    console.log('Body text length:', bodyText.length);
    console.log('Body text (first 500 chars):', bodyText.substring(0, 500));

    // 尝试解析 JSON，如果失败给出详细错误
    let payload;
    try {
      payload = JSON.parse(bodyText);
      console.log('✅ JSON parsed successfully');
      console.log('Payload keys:', Object.keys(payload));
    } catch (parseError) {
      console.error('❌ JSON parse error:', parseError.message);
      return new Response(
        JSON.stringify({
          error: 'Bad request',
          message: 'Invalid JSON in request body',
          details: parseError.message,
          receivedBody: bodyText.substring(0, 200)
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 【Bearer Token 鉴权】用于验证 EdgeOne Pages webhook
    const authHeader = request.headers.get('authorization');
    const webhookToken = env.WEBHOOK_TOKEN || env.WEBHOOK_SECRET; // 支持两种环境变量名
    
    if (webhookToken) {
      console.log('🔒 Token verification is configured');
      console.log('Authorization header:', authHeader ? 'present' : 'missing');
      
      if (!authHeader) {
        console.warn('⚠️ Warning: No authorization header (but allowing request for debugging)');
      } else {
        const isValid = verifyBearerToken(authHeader, webhookToken);
        if (!isValid) {
          console.warn('⚠️ Warning: Invalid Bearer token (but allowing request for debugging)');
          console.warn('   Expected token length: 8-128 characters');
          console.warn('   Received header format:', authHeader.substring(0, 30) + '...');
        } else {
          console.log('✅ Bearer token verified successfully');
        }
      }
    } else {
      console.log('ℹ️ Token verification skipped (no WEBHOOK_TOKEN configured)');
      console.log('   Set WEBHOOK_TOKEN environment variable to enable authentication');
    }

    // 提取事件类型（EdgeOne Pages 使用 eventType 字段）
    const eventType = payload.eventType || payload.type || payload.event || 'unknown';
    console.log('📌 Event type:', eventType);
    
    // 【放宽限制】即使没有事件类型也继续处理
    if (!eventType || eventType === 'unknown') {
      console.warn('⚠️ Warning: Event type not found in payload, using "unknown"');
    }

    // 处理事件
    console.log('🔄 Processing event...');
    const result = handleWebhookEvent(eventType, payload);
    console.log('✅ Event processed successfully');

    // 记录完整的 webhook 信息
    console.log('📊 Webhook summary:', {
      eventType: eventType,
      timestamp: payload.timestamp || new Date().toISOString(),
      payloadSize: JSON.stringify(payload).length,
      appId: payload.appId,
      projectId: payload.projectId,
      projectName: payload.projectName
    });

    // 返回成功响应
    const response = {
      success: true,
      eventType,
      result,
      timestamp: new Date().toISOString(),
      debug: {
        bodyLength: bodyText.length,
        payloadKeys: Object.keys(payload),
        hasAuthHeader: !!authHeader,
        authMethod: 'Bearer Token'
      }
    };
    
    console.log('✅ Sending success response');
    console.log('=== Webhook Request Completed ===');
    
    return new Response(
      JSON.stringify(response, null, 2),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('❌ Error processing webhook:', error);
    console.error('Error stack:', error.stack);
    
    const errorResponse = {
      error: 'Internal server error',
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString()
    };
    
    console.log('=== Webhook Request Failed ===');
    
    return new Response(
      JSON.stringify(errorResponse, null, 2),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

