import express from 'express';
import { getStats } from '../controllers/stats.controller.js';
import { attachUser, requireAdmin, requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', attachUser, requireAuth, requireAdmin, getStats);

export default router;
