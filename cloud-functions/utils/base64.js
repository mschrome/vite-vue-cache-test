/**
 * Node Function: Base64 编码/解码
 * 
 * 测试路径：
 * POST /utils/base64
 * 请求体：{ "text": "Hello World", "action": "encode" }
 * action: encode 或 decode
 */

export async function onRequestPost({ request }) {
  try {
    const body = await request.json();
    const { text, action = 'encode' } = body;

    if (!text) {
      return new Response(JSON.stringify({
        success: false,
        message: '请提供要处理的文本',
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    let result;
    let error = null;

    try {
      if (action === 'encode') {
        result = Buffer.from(text, 'utf-8').toString('base64');
      } else if (action === 'decode') {
        result = Buffer.from(text, 'base64').toString('utf-8');
      } else {
        return new Response(JSON.stringify({
          success: false,
          message: 'action 必须是 encode 或 decode',
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json; charset=UTF-8' },
        });
      }
    } catch (e) {
      error = e.message;
    }

    if (error) {
      return new Response(JSON.stringify({
        success: false,
        message: `${action === 'encode' ? '编码' : '解码'}失败`,
        error,
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json; charset=UTF-8' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      action,
      input: text,
      output: result,
      inputLength: text.length,
      outputLength: result.length,
      processedAt: new Date().toISOString(),
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });

  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      message: '处理失败',
      error: error.message,
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    });
  }
}

