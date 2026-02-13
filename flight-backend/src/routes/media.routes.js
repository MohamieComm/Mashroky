import express from 'express';
import multer from 'multer';
import { upload } from '../controllers/media.controller.js';
import { attachUser, requireAdmin, requireAuth } from '../middlewares/auth.middleware.js';

const router = express.Router();
const uploadMiddleware = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/upload', attachUser, requireAuth, requireAdmin, uploadMiddleware.single('file'), upload);

export default router;
