import axios from 'axios';
import { logAmadeusError } from '../utils/amadeus-logger.js';
import { parseISODurationToMinutes } from '../utils/duration.js';
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

async function ensureConfigured() {
  try {
    const creds = await resolveAmadeusCredentials();
    if (!creds.clientId || !creds.clientSecret) {
      const err = new Error('amadeus_not_configured');
      err.status = 503;
      err.expose = true;
      throw err;
    }
  } catch (e) {
    const err = new Error('amadeus_not_configured');
    err.cause = e?.message || e;
    err.status = 503;
    err.expose = true;
    throw err;
  }
}

async function requestNewToken() {
  const creds = await resolveAmadeusCredentials();
  if (!creds.clientId || !creds.clientSecret) {
    const err = new Error('amadeus_not_configured');
    err.status = 503;
    err.expose = true;
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
    e.expose = true;
    throw e;
  }
}

function buildAuthHeader(tokenObj) {
  const tokenType = tokenObj?.tokenType || 'Bearer';
  const accessToken = tokenObj?.accessToken || tokenObj?.access_token || '';
  return `${tokenType} ${accessToken}`.trim();
}

export async function searchFlights(params = {}) {
  await ensureConfigured();
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
    const payload = res?.data || {};
    const offers = Array.isArray(payload.data) ? payload.data : [];
    return offers.map(mapAmadeusOfferToDTO);
  } catch (error) {
    if (error?.message === 'amadeus_not_configured' || error?.message === 'amadeus_token_failed') {
      throw error;
    }
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('search_error', { params, error: payload });
    const err = new Error('amadeus_search_failed');
    err.cause = payload;
    err.status = error?.response?.status || 502;
    err.expose = true;
    throw err;
  }
}

export async function priceFlights(body = {}) {
  await ensureConfigured();
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
    if (error?.message === 'amadeus_not_configured' || error?.message === 'amadeus_token_failed') {
      throw error;
    }
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('price_error', { body, error: payload });
    const err = new Error('amadeus_price_failed');
    err.cause = payload;
    err.status = error?.response?.status || 502;
    err.expose = true;
    throw err;
  }
}

export async function createOrder(body = {}) {
  await ensureConfigured();
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
    if (error?.message === 'amadeus_not_configured' || error?.message === 'amadeus_token_failed') {
      throw error;
    }
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('booking_error', { body, error: payload });
    const err = new Error('amadeus_booking_failed');
    err.cause = payload;
    err.status = error?.response?.status || 502;
    err.expose = true;
    throw err;
  }
}

export function mapAmadeusOfferToDTO(offer) {
  if (!offer) return null;
  const price = offer.price || {};
  const slices = (offer.itineraries || []).map((iti) =>
    (iti.segments || []).map((seg) => ({
      marketingCarrier: seg.carrierCode || null,
      operatingCarrier: seg.operating?.carrierCode || seg.carrierCode || null,
      flightNumber: seg.number || seg.flightNumber || null,
      origin: seg.departure?.iataCode || null,
      destination: seg.arrival?.iataCode || null,
      departureTime: seg.departure?.at || null,
      arrivalTime: seg.arrival?.at || null,
      durationMinutes: parseISODurationToMinutes(seg.duration),
      aircraft: seg.aircraft?.code || null,
    }))
  );

  const cabinsSet = new Set();
  (offer.travelerPricings || []).forEach((pricing) => {
    (pricing.fareDetailsBySegment || []).forEach((seg) => {
      if (seg.cabin) cabinsSet.add(String(seg.cabin).toUpperCase());
    });
  });

  const totalAmount = price.total ?? null;
  const currency = price.currency ?? null;
  const baseAmount = price.base ?? null;
  const taxes =
    totalAmount != null && baseAmount != null
      ? Number(totalAmount) - Number(baseAmount)
      : null;

  return {
    provider: 'amadeus',
    providerOfferId: offer.id,
    slices,
    pricing: {
      total: totalAmount,
      currency,
      base: baseAmount,
      taxes,
    },
    cabins: Array.from(cabinsSet),
    refundable: offer?.pricingOptions?.refundable ?? null,
    baggageInfo: offer?.travelerPricings?.[0]?.fareDetailsBySegment?.[0]?.includedCheckedBags || null,
    raw: offer,
  };
}

export async function listAirlines({ codes } = {}) {
  await ensureConfigured();
  try {
    const token = await getAccessToken();
    const base = await resolveBaseUrl();
    const res = await axios.get(`${base}/v1/reference-data/airlines`, {
      params: codes ? { airlineCodes: codes } : undefined,
      headers: {
        Authorization: buildAuthHeader(token),
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    });
    const payload = res?.data || {};
    return Array.isArray(payload.data) ? payload.data : [];
  } catch (error) {
    if (error?.message === 'amadeus_not_configured' || error?.message === 'amadeus_token_failed') {
      throw error;
    }
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('airlines_error', { codes, error: payload });
    const err = new Error('amadeus_airlines_failed');
    err.cause = payload;
    err.status = error?.response?.status || 502;
    err.expose = true;
    throw err;
  }
}

export default {
  getAccessToken,
  searchFlights,
  priceFlights,
  createOrder,
  listAirlines,
  mapAmadeusOfferToDTO,
};
