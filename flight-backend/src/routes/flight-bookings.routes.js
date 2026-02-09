import express from 'express';
import { attachUser, requireAdmin } from '../middlewares/auth.middleware.js';
import { create, list } from '../controllers/flight-bookings.controller.js';

const router = express.Router();

router.use(attachUser);

router.get('/', requireAdmin, list);
router.post('/', create);

export default router;
