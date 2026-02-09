import express from 'express';
import {
  searchFlights,
  priceAmadeus,
  bookAmadeus,
  bookDuffel,
  listAirlines,
  priceFlights,
  bookFlights,
} from '../controllers/flights.controller.js';

const router = express.Router();

router.post('/search', searchFlights);
router.post('/price', priceFlights);
router.post('/book', bookFlights);
router.get('/airlines', listAirlines);
router.post('/amadeus/price', priceAmadeus);
router.post('/amadeus/book', bookAmadeus);
router.post('/duffel/book', bookDuffel);

export default router;
