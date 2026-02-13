import express from 'express';
import rateLimit from 'express-rate-limit';
import { attachUser, requireAuth } from '../middlewares/auth.middleware.js';
import {
  searchHotels,
  getHotelDetails,
  bookHotel,
} from '../controllers/hotels.controller.js';

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post('/search', searchLimiter, searchHotels);
router.post('/details', searchLimiter, getHotelDetails);
router.post('/book', attachUser, requireAuth, bookHotel);

export default router;
