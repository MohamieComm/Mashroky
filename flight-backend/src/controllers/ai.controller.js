import OpenAI from 'openai';
import { openAiEnv } from '../config/env.config.js';

let cachedClient = null;
const getClient = () => {
  if (cachedClient) return cachedClient;
  if (!openAiEnv.apiKey) return null;
  cachedClient = new OpenAI({ apiKey: openAiEnv.apiKey });
  return cachedClient;
};

export const complete = async (req, res, next) => {
  try {
    const { prompt, context, model = 'gpt-4o-mini' } = req.body || {};
    const client = getClient();
    if (!client) return res.status(500).json({ error: 'openai_not_configured' });
    if (!prompt) return res.status(400).json({ error: 'missing_prompt' });
    const messages = [
      { role: 'system', content: 'You are a concise travel assistant API responder.' },
      context ? { role: 'user', content: context } : null,
      { role: 'user', content: prompt },
    ].filter(Boolean);
    const completion = await client.chat.completions.create({ model, messages, temperature: 0.3, max_tokens: 400 });
    res.json({ result: completion.choices?.[0]?.message?.content ?? '' });
  } catch (err) {
    next(err);
  }
};
