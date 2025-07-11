import { put } from '@vercel/blob';

export const config = { api: { bodyParser: false } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  try {
    const filename = req.query.filename || req.headers['x-filename'] || 'upload.bin';
    const blob = await put(filename, req, {
      access: 'public',
      addRandomSuffix: true,
    });
    res.status(200).json({ success: true, blob, message: 'File uploaded via server successfully', mode: 'server' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
} 