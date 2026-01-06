/**
 * Node Function: 联系表单处理
 * 
 * 测试路径：POST /forms/contact
 * 请求体：{ "name": "张三", "email": "zhang@example.com", "message": "你好" }
 */

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const { name, email, message, phone } = body;

    // 验证必填字段
    const errors = {};
    
    if (!name || name.trim().length === 0) {
      errors.name = '姓名不能为空';
    }
    
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = '请提供有效的邮箱地址';
    }
    
    if (!message || message.trim().length === 0) {
      errors.message = '留言内容不能为空';
    } else if (message.length > 1000) {
      errors.message = '留言内容不能超过1000字';
    }

    if (Object.keys(errors).length > 0) {
      return new Response(JSON.stringify({
        success: false,
        message: '表单验证失败',
        errors,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    // 模拟发送邮件或保存到数据库
    const contactId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    return new Response(JSON.stringify({
      success: true,
      message: '感谢您的留言，我们会尽快回复！',
      data: {
        contactId,
        name,
        email,
        phone: phone || null,
        message,
        submittedAt: new Date().toISOString(),
        status: 'pending',
      },
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '提交失败，请稍后重试',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

