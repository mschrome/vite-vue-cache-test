import { put } from '@vercel/blob';

export default async function handler(req, res) {
  // 只允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取查询参数中的文件名
    const { filename } = req.query;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }

    // 检查是否有请求体
    if (!req.body) {
      return res.status(400).json({ error: 'Request body is required' });
    }

    // 上传到 Vercel Blob
    const blob = await put(filename, req.body, {
      access: 'public',
    });

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
      details: error.message 
    });
  }
}

// 配置 API 路由
export const config = {
  api: {
    bodyParser: false, // 禁用默认的 body parser 以处理原始数据
  },
}; 