import { v4 as uuid } from 'uuid';
import { insertFlightBooking, listFlightBookings } from '../services/flight-bookings.service.js';

export const list = async (_req, res, next) => {
  try {
    const items = await listFlightBookings();
    res.json({ items });
  } catch (err) {
    if (err?.message === 'supabase_not_configured') {
      res.json({ items: [] });
      return;
    }
    next(err);
  }
};

export const create = async (req, res, next) => {
  try {
    const {
      bookingReference,
      providerOrderId,
      total,
      currency,
      tripType,
      summary,
      email,
      travelersCount,
      raw,
    } = req.body || {};

    const payload = {
      id: uuid(),
      booking_reference: bookingReference || null,
      provider_order_id: providerOrderId || null,
      total: Number(total || 0),
      currency: currency || 'SAR',
      trip_type: tripType || null,
      summary: summary || null,
      email: email || null,
      travelers_count: Number(travelersCount || 0),
      raw: raw || null,
      created_at: new Date().toISOString(),
    };

    const record = await insertFlightBooking(payload);
    res.status(201).json({ item: record });
  } catch (err) {
    if (err?.message === 'supabase_not_configured') {
      res.status(202).json({ item: null });
      return;
    }
    next(err);
  }
};
