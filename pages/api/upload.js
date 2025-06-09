import { OpenAI } from 'openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({ uploadDir: "/tmp", keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  try {
    const { files } = await parseForm(req);
    const audioFile = files.file;

    // ✅ Fix: Read file as buffer instead of stream
    const fileBuffer = fs.readFileSync(audioFile.path);

    const transcription = await openai.audio.transcriptions.create({
      file: fileBuffer,
      filename: audioFile.originalFilename,
      model: "whisper-1",
    });

    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: "You are a meeting assistant. Summarize the transcript clearly, then list key decisions and action steps. Keep it clean and professional."
        },
        {
          role: "user",
          content: transcription.text,
        }
      ],
      temperature: 0.5,
    });

    res.status(200).json({ summary: gptResponse.choices[0].message.content });
  } catch (err) {
    console.error('Upload API error:', err);
    res.status(500).json({ error: "Error summarizing the meeting" });
  }
}
