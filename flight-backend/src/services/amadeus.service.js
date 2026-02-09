import axios from 'axios';
import { logAmadeusError } from '../utils/amadeus-logger.js';
import { getApiBaseUrl, getApiKeyValue } from './api-keys.service.js';

// In-memory token cache to reduce token requests.
const tokenCache = {
  accessToken: null,
  tokenType: 'Bearer',
  expiresAt: 0,
  raw: null,
};

const DEFAULT_TEST_BASE = 'https://test.api.amadeus.com';
const DEFAULT_PROD_BASE = 'https://api.amadeus.com';

async function resolveBaseUrl() {
  const explicit = String(process.env.AMADEUS_BASE_URL || '').trim();
  if (explicit) return explicit.replace(/\/$/, '');
  try {
    const fromAdmin = await getApiBaseUrl('amadeus');
    if (fromAdmin) return String(fromAdmin).trim().replace(/\/$/, '');
  } catch {
    // ignore lookup errors; fall back to env-based defaults
  }
  const env = String(process.env.AMADEUS_ENV || '').toLowerCase();
  return env === 'production' ? DEFAULT_PROD_BASE : DEFAULT_TEST_BASE;
}

async function resolveAmadeusCredentials() {
  // prefer environment variables, fall back to admin-managed api_keys in Supabase
  let clientId = process.env.AMADEUS_CLIENT_ID || '';
  let clientSecret = process.env.AMADEUS_CLIENT_SECRET || '';
  let baseUrl = (process.env.AMADEUS_BASE_URL || '').trim();

  try {
    if (!clientId) clientId = await getApiKeyValue('amadeus', 'client_id');
    if (!clientSecret) clientSecret = await getApiKeyValue('amadeus', 'client_secret');
    if (!baseUrl) baseUrl = await getApiBaseUrl('amadeus');
  } catch (e) {
    // log but continue to allow env-based config
    await logAmadeusError('credential_lookup_error', { error: e?.message || e });
  }

  return { clientId, clientSecret, baseUrl: baseUrl || undefined };
}

async function requestNewToken() {
  const creds = await resolveAmadeusCredentials();
  if (!creds.clientId || !creds.clientSecret) {
    const err = new Error('amadeus_not_configured');
    err.status = 500;
    throw err;
  }
  const tokenUrl = `${(creds.baseUrl || (await resolveBaseUrl()))}/v1/security/oauth2/token`;
  const params = new URLSearchParams();
  params.set('grant_type', 'client_credentials');
  params.set('client_id', creds.clientId);
  params.set('client_secret', creds.clientSecret);

  const res = await axios.post(tokenUrl, params.toString(), {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    timeout: 15000,
  });
  return res.data || {};
}

export async function getAccessToken() {
  // Return cached token when still valid (5s early buffer)
  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt - 5000 > now) {
    return {
      accessToken: tokenCache.accessToken,
      tokenType: tokenCache.tokenType,
      expiresIn: Math.max(0, Math.floor((tokenCache.expiresAt - now) / 1000)),
      raw: tokenCache.raw,
    };
  }

  try {
    const data = await requestNewToken();
    const accessToken = data.access_token || '';
    const tokenType = data.token_type || 'Bearer';
    const expiresIn = Number(data.expires_in || 0);
    const expiresAt = Date.now() + (expiresIn > 0 ? expiresIn * 1000 : 60 * 1000);

    tokenCache.accessToken = accessToken;
    tokenCache.tokenType = tokenType;
    tokenCache.expiresAt = expiresAt;
    tokenCache.raw = data;

    return { accessToken, tokenType, expiresIn, raw: data };
  } catch (err) {
    const payload = err?.response?.data || err?.message || err;
    await logAmadeusError('token_error', { error: payload });
    const e = new Error('amadeus_token_failed');
    e.cause = payload;
    e.status = 502;
    throw e;
  }
}

function buildAuthHeader(tokenObj) {
  const tokenType = tokenObj?.tokenType || 'Bearer';
  const accessToken = tokenObj?.accessToken || tokenObj?.access_token || '';
  return `${tokenType} ${accessToken}`.trim();
}

export async function searchFlights(params = {}) {
  ensureConfigured();
  try {
    const token = await getAccessToken();
    const base = await resolveBaseUrl();
    const res = await axios.get(`${base}/v2/shopping/flight-offers`, {
      params,
      headers: {
        Authorization: buildAuthHeader(token),
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    });
    return res?.data || {};
  } catch (error) {
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('search_error', { params, error: payload });
    throw error;
  }
}

export async function priceFlights(body = {}) {
  ensureConfigured();
  try {
    const token = await getAccessToken();
    const base = await resolveBaseUrl();
    // Amadeus expects a `data` object for pricing; accept either full body or a simplified shape
    const payload = body && body.data ? body : { data: { type: 'flight-offers-pricing', flightOffers: body.flightOffers || body } };
    const res = await axios.post(`${base}/v1/shopping/flight-offers/pricing`, payload, {
      headers: {
        Authorization: buildAuthHeader(token),
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    });
    return res?.data || {};
  } catch (error) {
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('price_error', { body, error: payload });
    throw error;
  }
}

export async function createOrder(body = {}) {
  ensureConfigured();
  try {
    const token = await getAccessToken();
    const base = await resolveBaseUrl();
    const payload = body && body.data ? body : { data: { type: 'flight-order', flightOffers: body.flightOffers || [], travelers: body.travelers || [] } };
    const res = await axios.post(`${base}/v1/booking/flight-orders`, payload, {
      headers: {
        Authorization: buildAuthHeader(token),
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
    return res?.data || {};
  } catch (error) {
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('booking_error', { body, error: payload });
    throw error;
  }
}

export function mapAmadeusOfferToDTO(offer) {
  if (!offer) return null;
  const price = offer.price || {};
  const itineraries = (offer.itineraries || []).map((iti) => ({
    segments: (iti.segments || []).map((seg) => ({
      departure: seg.departure,
      arrival: seg.arrival,
      carrierCode: seg.carrierCode,
      number: seg.number || seg.flightNumber || null,
      duration: seg.duration,
      raw: seg,
    })),
    raw: iti,
  }));

  return {
    provider: 'amadeus',
    providerOfferId: offer.id,
    raw: offer,
    itineraries,
    pricing: {
      total: price.total || null,
      currency: price.currency || null,
    },
  };
}

export default {
  getAccessToken,
  searchFlights,
  priceFlights,
  createOrder,
  mapAmadeusOfferToDTO,
};
