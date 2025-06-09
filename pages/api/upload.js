import { OpenAI } from 'openai';
import formidable from 'formidable';
import fs from 'fs';

export const config = { api: { bodyParser: false } };

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = new formidable.IncomingForm({ uploadDir: '/tmp', keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { files } = await parseForm(req);
    const audioFile = files.file;

    if (!audioFile || !audioFile.filepath) {
      console.error("Missing or malformed uploaded file:", audioFile);
      return res.status(400).json({ error: "File upload failed or file missing." });
    }

    // Transcribe
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.filepath),
      model: 'whisper-1',
    });

    // Summarize
    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a meeting assistant. Summarize the transcript clearly, then list key decisions and action steps. Keep it clean and professional.',
        },
        {
          role: 'user',
          content: transcription.text,
        }
      ],
    });

    res.status(200).json({ summary: gptResponse.choices[0].message.content });
  } catch (err) {
    console.error("Unexpected server error:", err);
    res.status(500).json({ error: 'Internal Server Error', details: err.message });
  }
}
