import { handleUpload } from '@vercel/blob/client';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }

  try {
    const body = req.body;

    const jsonResponse = await handleUpload({
      body,
      req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['application/pdf'],
        maximumSizeInBytes: 25 * 1024 * 1024,
      }),
      onUploadCompleted: async () => {},
    });

    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: error.message });
  }
}
