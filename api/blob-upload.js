import { put } from '@vercel/blob';

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
    // 获取查询参数中的文件名
    const { filename } = req.query;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required in query parameter' });
    }

    // 检查请求是否有内容
    if (!req.body && req.body !== '') {
      return res.status(400).json({ error: 'Request body is required' });
    }

    console.log('Uploading file:', filename);
    console.log('Content-Type:', req.headers['content-type']);
    console.log('Body type:', typeof req.body);

    // 上传到 Vercel Blob
    const blob = await put(filename, req.body, {
      access: 'public',
    });

    console.log('Upload successful:', blob);

    // 返回成功响应
    return res.status(200).json({
      success: true,
      blob: blob,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Blob upload error:', error);
    return res.status(500).json({ 
      error: 'Failed to upload to blob storage',
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