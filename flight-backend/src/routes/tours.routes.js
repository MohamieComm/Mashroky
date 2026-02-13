import express from 'express';
import rateLimit from 'express-rate-limit';
import { attachUser, requireAuth } from '../middlewares/auth.middleware.js';
import {
  searchTours,
  getTourDetails,
  bookTour,
} from '../controllers/tours.controller.js';

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post('/search', searchLimiter, searchTours);
router.post('/details', searchLimiter, getTourDetails);
router.post('/book', attachUser, requireAuth, bookTour);

export default router;
