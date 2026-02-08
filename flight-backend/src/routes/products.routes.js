import express from 'express';
import { list, remove, upsert } from '../controllers/products.controller.js';
import { attachUser, requireAdmin, requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/', list);
router.post('/', attachUser, requireAuth, requireAdmin, upsert);
router.put('/:id', attachUser, requireAuth, requireAdmin, upsert);
router.delete('/:id', attachUser, requireAuth, requireAdmin, remove);

export default router;
