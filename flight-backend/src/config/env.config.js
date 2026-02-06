import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 4000;
export const appBaseUrl = process.env.APP_BASE_URL || 'https://www.mashrok.online';

export const amadeusEnv = {
  clientId: process.env.AMADEUS_CLIENT_ID || '',
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || '',
};

export const skyscannerEnv = {
  apiKey: process.env.SKYSCANNER_API_KEY || '',
};

export const duffelEnv = {
  accessToken: process.env.DUFFEL_ACCESS_TOKEN || '',
};

export const moyasarEnv = {
  secretKey: process.env.MOYASAR_SECRET_KEY || '',
  publishableKey: process.env.MOYASAR_PUBLISHABLE_KEY || '',
};

export const allowedOrigins = [
  'https://www.mashrok.online',
  'https://mashrok.online',
  'https://mashroky-production.up.railway.app',
  'https://jubilant-hope-production-a334.up.railway.app',
];
