import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;

    // Use Vercel handleUpload function to process upload
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Permission check logic can be added here
        console.log('Uploading file:', pathname);
        console.log('Client payload:', clientPayload);
        
        // Return access permission configuration
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
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB limit
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Callback after upload completed
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

// Configure API route
export const config = {
  api: {
    bodyParser: false, // Disable default body parser to handle raw data
  },
}; 