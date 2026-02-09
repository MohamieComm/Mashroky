import express from 'express';
import {
  searchTours,
  getTourDetails,
  bookTour,
} from '../controllers/tours.controller.js';

const router = express.Router();

router.post('/search', searchTours);
router.post('/details', getTourDetails);
router.post('/book', bookTour);

export default router;
