// ============================================================
// Server-side Amadeus SDK singleton
// Reads credentials from env or Supabase amadeus_config table
// ============================================================

import { Amadeus } from './amadeus';
import { AmadeusConfig } from './amadeus/types';

let _instance: Amadeus | null = null;

export function getAmadeusClient(): Amadeus {
  if (_instance) return _instance;

  const config: AmadeusConfig = {
    clientId: process.env.AMADEUS_CLIENT_ID!,
    clientSecret: process.env.AMADEUS_CLIENT_SECRET!,
    baseUrl: process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com',
    timeout: 30_000,
  };

  if (!config.clientId || !config.clientSecret) {
    throw new Error('Missing AMADEUS_CLIENT_ID or AMADEUS_CLIENT_SECRET environment variables');
  }

  _instance = new Amadeus(config);
  return _instance;
}

/** Reset cached instance (useful after config change in admin panel) */
export function resetAmadeusClient(): void {
  _instance = null;
}
