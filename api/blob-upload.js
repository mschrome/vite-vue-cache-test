import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // 使用 Vercel 的 handleUpload 函数处理上传
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // 这里可以添加权限检查逻辑
        console.log('Uploading file:', pathname);
        console.log('Client payload:', clientPayload);
        
        // 返回访问权限配置
        return {
          allowedContentTypes: [
            'image/jpeg', 
            'image/png', 
            'image/webp', 
            'image/gif',
            'application/pdf',
            'text/plain',
            'video/mp4',
            'audio/mp3'
          ],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB 限制
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // 上传完成后的回调
        console.log('Upload completed:', blob);
        console.log('Token payload:', tokenPayload);
      },
    });

    return res.status(200).json(jsonResponse);

  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to handle upload',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

// 配置 API 路由
export const config = {
  api: {
    bodyParser: false, // 禁用默认的 body parser 以处理原始数据
  },
}; 