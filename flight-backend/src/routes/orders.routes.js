import express from 'express';
import { create, list, updateStatus } from '../controllers/orders.controller.js';
import { attachUser, requireAdmin, requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.use(attachUser);

router.get('/', requireAuth, list);
router.post('/', requireAuth, create);
router.patch('/:id/status', requireAuth, requireAdmin, updateStatus);

export default router;
