import express from 'express';
import rateLimit from 'express-rate-limit';
import { attachUser, requireAuth } from '../middlewares/auth.middleware.js';
import { createPayment, handleWebhook } from '../controllers/payments.controller.js';

const paymentLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'too_many_payment_requests' },
});

const router = express.Router();

router.post('/create', paymentLimiter, attachUser, requireAuth, createPayment);
router.post('/webhook', handleWebhook);

export default router;
