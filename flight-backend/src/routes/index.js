import express from 'express';
import flightsRoutes from './flights.routes.js';

const router = express.Router();

router.get('/health', (_req, res) => res.json({ ok: true }));
router.use('/flights', flightsRoutes);

export default router;
