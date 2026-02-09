import express from 'express';
import flightsRoutes from './flights.routes.js';
import paymentsRoutes from './payments.routes.js';
import authRoutes from './auth.routes.js';
import productsRoutes from './products.routes.js';
import ordersRoutes from './orders.routes.js';
import settingsRoutes from './settings.routes.js';
import mediaRoutes from './media.routes.js';
import aiRoutes from './ai.routes.js';
import statsRoutes from './stats.routes.js';
import webhooksRoutes from './webhooks.routes.js';
import flightBookingsRoutes from './flight-bookings.routes.js';
import hotelsRoutes from './hotels.routes.js';
import carsRoutes from './cars.routes.js';
import toursRoutes from './tours.routes.js';
import transfersRoutes from './transfers.routes.js';
import { getPublicConfig } from '../controllers/public-config.controller.js';

const router = express.Router();

router.get('/health', (_req, res) => res.json({ ok: true }));
router.get('/public-config', getPublicConfig);
router.use('/flights', flightsRoutes);
router.use('/hotels', hotelsRoutes);
router.use('/cars', carsRoutes);
router.use('/tours', toursRoutes);
router.use('/transfers', transfersRoutes);
router.use('/payments', paymentsRoutes);
router.use('/auth', authRoutes);
router.use('/products', productsRoutes);
router.use('/orders', ordersRoutes);
router.use('/settings', settingsRoutes);
router.use('/media', mediaRoutes);
router.use('/ai', aiRoutes);
router.use('/stats', statsRoutes);
router.use('/webhooks', webhooksRoutes);
router.use('/flight-bookings', flightBookingsRoutes);

export default router;
