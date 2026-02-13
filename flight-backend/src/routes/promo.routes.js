import express from 'express';
import rateLimit from 'express-rate-limit';
import { attachUser } from '../middlewares/auth.middleware.js';

const promoLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { valid: false, error: 'too_many_requests' },
});

const router = express.Router();

// Server-side promo codes — never exposed to the client bundle
const PROMO_CODES = {
  MASHROUK10:  { percent: 10, label: 'خصم 10%', minAmount: 0 },
  MASHROUK20:  { percent: 20, label: 'خصم 20%', minAmount: 500 },
  WELCOME:     { percent: 15, label: 'خصم ترحيبي 15%', minAmount: 0 },
  SUMMER25:    { percent: 25, label: 'خصم الصيف 25%', minAmount: 1000 },
};

/**
 * POST /api/promo/validate
 * Body: { code: string, subtotal: number }
 * Returns: { valid: boolean, percent?: number, label?: string, error?: string }
 */
router.post('/validate', promoLimiter, attachUser, (req, res) => {
  const { code, subtotal } = req.body || {};
  const normalised = String(code || '').trim().toUpperCase();

  if (!normalised) {
    return res.json({ valid: false, error: 'missing_code' });
  }

  const promo = PROMO_CODES[normalised];
  if (!promo) {
    return res.json({ valid: false, error: 'invalid_code' });
  }

  const amount = Number(subtotal) || 0;
  if (promo.minAmount && amount < promo.minAmount) {
    return res.json({
      valid: false,
      error: 'min_amount_not_met',
      minAmount: promo.minAmount,
    });
  }

  return res.json({
    valid: true,
    percent: promo.percent,
    label: promo.label,
  });
});

export default router;
