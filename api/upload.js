import { handleUpload } from '@vercel/blob/client';
 
// Body parser AAN laten — handleUpload leest request.body zelf
export default async function handler(request, response) {
  const body = request.body;
 
  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: ['application/pdf', 'application/octet-stream'],
          addRandomSuffix: true,
          maximumSizeInBytes: 50 * 1024 * 1024,
        };
      },
      onUploadCompleted: async ({ blob }) => {
        console.log('Upload voltooid:', blob.url);
      },
    });
 
    return response.status(200).json(jsonResponse);
  } catch (error) {
    return response.status(400).json({ error: error.message });
  }
}
 
