import express from 'express';
import rateLimit from 'express-rate-limit';
import { attachUser, requireAuth } from '../middlewares/auth.middleware.js';
import {
  searchCars,
  getCarDetails,
  bookCar,
} from '../controllers/cars.controller.js';

const searchLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

const router = express.Router();

router.post('/search', searchLimiter, searchCars);
router.post('/details', searchLimiter, getCarDetails);
router.post('/book', attachUser, requireAuth, bookCar);

export default router;
