import express from 'express';
import rateLimit from 'express-rate-limit';
import { attachUser, requireAuth } from '../middlewares/auth.middleware.js';
import { getBookingInvoice } from '../controllers/invoice.controller.js';

const router = express.Router();

// M1 fix: strict rate limit for invoice download (prevent enumeration)
const invoiceLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { error: 'too_many_requests' },
});

router.get('/:id/invoice.pdf', invoiceLimiter, attachUser, requireAuth, getBookingInvoice);

export default router;
