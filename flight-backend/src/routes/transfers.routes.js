import express from 'express';
import rateLimit from 'express-rate-limit';
import { attachUser, requireAuth } from '../middlewares/auth.middleware.js';
import {
  searchTransfers,
  getTransferDetails,
  bookTransfer,
} from '../controllers/transfers.controller.js';

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post('/search', searchLimiter, searchTransfers);
router.post('/details', searchLimiter, getTransferDetails);
router.post('/book', attachUser, requireAuth, bookTransfer);

export default router;
