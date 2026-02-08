import { aggregateCounts } from '../services/supabase.service.js';

export const getStats = async (_req, res, next) => {
  try {
    const counts = await aggregateCounts();
    res.json({ counts });
  } catch (err) {
    next(err);
  }
};
