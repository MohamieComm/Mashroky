import express from 'express';
import { createPayment, handleWebhook } from '../controllers/payments.controller.js';

const router = express.Router();

router.post('/create', createPayment);
router.post('/webhook', handleWebhook);

export default router;
