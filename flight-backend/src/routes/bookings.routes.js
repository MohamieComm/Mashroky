import express from 'express';
import rateLimit from 'express-rate-limit';
import { attachUser, requireAuth, requireAdmin } from '../middlewares/auth.middleware.js';
import { getBookingInvoice } from '../controllers/invoice.controller.js';
import { listBookings } from '../services/supabase.service.js';

const router = express.Router();

// M1 fix: strict rate limit for invoice download (prevent enumeration)
const invoiceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'too_many_requests' },
});

// Admin: list all generic bookings (hotel, car, tour, transfer)
router.get('/', attachUser, requireAdmin, async (_req, res, next) => {
  try {
    const items = await listBookings();
    res.json({ items });
  } catch (err) {
    if (err?.message === 'supabase_not_configured') {
      res.json({ items: [] });
      return;
    }
    next(err);
  }
});

router.get('/:id/invoice.pdf', invoiceLimiter, attachUser, requireAuth, getBookingInvoice);

export default router;
