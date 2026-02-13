import { v4 as uuid } from 'uuid';
import { insertBooking, listBookings, updateBookingStatus } from '../services/supabase.service.js';

export const list = async (req, res, next) => {
  try {
    const userId = req.user?.roles?.includes('admin') ? undefined : req.user?.id;
    const bookings = await listBookings({ userId });
    res.json({ items: bookings });
  } catch (err) {
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const payload = req.body || {};
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'unauthorized' });
    const record = await insertBooking({
      id: uuid(),
      ...payload,
      user_id: userId,
    });
    res.status(201).json({ item: record });
  } catch (err) {
    next(err);
  }
};

export const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, payment_status } = req.body || {};
    if (!id) return res.status(400).json({ error: 'missing_id' });
    const record = await updateBookingStatus({ id, status, payment_status });
    res.json({ item: record });
  } catch (err) {
    next(err);
  }
};
