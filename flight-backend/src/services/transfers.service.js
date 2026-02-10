import axios from 'axios';
import { getApiBaseUrl, getApiKeyValue } from './api-keys.service.js';
import { logAmadeusError } from '../utils/amadeus-logger.js';
import { v4 as uuid } from 'uuid';
import { insertBooking } from './supabase.service.js';
import { createMockMoyasarPayment } from './moyasar.service.js';

const tokenCache = {
  accessToken: null,
  tokenType: 'Bearer',
  expiresAt: 0,
  raw: null,
};

const DEFAULT_SEARCH_PATH = '/search';
const DEFAULT_DETAILS_PATH = '/details';
const DEFAULT_BOOK_PATH = '/book';
const DEFAULT_API_KEY_HEADER = 'x-api-key';

const toArray = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
};

const toNumber = (value) => {
  const num = Number(String(value || '').replace(/[^\d.]/g, ''));
  return Number.isFinite(num) ? num : undefined;
};

const resolveConfig = async () => {
  const baseUrl =
    String(process.env.TRANSFERS_BASE_URL || '').trim() ||
    (await getApiBaseUrl('transfers')) ||
    (await getApiKeyValue('transfers', 'base_url'));

  const searchPath =
    String(process.env.TRANSFERS_SEARCH_PATH || '').trim() ||
    (await getApiKeyValue('transfers', 'search_path')) ||
    DEFAULT_SEARCH_PATH;

  const detailsPath =
    String(process.env.TRANSFERS_DETAILS_PATH || '').trim() ||
    (await getApiKeyValue('transfers', 'details_path')) ||
    DEFAULT_DETAILS_PATH;

  const bookPath =
    String(process.env.TRANSFERS_BOOK_PATH || '').trim() ||
    (await getApiKeyValue('transfers', 'book_path')) ||
    DEFAULT_BOOK_PATH;

  const clientId =
    String(process.env.TRANSFERS_CLIENT_ID || '').trim() ||
    (await getApiKeyValue('transfers', 'client_id'));
  const clientSecret =
    String(process.env.TRANSFERS_CLIENT_SECRET || '').trim() ||
    (await getApiKeyValue('transfers', 'client_secret'));
  const tokenUrl =
    String(process.env.TRANSFERS_TOKEN_URL || '').trim() ||
    (await getApiKeyValue('transfers', 'token_url'));

  const apiKey =
    String(process.env.TRANSFERS_API_KEY || '').trim() ||
    (await getApiKeyValue('transfers', 'api_key'));
  const apiKeyHeader =
    String(process.env.TRANSFERS_API_KEY_HEADER || '').trim() ||
    (await getApiKeyValue('transfers', 'api_key_header')) ||
    DEFAULT_API_KEY_HEADER;

  const authType =
    String(process.env.TRANSFERS_AUTH_TYPE || '').trim().toLowerCase() ||
    (await getApiKeyValue('transfers', 'auth_type')).toLowerCase() ||
    (clientId && clientSecret ? 'oauth2' : apiKey ? 'apikey' : 'none');

  const searchMethod =
    String(process.env.TRANSFERS_SEARCH_METHOD || '').trim().toUpperCase() ||
    (await getApiKeyValue('transfers', 'search_method')).toUpperCase() ||
    'GET';

  return {
    baseUrl: baseUrl ? String(baseUrl).replace(/\/$/, '') : '',
    searchPath,
    detailsPath,
    bookPath,
    clientId,
    clientSecret,
    tokenUrl,
    apiKey,
    apiKeyHeader,
    authType,
    searchMethod,
  };
};

