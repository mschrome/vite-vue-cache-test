import { del } from '@vercel/blob';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'DELETE, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Allow DELETE and POST requests
  if (req.method !== 'DELETE' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // Get URLs to delete
    let urls;
    
    if (req.method === 'DELETE') {
      // DELETE request: get single URL from query parameters
      const { url } = req.query;
      if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
      }
      urls = [url];
    } else {
      // POST request: get URL array from request body (supports batch delete)
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

    // Delete Blob(s)
    if (urls.length === 1) {
      // Single delete
      await del(urls[0]);
    } else {
      // Batch delete
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