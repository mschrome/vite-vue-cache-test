import { put } from '@vercel/blob';
import formidable from 'formidable';
import fs from 'fs';

export const config = {
  api: {
    bodyParser: false, // 禁用内置 bodyParser，使用 formidable 解析 multipart
  },
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // 用 formidable 解析 multipart/form-data
    const form = new formidable.IncomingForm();
    form.parse(req, async (err, fields, files) => {
      if (err) {
        return res.status(400).json({ error: 'Failed to parse form data', details: err.message });
      }
      const file = files.file;
      if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      const filename = file.originalFilename || file.newFilename || 'upload.bin';
      const fileStream = fs.createReadStream(file.filepath);
      try {
        const blob = await put(filename, fileStream, {
          access: 'public',
        });
        return res.status(200).json({
          success: true,
          blob,
          message: 'File uploaded via server successfully',
        });
      } catch (uploadErr) {
        return res.status(500).json({ error: 'Failed to upload to blob', details: uploadErr.message });
      }
    });
  } catch (error) {
    return res.status(500).json({ error: 'Unexpected error', details: error.message });
  }
} 