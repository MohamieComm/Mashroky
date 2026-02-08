import express from 'express';
import { attachUser, requireAuth } from '../middlewares/auth.middleware.js';
import { login, me, signup } from '../controllers/auth.controller.js';

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', attachUser, requireAuth, me);

export default router;
