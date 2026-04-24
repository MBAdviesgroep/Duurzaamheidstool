import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const {
      energiescan_url,
      brochure_url,
      notities,
      system_prompt
    } = req.body;

    if (!energiescan_url) {
      return res.status(400).json({ error: "Energiescan ontbreekt." });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const content = [
      {
        type: "input_text",
        text:
          (system_prompt || "Maak een professioneel MB Adviesgroep verduurzamingsrapport in JSON.") +
          "\n\nExtra toelichting:\n" +
          (notities || "")
      },
      {
        type: "input_file",
        file_url: energiescan_url
      }
    ];

    if (brochure_url) {
      content.push({
        type: "input_file",
        file_url: brochure_url
      });
    }

    const response = await client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: response.output_text
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: error.message || "AI verwerking mislukt"
    });
  }
}
