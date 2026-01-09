/**
 * EdgeOne Pages Webhook Handler
 * 处理来自 EdgeOne Pages 的 webhook POST 请求
 * 
 * API 路径: /webhooks/edgeone
 * 
 * 支持的事件类型:
 * - deployment.created: 部署创建时触发
 * - deployment.succeeded: 部署成功时触发
 * - deployment.promoted: 部署被提升为生产环境时触发
 * - deployment.error: 部署失败时触发
 * - deployment.cancelled: 部署被取消时触发
 * - project.created: 项目创建时触发
 * - project.removed: 项目删除时触发
 * - project.renamed: 项目重命名时触发
 */

import crypto from 'crypto';

/**
 * 验证 webhook 签名
 * @param {string} payload - 请求体（字符串）
 * @param {string} signature - x-edgeone-signature 头部值
 * @param {string} secret - webhook secret（从环境变量获取）
 * @returns {boolean} 签名是否有效
 */
function verifySignature(payload, signature, secret) {
  if (!signature || !secret) {
    return false;
  }

  // 使用 HMAC-SHA256 计算签名
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expectedSignature = hmac.digest('hex');

  // 使用时间安全的比较方法
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
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
      const url = data.deployment?.url || data.url || 'N/A';
      console.log(`🚀 New deployment created: ${url}`);
      return {
        message: 'Deployment created event processed',
        deployment: url,
        data: data.deployment || {}
      };
    },
    
    'deployment.succeeded': (data) => {
      const url = data.deployment?.url || data.url || 'N/A';
      const duration = data.deployment?.buildDuration || data.buildDuration || 'N/A';
      console.log(`✅ Deployment succeeded: ${url} (duration: ${duration}ms)`);
      return {
        message: 'Deployment succeeded event processed',
        deployment: url,
        duration: duration,
        data: data.deployment || {}
      };
    },
    
    'deployment.promoted': (data) => {
      const url = data.deployment?.url || data.url || 'N/A';
      console.log(`🎉 Deployment promoted: ${url}`);
      return {
        message: 'Deployment promoted event processed',
        deployment: url,
        data: data.deployment || {}
      };
    },
    
    'deployment.error': (data) => {
      const url = data.deployment?.url || data.url || 'N/A';
      const error = data.deployment?.errorMessage || data.errorMessage || 'N/A';
      console.error(`❌ Deployment failed: ${url}`);
      console.error(`Error message: ${error}`);
      return {
        message: 'Deployment error event processed',
        deployment: url,
        error: error,
        data: data.deployment || {}
      };
    },
    
    'deployment.cancelled': (data) => {
      const url = data.deployment?.url || data.url || 'N/A';
      console.log(`🚫 Deployment cancelled: ${url}`);
      return {
        message: 'Deployment cancelled event processed',
        deployment: url,
        data: data.deployment || {}
      };
    },
    
    'project.created': (data) => {
      const name = data.project?.name || data.name || 'N/A';
      console.log(`📁 New project created: ${name}`);
      return {
        message: 'Project created event processed',
        project: name,
        data: data.project || {}
      };
    },
    
    'project.removed': (data) => {
      const name = data.project?.name || data.name || 'N/A';
      console.log(`🗑️ Project removed: ${name}`);
      return {
        message: 'Project removed event processed',
        project: name,
        data: data.project || {}
      };
    },
    
    'project.renamed': (data) => {
      const oldName = data.project?.oldName || data.oldName || 'N/A';
      const newName = data.project?.name || data.name || 'N/A';
      console.log(`✏️ Project renamed: ${oldName} → ${newName}`);
      return {
        message: 'Project renamed event processed',
        oldName: oldName,
        newName: newName,
        data: data.project || {}
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

    // 【暂时禁用签名验证】用于调试
    const signature = request.headers.get('x-edgeone-signature');
    const webhookSecret = env.WEBHOOK_SECRET;
    
    if (webhookSecret && signature) {
      console.log('🔒 Signature verification is configured');
      console.log('Signature header:', signature ? 'present' : 'missing');
      
      // 暂时只记录，不阻止请求
      const isValid = verifySignature(bodyText, signature, webhookSecret);
      if (!isValid) {
        console.warn('⚠️ Warning: Invalid signature (but allowing request for debugging)');
      } else {
        console.log('✅ Signature verified');
      }
    } else {
      console.log('ℹ️ Signature verification skipped (no secret configured or no signature header)');
    }

    // 提取事件类型（更宽松的处理）
    const eventType = payload.type || payload.event || payload.eventType || 'unknown';
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
      type: eventType,
      timestamp: new Date().toISOString(),
      payloadSize: JSON.stringify(payload).length,
      hasDeployment: !!payload.deployment,
      hasProject: !!payload.project,
      hasTeam: !!payload.team
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
        hasSignature: !!signature
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

