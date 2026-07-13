import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';

const app = express();
app.use(express.json({ limit: '100kb' }));
app.use(express.static('public'));

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Model: haiku is fast + cheap and translates Kreyòl well.
// Swap to 'claude-sonnet-5' for the strongest idiom/context handling.
const MODEL = process.env.CLAUDE_MODEL || 'claude-haiku-4-5-20251001';

const MAX_CHARS = 5000;

app.post('/api/translate', async (req, res) => {
  try {
    const { text, direction } = req.body || {};

    if (typeof text !== 'string' || !text.trim()) {
      return res.status(400).json({ error: 'Please provide some text to translate.' });
    }
    if (text.length > MAX_CHARS) {
      return res.status(400).json({ error: `Text is too long (max ${MAX_CHARS} characters).` });
    }
    if (!process.env.ANTHROPIC_API_KEY) {
      return res.status(500).json({
        error: 'Server has no API key configured. Copy .env.example to .env, add your ANTHROPIC_API_KEY, and restart the server.',
      });
    }

    const toEnglish = direction !== 'en2ht';
    const source = toEnglish ? 'Haitian Kreyòl' : 'English';
    const target = toEnglish ? 'English' : 'Haitian Kreyòl';

    const system =
      `You are an expert translator specializing in ${source} and ${target}. ` +
      `Translate the user's text from ${source} to ${target}. ` +
      `Preserve tone, register, and meaning; render idioms naturally rather than word-for-word. ` +
      `Reply with ONLY the translation — no quotes, no notes, no explanations.`;

    const message = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 2048,
      system,
      messages: [{ role: 'user', content: text }],
    });

    const translation = message.content
      .filter((block) => block.type === 'text')
      .map((block) => block.text)
      .join('')
      .trim();

    res.json({ translation });
  } catch (err) {
    console.error('Translation error:', err?.message || err);
    const status = err?.status === 401 ? 401 : 500;
    const msg =
      status === 401
        ? 'API key was rejected. Check that ANTHROPIC_API_KEY in .env is correct.'
        : 'Translation failed. Please try again.';
    res.status(status).json({ error: msg });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Kreyòl translator running at http://localhost:${PORT}`);
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('WARNING: ANTHROPIC_API_KEY is not set. Copy .env.example to .env and add your key.');
  }
});
