import express from 'express';
import rateLimit from 'express-rate-limit';
import { attachUser, requireAuth } from '../middlewares/auth.middleware.js';
import {
  searchFlights,
  priceAmadeus,
  bookAmadeus,
  bookDuffel,
  listAirlines,
  priceFlights,
  bookFlights,
} from '../controllers/flights.controller.js';

const priceLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
});

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post('/search', searchLimiter, searchFlights);
router.post('/price', searchLimiter, priceFlights);
router.post('/book', attachUser, requireAuth, bookFlights);
router.get('/airlines', listAirlines);
router.post('/amadeus/price', priceLimiter, priceAmadeus);
router.post('/amadeus/book', attachUser, requireAuth, bookAmadeus);
router.post('/duffel/book', attachUser, requireAuth, bookDuffel);

export default router;
