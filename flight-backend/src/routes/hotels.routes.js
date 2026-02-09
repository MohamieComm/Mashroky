import express from 'express';
import {
  searchHotels,
  getHotelDetails,
  bookHotel,
} from '../controllers/hotels.controller.js';

const router = express.Router();

router.post('/search', searchHotels);
router.post('/details', getHotelDetails);
router.post('/book', bookHotel);

export default router;
