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
  console.log(`Processing webhook event: ${eventType}`);
  
  const handlers = {
    'deployment.created': (data) => {
      console.log(`🚀 New deployment created: ${data.deployment?.url || 'N/A'}`);
      return {
        message: 'Deployment created event processed',
        deployment: data.deployment?.url
      };
    },
    
    'deployment.succeeded': (data) => {
      console.log(`✅ Deployment succeeded: ${data.deployment?.url || 'N/A'}`);
      return {
        message: 'Deployment succeeded event processed',
        deployment: data.deployment?.url,
        duration: data.deployment?.buildDuration
      };
    },
    
    'deployment.promoted': (data) => {
      console.log(`🎉 Deployment promoted: ${data.deployment?.url || 'N/A'}`);
      return {
        message: 'Deployment promoted event processed',
        deployment: data.deployment?.url
      };
    },
    
    'deployment.error': (data) => {
      console.error(`❌ Deployment failed: ${data.deployment?.url || 'N/A'}`);
      return {
        message: 'Deployment error event processed',
        deployment: data.deployment?.url,
        error: data.deployment?.errorMessage
      };
    },
    
    'deployment.cancelled': (data) => {
      console.log(`🚫 Deployment cancelled: ${data.deployment?.url || 'N/A'}`);
      return {
        message: 'Deployment cancelled event processed',
        deployment: data.deployment?.url
      };
    },
    
    'project.created': (data) => {
      console.log(`📁 New project created: ${data.project?.name || 'N/A'}`);
      return {
        message: 'Project created event processed',
        project: data.project?.name
      };
    },
    
    'project.removed': (data) => {
      console.log(`🗑️ Project removed: ${data.project?.name || 'N/A'}`);
      return {
        message: 'Project removed event processed',
        project: data.project?.name
      };
    },
    
    'project.renamed': (data) => {
      console.log(`✏️ Project renamed: ${data.project?.oldName} → ${data.project?.name}`);
      return {
        message: 'Project renamed event processed',
        oldName: data.project?.oldName,
        newName: data.project?.name
      };
    }
  };

  const handler = handlers[eventType];
  if (handler) {
    return handler(payload);
  }

  console.warn(`⚠️ Unknown event type: ${eventType}`);
  return {
    message: 'Unknown event type',
    eventType
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

  // 只接受 POST 请求
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({
        error: 'Method not allowed',
        message: 'This endpoint only accepts POST requests'
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
    const bodyText = await request.text();
    const payload = JSON.parse(bodyText);

    // 获取签名头（如果启用了签名验证）
    const signature = request.headers.get('x-edgeone-signature');
    const webhookSecret = env.WEBHOOK_SECRET; // 从环境变量获取

    // 如果配置了 secret，则验证签名
    if (webhookSecret) {
      const isValid = verifySignature(bodyText, signature, webhookSecret);
      
      if (!isValid) {
        console.error('❌ Invalid webhook signature');
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: 'Invalid webhook signature'
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      }
      
      console.log('✅ Webhook signature verified');
    }

    // 提取事件类型
    const eventType = payload.type || payload.event;
    
    if (!eventType) {
      return new Response(
        JSON.stringify({
          error: 'Bad request',
          message: 'Missing event type in payload'
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    // 处理事件
    const result = handleWebhookEvent(eventType, payload);

    // 记录完整的 webhook 信息
    console.log('Webhook details:', {
      type: eventType,
      timestamp: new Date().toISOString(),
      payload: JSON.stringify(payload, null, 2)
    });

    // 返回成功响应
    return new Response(
      JSON.stringify({
        success: true,
        eventType,
        result,
        timestamp: new Date().toISOString()
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: error.message,
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

