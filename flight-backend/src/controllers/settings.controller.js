import { listSettings, upsertSettings } from '../services/supabase.service.js';

export const getSettings = async (_req, res, next) => {
  try {
    const settings = await listSettings();
    res.json({ settings });
  } catch (err) {
    next(err);
  }
};

export const updateSettings = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const settings = await upsertSettings(payload);
    res.json({ settings });
  } catch (err) {
    next(err);
  }
};
