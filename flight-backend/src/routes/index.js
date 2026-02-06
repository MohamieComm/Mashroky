import express from 'express';
import flightsRoutes from './flights.routes.js';
import paymentsRoutes from './payments.routes.js';

const router = express.Router();

router.get('/health', (_req, res) => res.json({ ok: true }));
router.use('/flights', flightsRoutes);
router.use('/payments', paymentsRoutes);

export default router;
