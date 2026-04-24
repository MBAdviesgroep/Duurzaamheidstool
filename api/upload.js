import { put } from '@vercel/blob';
 
export const config = {
  api: {
    bodyParser: false,    // raw stream doorsturen naar Vercel Blob
    sizeLimit: '50mb',   // Vercel route-level override (werkt bij Pro plan)
  },
};
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }
 
  try {
    const filename = req.headers['x-filename'] || `upload-${Date.now()}.pdf`;
 
    // Stream de request body rechtstreeks naar Vercel Blob
    // Zo omzeilen we de Vercel body-parser limiet van 4.5 MB
    const blob = await put(filename, req, {
      access: 'public',
      contentType: 'application/pdf',
    });
 
    return res.status(200).json({ url: blob.url });
 
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ error: 'Upload mislukt: ' + (error.message || 'onbekend') });
  }
}
