import axios from 'axios';
import { getAccessToken } from './amadeus.service.js';
import { getApiBaseUrl } from './api-keys.service.js';
import { logAmadeusError } from '../utils/amadeus-logger.js';

const DEFAULT_TEST_BASE = 'https://test.api.amadeus.com';
const DEFAULT_PROD_BASE = 'https://api.amadeus.com';
const MAX_HOTEL_IDS = 20;

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

const normalizePriceRange = (min, max) => {
  const minVal = toNumber(min);
  const maxVal = toNumber(max);
  if (!minVal && !maxVal) return undefined;
  if (minVal && maxVal) return `${minVal}-${maxVal}`;
  if (minVal) return `${minVal}-`;
  return `-${maxVal}`;
};

const normalizeHotelOffer = (item) => {
  const hotel = item?.hotel || {};
  const offers = Array.isArray(item?.offers) ? item.offers : [];
  const normalizedOffers = offers.map((offer) => ({
    id: offer?.id || null,
    checkInDate: offer?.checkInDate || null,
    checkOutDate: offer?.checkOutDate || null,
    room: offer?.room || null,
    guests: offer?.guests || null,
    price: offer?.price || null,
    policies: offer?.policies || null,
    self: offer?.self || null,
  }));
  const cheapest = normalizedOffers.reduce((best, current) => {
    const currentTotal = toNumber(current?.price?.total);
    const bestTotal = toNumber(best?.price?.total);
    if (currentTotal === undefined) return best;
    if (bestTotal === undefined || currentTotal < bestTotal) return current;
    return best;
  }, normalizedOffers[0] || null);

  return {
    id: hotel?.hotelId || hotel?.id || null,
    name: hotel?.name || null,
    chainCode: hotel?.chainCode || null,
    cityCode: hotel?.cityCode || null,
    rating: hotel?.rating ? Number(hotel.rating) : null,
    amenities: hotel?.amenities || [],
    address: hotel?.address || null,
    contact: hotel?.contact || null,
    geoCode: hotel?.geoCode || null,
    distance: hotel?.distance || null,
    media: hotel?.media || [],
    description: hotel?.description || null,
    offers: normalizedOffers,
    cheapestOffer: cheapest,
    available: item?.available ?? null,
    raw: item,
  };
};

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

function buildAuthHeader(tokenObj) {
  const tokenType = tokenObj?.tokenType || 'Bearer';
  const accessToken = tokenObj?.accessToken || tokenObj?.access_token || '';
  return `${tokenType} ${accessToken}`.trim();
}

export async function getAccessTokenForHotels() {
  return getAccessToken();
}

export async function searchHotels(params = {}) {
  const {
    cityCode,
    hotelIds,
    checkInDate,
    checkOutDate,
    adults,
    roomQuantity,
    priceMin,
    priceMax,
    priceRange,
    currency,
    ratings,
    amenities,
    radius,
    radiusUnit,
    latitude,
    longitude,
    chainCodes,
    sort,
  } = params;

  const base = await resolveBaseUrl();
  const token = await getAccessTokenForHotels();

  const ids = toArray(hotelIds).slice(0, MAX_HOTEL_IDS);
  const ratingsList = toArray(ratings).map((value) => String(value));
  const amenitiesList = toArray(amenities).map((value) => String(value).toUpperCase());
  const chainList = toArray(chainCodes).map((value) => String(value).toUpperCase());
  const computedPriceRange = priceRange || normalizePriceRange(priceMin, priceMax);

  const query = {
    cityCode: cityCode || undefined,
    hotelIds: ids.length ? ids.join(',') : undefined,
    checkInDate: checkInDate || undefined,
    checkOutDate: checkOutDate || undefined,
    adults: adults || undefined,
    roomQuantity: roomQuantity || undefined,
    priceRange: computedPriceRange,
    currency: currency || undefined,
    ratings: ratingsList.length ? ratingsList.join(',') : undefined,
    amenities: amenitiesList.length ? amenitiesList.join(',') : undefined,
    radius: radius || undefined,
    radiusUnit: radiusUnit || undefined,
    latitude: latitude || undefined,
    longitude: longitude || undefined,
    chainCodes: chainList.length ? chainList.join(',') : undefined,
    sort: sort || undefined,
  };

  if (!query.cityCode && !query.hotelIds && !(query.latitude && query.longitude)) {
    const err = new Error('missing_search_location');
    err.status = 400;
    throw err;
  }

  try {
    const res = await axios.get(`${base}/v3/shopping/hotel-offers`, {
      params: query,
      headers: {
        Authorization: buildAuthHeader(token),
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    });

    const payload = res?.data || {};
    const data = Array.isArray(payload.data) ? payload.data : [];
    const results = data.map(normalizeHotelOffer);

    return {
      results,
      meta: payload.meta || null,
      warnings: payload.warnings || null,
      raw: payload,
    };
  } catch (error) {
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('hotel_search_error', { params: query, error: payload });
    const err = new Error('hotel_search_failed');
    err.cause = payload;
    err.status = error?.response?.status || 502;
    throw err;
  }
}

export async function getHotelDetails(params = {}) {
  const { hotelId } = params;
  if (!hotelId) {
    const err = new Error('missing_hotel_id');
    err.status = 400;
    throw err;
  }
  const base = await resolveBaseUrl();
  const token = await getAccessTokenForHotels();

  try {
    const res = await axios.get(`${base}/v3/shopping/hotel-offers/by-hotel`, {
      params: { hotelId },
      headers: {
        Authorization: buildAuthHeader(token),
        'Content-Type': 'application/json',
      },
      timeout: 20000,
    });
    const payload = res?.data || {};
    const data = Array.isArray(payload.data) ? payload.data : [];
    return {
      results: data.map(normalizeHotelOffer),
      meta: payload.meta || null,
      warnings: payload.warnings || null,
      raw: payload,
    };
  } catch (error) {
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('hotel_details_error', { hotelId, error: payload });
    const err = new Error('hotel_details_failed');
    err.cause = payload;
    err.status = error?.response?.status || 502;
    throw err;
  }
}

export async function bookHotel(_params = {}) {
  const err = new Error('hotel_booking_not_implemented');
  err.status = 501;
  throw err;
}
