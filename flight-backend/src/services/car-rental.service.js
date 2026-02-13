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
    String(process.env.CAR_RENTAL_BASE_URL || '').trim() ||
    (await getApiBaseUrl('car_rental')) ||
    (await getApiKeyValue('car_rental', 'base_url'));

  const searchPath =
    String(process.env.CAR_RENTAL_SEARCH_PATH || '').trim() ||
    (await getApiKeyValue('car_rental', 'search_path')) ||
    DEFAULT_SEARCH_PATH;

  const detailsPath =
    String(process.env.CAR_RENTAL_DETAILS_PATH || '').trim() ||
    (await getApiKeyValue('car_rental', 'details_path')) ||
    DEFAULT_DETAILS_PATH;

  const bookPath =
    String(process.env.CAR_RENTAL_BOOK_PATH || '').trim() ||
    (await getApiKeyValue('car_rental', 'book_path')) ||
    DEFAULT_BOOK_PATH;

  const clientId =
    String(process.env.CAR_RENTAL_CLIENT_ID || '').trim() ||
    (await getApiKeyValue('car_rental', 'client_id'));
  const clientSecret =
    String(process.env.CAR_RENTAL_CLIENT_SECRET || '').trim() ||
    (await getApiKeyValue('car_rental', 'client_secret'));
  const tokenUrl =
    String(process.env.CAR_RENTAL_TOKEN_URL || '').trim() ||
    (await getApiKeyValue('car_rental', 'token_url'));

  const apiKey =
    String(process.env.CAR_RENTAL_API_KEY || '').trim() ||
    (await getApiKeyValue('car_rental', 'api_key'));
  const apiKeyHeader =
    String(process.env.CAR_RENTAL_API_KEY_HEADER || '').trim() ||
    (await getApiKeyValue('car_rental', 'api_key_header')) ||
    DEFAULT_API_KEY_HEADER;

  const authType =
    String(process.env.CAR_RENTAL_AUTH_TYPE || '').trim().toLowerCase() ||
    String(await getApiKeyValue('car_rental', 'auth_type') || '').trim().toLowerCase() ||
    (clientId && clientSecret ? 'oauth2' : apiKey ? 'apikey' : 'none');

  const searchMethod =
    String(process.env.CAR_RENTAL_SEARCH_METHOD || '').trim().toUpperCase() ||
    String(await getApiKeyValue('car_rental', 'search_method') || '').trim().toUpperCase() ||
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

const normalizeCarItem = (item) => {
  const vehicle = item?.vehicle || item?.car || item || {};
  const rate = item?.rate || item?.pricing || item?.price || {};
  return {
    id: item?.id || vehicle?.id || vehicle?.code || null,
    name: vehicle?.name || vehicle?.model || vehicle?.type || null,
    category: vehicle?.category || vehicle?.vehicleClass || null,
    transmission: vehicle?.transmission || vehicle?.transmissionType || null,
    fuel: vehicle?.fuel || vehicle?.fuelType || null,
    seats: vehicle?.seats || vehicle?.seatingCapacity || null,
    doors: vehicle?.doors || vehicle?.doorCount || null,
    vendor: item?.vendor || item?.company || item?.provider || vehicle?.vendor || null,
    image: vehicle?.image || vehicle?.imageUrl || null,
    priceTotal: rate?.total || rate?.amount || item?.total || null,
    currency: rate?.currency || item?.currency || null,
    pickup: item?.pickup || item?.pickUp || null,
    dropoff: item?.dropoff || item?.dropOff || null,
    raw: item,
  };
};

