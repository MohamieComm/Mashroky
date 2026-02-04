import { Duffel } from 'duffel-api';
import { duffelEnv } from './env.config.js';

export const duffelClient = new Duffel({
  token: duffelEnv.accessToken,
});
