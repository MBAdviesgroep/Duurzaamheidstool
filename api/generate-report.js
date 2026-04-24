import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const completion = await client.responses.create({
      model: "gpt-4.1",
      input: `
Maak een professioneel MB Adviesgroep verduurzamingsrapport.

Geef JSON terug met:
- object_naam
- adres
- jaarlijkse_besparing
- bruto_investering
- netto_investering
- maatregelen (array)
- subsidies
- fases
      `,
    });

    res.status(200).json({
      success: true,
      data: completion.output_text,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "AI verwerking mislukt",
    });
  }
}
