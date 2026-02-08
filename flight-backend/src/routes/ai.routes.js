import express from 'express';
import { complete } from '../controllers/ai.controller.js';
import { attachUser, requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/complete', attachUser, requireAuth, complete);

export default router;
