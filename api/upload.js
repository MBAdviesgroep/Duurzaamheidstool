import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';
 
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
 
    const pathname = body?.payload?.pathname || `upload-${Date.now()}.pdf`;
 
    // Genereer een client-token met ALLE opties ingebakken als JWT.
    // De browser stuurt alleen Authorization + x-api-version headers — geen CORS-problemen.
    const clientToken = await generateClientTokenFromReadWriteToken({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      pathname,
      onUploadCompleted: {
        // Vercel roept deze URL aan na succesvolle upload.
        // Moet een publiek bereikbare HTTPS URL zijn.
        callbackUrl: (body?.payload?.callbackUrl || process.env.VERCEL_URL
          ? `https://${process.env.VERCEL_URL}/api/upload`
          : ''),
      },
      maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
      allowedContentTypes: ['application/pdf', 'application/octet-stream'],
      addRandomSuffix: true,
      cacheControlMaxAge: 31536000, // 1 jaar cache
    });
 
    return res.status(200).json({ clientToken });
 
  } catch (error) {
    console.error('Upload token error:', error);
    return res.status(500).json({ error: error.message || 'Token genereren mislukt' });
  }
}
 
