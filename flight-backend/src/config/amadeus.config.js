import Amadeus from 'amadeus';
import { amadeusEnv } from './env.config.js';

export const amadeusClient = new Amadeus({
  clientId: amadeusEnv.clientId,
  clientSecret: amadeusEnv.clientSecret,
});
