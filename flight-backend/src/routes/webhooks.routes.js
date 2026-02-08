import express from 'express';
import { handleWebhook } from '../controllers/payments.controller.js';

const router = express.Router();

router.post('/payments', handleWebhook);

export default router;