export async function getAccessToken() {
  const config = await resolveConfig();
  if (config.authType !== 'oauth2') return null;
  if (!config.clientId || !config.clientSecret) {
    const err = new Error('car_rental_not_configured');
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
    const err = new Error('car_rental_token_url_missing');
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
    await logAmadeusError('car_rental_token_error', { error: payload });
    const err = new Error('car_rental_token_failed');
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

export async function searchCars(params = {}) {
  const config = await resolveConfig();
  if (!config.baseUrl) {
    // Return rich mock data when API is not configured
    return {
      results: getMockCars(params),
      meta: { source: 'mock', note: 'car_rental_api_not_configured' },
      warnings: null,
      raw: null,
    };
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
      (Array.isArray(payload.cars) && payload.cars) ||
      (Array.isArray(payload.items) && payload.items) ||
      [];

    const results = data.map(normalizeCarItem);

    return {
      results,
      meta: payload.meta || null,
      warnings: payload.warnings || null,
      raw: payload,
    };
  } catch (error) {
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('car_rental_search_error', { params, error: payload });
    const err = new Error('car_rental_search_failed');
    err.cause = payload;
    err.status = error?.response?.status || 502;
    throw err;
  }
}

export async function getCarDetails(params = {}) {
  const { carId } = params;
  if (!carId) {
    const err = new Error('missing_car_id');
    err.status = 400;
    throw err;
  }
  // If an external API is configured, fetch details from it
  const config = await resolveConfig();
  if (config.baseUrl) {
    try {
      const url = buildUrl(config.baseUrl, config.detailsPath);
      const headers = await buildAuthHeaders(config);
      const res = await axios.get(url, { params: { id: carId }, headers, timeout: 15000 });
      const item = res.data?.result || res.data || {};
      return normalizeCarItem(item);
    } catch (e) {
      await logAmadeusError('car_details_error', { error: e?.message });
    }
  }
  // Fallback: return the ID so frontend can display cached data
  return { id: carId, name: null, message: 'details_from_cache' };
}

export async function bookCar(_params = {}) {
  const params = _params || {};
  const { offerId, carId, renter, payment } = params;
  if (!offerId && !carId) {
    const err = new Error('missing_offer_or_car_id');
    err.status = 400;
    throw err;
  }

  const record = {
    id: uuid(),
    type: 'car',
    provider: 'car_rental_service',
    provider_offer_id: offerId || null,
    provider_car_id: carId || null,
    status: 'created',
    raw_request: params,
  };

  const saved = await insertBooking(record);
  const response = { booking: saved, bookingId: record.id };
  if (payment && payment.amount) response.paymentInfo = createMockMoyasarPayment(payment);
  return response;
}

function getMockCars(params = {}) {
  const location = String(params.pickupLocation || params.location || '').toLowerCase();
  const cars = [
    { id: 'car-m1', name: 'Toyota Camry 2025', category: 'Sedan', transmission: 'Automatic', fuel: 'بنزين', seats: 5, doors: 4, vendor: 'Budget', image: null, priceTotal: 180, currency: 'SAR', pickup: 'مطار الملك عبدالعزيز - جدة', dropoff: 'مطار الملك عبدالعزيز - جدة' },
    { id: 'car-m2', name: 'Hyundai Tucson 2025', category: 'SUV', transmission: 'Automatic', fuel: 'بنزين', seats: 5, doors: 4, vendor: 'Hertz', image: null, priceTotal: 250, currency: 'SAR', pickup: 'مطار الملك خالد - الرياض', dropoff: 'مطار الملك خالد - الرياض' },
    { id: 'car-m3', name: 'Kia K5 2025', category: 'Sedan', transmission: 'Automatic', fuel: 'بنزين', seats: 5, doors: 4, vendor: 'Avis', image: null, priceTotal: 165, currency: 'SAR', pickup: 'مطار الملك فهد - الدمام', dropoff: 'مطار الملك فهد - الدمام' },
    { id: 'car-m4', name: 'Toyota Land Cruiser 2025', category: 'SUV', transmission: 'Automatic', fuel: 'بنزين', seats: 7, doors: 4, vendor: 'Enterprise', image: null, priceTotal: 450, currency: 'SAR', pickup: 'مطار الملك عبدالعزيز - جدة', dropoff: 'مطار الملك عبدالعزيز - جدة' },
    { id: 'car-m5', name: 'Nissan Sunny 2025', category: 'Economy', transmission: 'Automatic', fuel: 'بنزين', seats: 5, doors: 4, vendor: 'Budget', image: null, priceTotal: 120, currency: 'SAR', pickup: 'وسط المدينة - جدة', dropoff: 'وسط المدينة - جدة' },
    { id: 'car-m6', name: 'Mercedes E-Class 2025', category: 'Luxury', transmission: 'Automatic', fuel: 'بنزين', seats: 5, doors: 4, vendor: 'Sixt', image: null, priceTotal: 550, currency: 'SAR', pickup: 'مطار الملك خالد - الرياض', dropoff: 'مطار الملك خالد - الرياض' },
    { id: 'car-m7', name: 'GMC Yukon 2025', category: 'SUV', transmission: 'Automatic', fuel: 'بنزين', seats: 8, doors: 4, vendor: 'Hertz', image: null, priceTotal: 600, currency: 'SAR', pickup: 'مطار الملك خالد - الرياض', dropoff: 'فندق الفيصلية - الرياض' },
    { id: 'car-m8', name: 'Hyundai Accent 2025', category: 'Economy', transmission: 'Automatic', fuel: 'بنزين', seats: 5, doors: 4, vendor: 'Lumi', image: null, priceTotal: 110, currency: 'SAR', pickup: 'مطار الأمير محمد بن عبدالعزيز - المدينة', dropoff: 'مطار الأمير محمد بن عبدالعزيز - المدينة' },
  ];
  if (location) {
    const filtered = cars.filter(c => (c.pickup || '').toLowerCase().includes(location) || (c.dropoff || '').toLowerCase().includes(location));
    return filtered.length ? filtered : cars;
  }
  return cars;
}
