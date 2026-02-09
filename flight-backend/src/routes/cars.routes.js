import express from 'express';
import {
  searchCars,
  getCarDetails,
  bookCar,
} from '../controllers/cars.controller.js';

const router = express.Router();

router.post('/search', searchCars);
router.post('/details', getCarDetails);
router.post('/book', bookCar);

export default router;
