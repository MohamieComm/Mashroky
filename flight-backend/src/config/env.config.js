import dotenv from 'dotenv';
dotenv.config();

export const port = process.env.PORT || 4000;
export const appBaseUrl = process.env.APP_BASE_URL || 'https://www.mashrok.online';
export const backendBaseUrl = process.env.BACKEND_BASE_URL || '';

export const amadeusEnv = {
  clientId: process.env.AMADEUS_CLIENT_ID || '',
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || '',
};

export const openAiEnv = {
  apiKey: process.env.OPENAI_API_KEY || '',
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
  webhookSecret: process.env.MOYASAR_WEBHOOK_SECRET || '',
};

export const supabaseEnv = {
  url: process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '',
  serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  anonKey:
    process.env.SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_ANON_KEY ||
    process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
    '',
  jwtSecret: process.env.SUPABASE_JWT_SECRET || '',
};

export const allowedOrigins = [
  'https://www.mashrok.online',
  'https://mashrok.online',
  'https://mashroky-production.up.railway.app',
  'https://jubilant-hope-production-a334.up.railway.app',
  'https://mashrukt.up.railway.app',
  'https://mashrukt-production.up.railway.app',
];

export const adminApiKey = process.env.ADMIN_API_KEY || '';

export const nodeEnv = process.env.NODE_ENV || 'development';
