import OpenAI from 'openai';
 
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST allowed' });
  }
 
  try {
    const { energiescan_url, brochure_url, notities, system_prompt } = req.body;
 
    if (!energiescan_url) {
      return res.status(400).json({ error: 'Energiescan URL ontbreekt.' });
    }
 
    const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
 
    const content = [
      {
        type: 'input_text',
        text:
          (system_prompt || 'Maak een professioneel MB Adviesgroep verduurzamingsrapport in JSON.') +
          (notities ? '\n\nExtra toelichting:\n' + notities : ''),
      },
      {
        type: 'input_file',
        file_url: energiescan_url,
      },
    ];
 
    if (brochure_url) {
      content.push({ type: 'input_file', file_url: brochure_url });
    }
 
    let response;
    try {
      response = await client.responses.create({
        model: 'gpt-4.1',
        input: [{ role: 'user', content }],
      });
    } catch (firstErr) {
      // Bij rate limit (429) automatisch naar mini-model met hogere TPM limieten
      if (firstErr?.status === 429 || (firstErr?.message || '').includes('429')) {
        response = await client.responses.create({
          model: 'gpt-4.1-mini',
          input: [{ role: 'user', content }],
        });
      } else {
        throw firstErr;
      }
    }
 
    return res.status(200).json({ success: true, data: response.output_text });
 
  } catch (error) {
    console.error('Generate-report error:', error);
    return res.status(500).json({ error: error.message || 'AI verwerking mislukt' });
  }
}
