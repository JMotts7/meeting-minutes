const { OpenAI } = require('openai');
const formidable = require('formidable');
const fs = require('fs');

export const config = {
  api: {
    bodyParser: false,
  },
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

async function parseForm(req) {
  return new Promise((resolve, reject) => {
    const form = formidable({ uploadDir: '/tmp', keepExtensions: true });
    form.parse(req, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { files } = await parseForm(req);
    const audioFile = files.file;

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(audioFile.filepath),
      model: 'whisper-1',
    });

    const gptResponse = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages: [
        {
          role: 'system',
          content:
            'You are a meeting assistant. Summarize the transcript clearly, then list key decisions and action steps. Keep it clean and professional.',
        },
        {
          role: 'user',
          content: transcription.text,
        },
      ],
      temperature: 0.5,
    });

    res
      .status(200)
      .json({ summary: gptResponse.choices[0].message.content });
  } catch (err) {
    console.error('API error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
}
