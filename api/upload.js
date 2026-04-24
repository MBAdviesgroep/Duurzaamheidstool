import { put } from '@vercel/blob';

export const config = {
  api: {
    bodyParser: false, // 🔥 BELANGRIJK
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const filename = req.headers['x-filename'] || 'file.pdf';

    const blob = await put(filename, req, {
      access: 'public',
    });

    return res.status(200).json({
      url: blob.url,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Upload failed' });
  }
}
