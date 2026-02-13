import Amadeus from 'amadeus';
import { amadeusEnv } from './env.config.js';

const normalizeHost = (value) => {
  if (!value) return '';
  try {
    return new URL(value).host;
  } catch {
    return String(value).replace(/^https?:\/\//i, '').replace(/\/.*$/, '');
  }
};

const amadeusHost = normalizeHost(process.env.AMADEUS_BASE_URL);
const amadeusHostname = process.env.AMADEUS_ENV || 'test';

export const amadeusClient = new Amadeus({
  clientId: amadeusEnv.clientId,
  clientSecret: amadeusEnv.clientSecret,
  hostname: amadeusHostname,
  host: amadeusHost || undefined,
});
