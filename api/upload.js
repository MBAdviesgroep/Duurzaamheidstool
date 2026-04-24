import { handleUpload } from '@vercel/blob/client';
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }
 
  try {
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({}); }
      });
      req.on('error', reject);
    });
 
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['application/pdf', 'application/octet-stream'],
          maximumSizeInBytes: 50 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Wordt aangeroepen door Vercel na voltooide upload — geen actie nodig
        console.log('Upload voltooid:', blob.url);
      },
    });
 
    return res.status(200).json(jsonResponse);
 
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: error.message || 'Upload mislukt' });
  }
}
 
