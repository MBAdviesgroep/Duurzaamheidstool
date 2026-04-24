import OpenAI from "openai";
import formidable from "formidable";
import fs from "fs";

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const form = new formidable.IncomingForm();

  form.parse(req, async (err, fields, files) => {
    try {
      if (err) {
        return res.status(500).json({ error: "Upload fout" });
      }

      const client = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });

      const energiescan = files.energiescan;
      const brochure = files.brochure;

      const input = [];

      if (energiescan) {
        const fileData = fs.readFileSync(energiescan.filepath);
        input.push({
          role: "user",
          content: [
            {
              type: "input_file",
              file_data: fileData.toString("base64"),
              filename: "energiescan.pdf",
            },
          ],
        });
      }

      if (brochure) {
        const fileData = fs.readFileSync(brochure.filepath);
        input.push({
          role: "user",
          content: [
            {
              type: "input_file",
              file_data: fileData.toString("base64"),
              filename: "brochure.pdf",
            },
          ],
        });
      }

      input.push({
        role: "user",
        content: "Analyseer deze documenten en maak een volledig verduurzamingsrapport in JSON.",
      });

      const response = await client.responses.create({
        model: "gpt-4.1",
        input,
      });

      res.status(200).json({
        success: true,
        data: response.output_text,
      });

    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "AI fout" });
    }
  });
}
