import { v4 as uuid } from 'uuid';
import { deleteTrip, listTrips, upsertTrip } from '../services/supabase.service.js';

export const list = async (_req, res, next) => {
  try {
    const trips = await listTrips();
    res.json({ items: trips });
  } catch (err) {
    next(err);
  }
};

export const upsert = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const id = payload.id || uuid();
    const record = await upsertTrip({ ...payload, id });
    res.json({ item: record });
  } catch (err) {
    next(err);
  }
};

export const remove = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'missing_id' });
    await deleteTrip(id);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
};
