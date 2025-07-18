import { list } from '@vercel/blob';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get query parameters
    const { cursor, limit = '50' } = req.query;
    
    const options = {
      limit: parseInt(limit, 10),
    };
    
    if (cursor) {
      options.cursor = cursor;
    }

    // Get Blob list
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