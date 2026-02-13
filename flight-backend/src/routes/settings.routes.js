import express from 'express';
import { getSettings, updateSettings } from '../controllers/settings.controller.js';
import { attachUser, requireAdmin, requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', attachUser, requireAuth, getSettings);
router.put('/', attachUser, requireAuth, requireAdmin, updateSettings);

export default router;
