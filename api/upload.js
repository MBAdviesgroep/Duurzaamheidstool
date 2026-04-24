import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }
 
  try {
    // Lees de request body
    const body = await new Promise((resolve, reject) => {
      let data = '';
      req.on('data', chunk => (data += chunk));
      req.on('end', () => {
        try { resolve(JSON.parse(data)); }
        catch { resolve({}); }
      });
      req.on('error', reject);
    });
 
    const { payload } = body;
 
    // Genereer een client-token waarmee de browser direct naar Vercel Blob kan uploaden.
    // Deze serverless function verwerkt zelf NOOIT het bestand — geen 4.5MB limiet.
    const clientToken = await generateClientTokenFromReadWriteToken({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      pathname: payload?.pathname || `upload-${Date.now()}.pdf`,
      onUploadCompleted: {
        callbackUrl: payload?.callbackUrl || '',
      },
      maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
      allowedContentTypes: ['application/pdf', 'application/octet-stream'],
      addRandomSuffix: true,
    });
 
    return res.status(200).json({ clientToken });
 
  } catch (error) {
    console.error('Upload token error:', error);
    return res.status(500).json({ error: error.message || 'Token genereren mislukt' });
  }
}