const buildUrl = (baseUrl, path) => {
  if (!baseUrl) return '';
  try {
    return new URL(path, baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`).toString();
  } catch {
    return `${baseUrl.replace(/\/$/, '')}/${String(path || '').replace(/^\//, '')}`;
  }
};

const normalizeTransferItem = (item) => {
  const vehicle = item?.vehicle || item?.transport || item?.car || item || {};
  const price = item?.price || item?.pricing || item?.rate || {};
  const capacity = toNumber(vehicle?.capacity || item?.passengers || item?.seats);
  const luggage = toNumber(vehicle?.luggage || item?.bags);

  return {
    id: item?.id || vehicle?.id || vehicle?.code || null,
    name: vehicle?.name || vehicle?.model || item?.serviceName || null,
    type: vehicle?.type || item?.type || vehicle?.category || null,
    category: vehicle?.category || item?.category || null,
    capacity: capacity ?? null,
    luggage: luggage ?? null,
    vendor: item?.vendor || item?.company || item?.provider || vehicle?.vendor || null,
    image: vehicle?.image || vehicle?.imageUrl || null,
    priceTotal: price?.total || price?.amount || item?.total || null,
    currency: price?.currency || item?.currency || null,
    pickup: item?.pickup || item?.pickUp || null,
    dropoff: item?.dropoff || item?.dropOff || null,
    duration: item?.duration || null,
    raw: item,
  };
};

export async function getAccessToken() {
  const config = await resolveConfig();
  if (config.authType !== 'oauth2') return null;
  if (!config.clientId || !config.clientSecret) {
    const err = new Error('transfers_not_configured');
    err.status = 500;
    throw err;
  }

  const now = Date.now();
  if (tokenCache.accessToken && tokenCache.expiresAt - 5000 > now) {
    return {
      accessToken: tokenCache.accessToken,
      tokenType: tokenCache.tokenType,
      expiresIn: Math.max(0, Math.floor((tokenCache.expiresAt - now) / 1000)),
      raw: tokenCache.raw,
    };
  }

  if (!config.tokenUrl) {
    const err = new Error('transfers_token_url_missing');
    err.status = 500;
    throw err;
  }

  const params = new URLSearchParams();
  params.set('grant_type', 'client_credentials');
  params.set('client_id', config.clientId);
  params.set('client_secret', config.clientSecret);

  try {
    const res = await axios.post(config.tokenUrl, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    });
    const data = res?.data || {};
    const accessToken = data.access_token || '';
    const tokenType = data.token_type || 'Bearer';
    const expiresIn = Number(data.expires_in || 0);
    const expiresAt = Date.now() + (expiresIn > 0 ? expiresIn * 1000 : 60 * 1000);

    tokenCache.accessToken = accessToken;
    tokenCache.tokenType = tokenType;
    tokenCache.expiresAt = expiresAt;
    tokenCache.raw = data;

    return { accessToken, tokenType, expiresIn, raw: data };
  } catch (error) {
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('transfers_token_error', { error: payload });
    const err = new Error('transfers_token_failed');
    err.cause = payload;
    err.status = error?.response?.status || 502;
    throw err;
  }
}

const buildAuthHeaders = async (config) => {
  const headers = { 'Content-Type': 'application/json' };
  if (config.authType === 'oauth2') {
    const token = await getAccessToken();
    const tokenType = token?.tokenType || 'Bearer';
    const accessToken = token?.accessToken || '';
    headers.Authorization = `${tokenType} ${accessToken}`.trim();
  } else if (config.authType === 'apikey' && config.apiKey) {
    headers[config.apiKeyHeader || DEFAULT_API_KEY_HEADER] = config.apiKey;
  }
  return headers;
};

export async function searchTransfers(params = {}) {
  const config = await resolveConfig();
  if (!config.baseUrl) {
    const err = new Error('transfers_not_configured');
    err.status = 500;
    throw err;
  }
  const url = buildUrl(config.baseUrl, config.searchPath);
  const headers = await buildAuthHeaders(config);

  try {
    let res;
    if (config.searchMethod === 'POST') {
      res = await axios.post(url, params, { headers, timeout: 20000 });
    } else {
      res = await axios.get(url, { params, headers, timeout: 20000 });
    }

    const payload = res?.data || {};
    const data =
      (Array.isArray(payload.data) && payload.data) ||
      (Array.isArray(payload.results) && payload.results) ||
      (Array.isArray(payload.transfers) && payload.transfers) ||
      (Array.isArray(payload.items) && payload.items) ||
      [];

    const results = data.map(normalizeTransferItem);

    return {
      results,
      meta: payload.meta || null,
      warnings: payload.warnings || null,
      raw: payload,
    };
  } catch (error) {
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('transfers_search_error', { params, error: payload });
    const err = new Error('transfers_search_failed');
    err.cause = payload;
    err.status = error?.response?.status || 502;
    throw err;
  }
}

export async function getTransferDetails(_params = {}) {
  const err = new Error('transfers_details_not_implemented');
  err.status = 501;
  throw err;
}

export async function bookTransfer(_params = {}) {
  const params = _params || {};
  const { offerId, transferId, passenger, payment } = params;
  if (!offerId && !transferId) {
    const err = new Error('missing_offer_or_transfer_id');
    err.status = 400;
    throw err;
  }

  const record = {
    id: uuid(),
    type: 'transfer',
    provider: 'transfers_service',
    provider_offer_id: offerId || null,
    provider_transfer_id: transferId || null,
    status: 'created',
    raw_request: params,
  };

  const saved = await insertBooking(record);
  const response = { booking: saved };
  if (payment && payment.amount) response.paymentInfo = createMockMoyasarPayment(payment);
  return response;
}
