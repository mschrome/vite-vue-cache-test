import { list } from '@vercel/blob';

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 只允许 GET 请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取查询参数
    const { cursor, limit = '50' } = req.query;
    
    const options = {
      limit: parseInt(limit, 10),
    };
    
    if (cursor) {
      options.cursor = cursor;
    }

    // 获取 Blob 列表
    const result = await list(options);

    console.log('Listed blobs:', result.blobs.length);

    return res.status(200).json({
      success: true,
      ...result,
      message: `Found ${result.blobs.length} files`
    });

  } catch (error) {
    console.error('Blob list error:', error);
    return res.status(500).json({ 
      error: 'Failed to list blobs',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 