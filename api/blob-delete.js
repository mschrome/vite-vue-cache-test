import { del } from '@vercel/blob';

export default async function handler(req, res) {
  // 设置 CORS 头
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 允许 DELETE 和 POST 请求
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 获取要删除的 URL
    let urls;
    
    if (req.method === 'DELETE') {
      // DELETE 请求：从查询参数获取单个 URL
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }
      urls = [url];
    } else {
      // POST 请求：从请求体获取 URL 数组（支持批量删除）
      const body = req.body;
      if (!body || !body.urls) {
        return res.status(400).json({ error: 'URLs array is required in request body' });
      }
      urls = Array.isArray(body.urls) ? body.urls : [body.urls];
    }

    if (urls.length === 0) {
      return res.status(400).json({ error: 'At least one URL is required' });
    }

    console.log('Deleting blobs:', urls);

    // 删除 Blob(s)
    if (urls.length === 1) {
      // 单个删除
      await del(urls[0]);
    } else {
      // 批量删除
      await del(urls);
    }

    console.log('Successfully deleted:', urls.length, 'blob(s)');

    return res.status(200).json({
      success: true,
      deletedCount: urls.length,
      deletedUrls: urls,
      message: `Successfully deleted ${urls.length} file(s)`
    });

  } catch (error) {
    console.error('Blob delete error:', error);
    return res.status(500).json({ 
      error: 'Failed to delete blob(s)',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 