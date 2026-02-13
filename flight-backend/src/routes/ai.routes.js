import express from 'express';
import rateLimit from 'express-rate-limit';
import { complete } from '../controllers/ai.controller.js';
import { attachUser, requireAuth } from '../middlewares/auth.middleware.js';

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post('/complete', attachUser, requireAuth, aiLimiter, complete);

export default router;
