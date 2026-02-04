import axios from 'axios';
import { skyscannerEnv } from './env.config.js';

export const skyscannerClient = axios.create({
  baseURL: 'https://partners.api.skyscanner.net',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': skyscannerEnv.apiKey,
  },
});
