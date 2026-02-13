import OpenAI from 'openai';
import { openAiEnv } from '../config/env.config.js';

const ALLOWED_MODELS = new Set(['gpt-4o-mini', 'gpt-3.5-turbo']);
const MAX_PROMPT_LENGTH = 2000;
const MAX_CONTEXT_LENGTH = 4000;

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
    const safeModel = ALLOWED_MODELS.has(model) ? model : 'gpt-4o-mini';
    const safePrompt = String(prompt).slice(0, MAX_PROMPT_LENGTH);
    const safeContext = context ? String(context).slice(0, MAX_CONTEXT_LENGTH) : null;
    const messages = [
      { role: 'system', content: 'You are a concise travel assistant API responder.' },
      safeContext ? { role: 'user', content: safeContext } : null,
      { role: 'user', content: safePrompt },
    ].filter(Boolean);
    const completion = await client.chat.completions.create({ model: safeModel, messages, temperature: 0.3, max_tokens: 400 });
    res.json({ result: completion.choices?.[0]?.message?.content ?? '' });
  } catch (err) {
    next(err);
  }
};
