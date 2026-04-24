import { handleUpload } from '@vercel/blob/client';
 
export default async function handler(req, res) {
  // handleUpload verwerkt twee soorten requests:
  //   1) generate-client-token  – browser vraagt een upload-token aan
  //   2) upload-complete        – Blob stuurt bevestiging na succesvolle upload
  const body = await new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => (data += chunk));
    req.on('end', () => {
      try { resolve(JSON.parse(data)); }
      catch { resolve({}); }
    });
    req.on('error', reject);
  });
 
  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname) => {
        // Optioneel: voeg auth-checks toe voordat je een token uitgeeft
        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50 MB
        };
      },
      onUploadCompleted: async ({ blob }) => {
        // Optioneel: sla de URL op in je database
        console.log('Upload voltooid:', blob.url);
      },
    });
 
    return res.status(200).json(jsonResponse);
  } catch (error) {
    console.error('Upload handler error:', error);
    return res.status(400).json({ error: error.message });
  }
}
