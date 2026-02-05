import Amadeus from 'amadeus';
import { amadeusEnv } from './env.config.js';

export const amadeusClient = new Amadeus({
  clientId: amadeusEnv.clientId,
  clientSecret: amadeusEnv.clientSecret,
  hostname: process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com',
});
