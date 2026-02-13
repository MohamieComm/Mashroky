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
    String(process.env.TOURS_BASE_URL || '').trim() ||
    (await getApiBaseUrl('tours')) ||
    (await getApiKeyValue('tours', 'base_url'));

  const searchPath =
    String(process.env.TOURS_SEARCH_PATH || '').trim() ||
    (await getApiKeyValue('tours', 'search_path')) ||
    DEFAULT_SEARCH_PATH;

  const detailsPath =
    String(process.env.TOURS_DETAILS_PATH || '').trim() ||
    (await getApiKeyValue('tours', 'details_path')) ||
    DEFAULT_DETAILS_PATH;

  const bookPath =
    String(process.env.TOURS_BOOK_PATH || '').trim() ||
    (await getApiKeyValue('tours', 'book_path')) ||
    DEFAULT_BOOK_PATH;

  const clientId =
    String(process.env.TOURS_CLIENT_ID || '').trim() ||
    (await getApiKeyValue('tours', 'client_id'));
  const clientSecret =
    String(process.env.TOURS_CLIENT_SECRET || '').trim() ||
    (await getApiKeyValue('tours', 'client_secret'));
  const tokenUrl =
    String(process.env.TOURS_TOKEN_URL || '').trim() ||
    (await getApiKeyValue('tours', 'token_url'));

  const apiKey =
    String(process.env.TOURS_API_KEY || '').trim() ||
    (await getApiKeyValue('tours', 'api_key'));
  const apiKeyHeader =
    String(process.env.TOURS_API_KEY_HEADER || '').trim() ||
    (await getApiKeyValue('tours', 'api_key_header')) ||
    DEFAULT_API_KEY_HEADER;

  const authType =
    String(process.env.TOURS_AUTH_TYPE || '').trim().toLowerCase() ||
    String(await getApiKeyValue('tours', 'auth_type') || '').trim().toLowerCase() ||
    (clientId && clientSecret ? 'oauth2' : apiKey ? 'apikey' : 'none');

  const searchMethod =
    String(process.env.TOURS_SEARCH_METHOD || '').trim().toUpperCase() ||
    String(await getApiKeyValue('tours', 'search_method') || '').trim().toUpperCase() ||
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
    const rawPath = String(path || '');
    const cleanedPath = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
    return `${baseUrl.replace(/\/$/, '')}/${cleanedPath}`;
  }
};

const normalizeTourItem = (item) => {
  const price = item?.price || item?.pricing || item?.rate || {};
  const duration = item?.duration || item?.durationMinutes || item?.durationHours || null;
  return {
    id: item?.id || item?.tourId || item?.code || null,
    name: item?.name || item?.title || null,
    city: item?.city || item?.location || null,
    category: item?.category || item?.type || null,
    rating: item?.rating ? Number(item.rating) : null,
    duration,
    image: item?.image || item?.imageUrl || null,
    priceTotal: price?.total || price?.amount || item?.total || null,
    currency: price?.currency || item?.currency || null,
    summary: item?.summary || item?.shortDescription || null,
    meetingPoint: item?.meetingPoint || item?.pickupPoint || null,
    raw: item,
  };
};

export async function getAccessToken() {
  const config = await resolveConfig();
  if (config.authType !== 'oauth2') return null;
  if (!config.clientId || !config.clientSecret) {
    const err = new Error('tours_not_configured');
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
    const err = new Error('tours_token_url_missing');
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
    await logAmadeusError('tours_token_error', { error: payload });
    const err = new Error('tours_token_failed');
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

function getMockTours(params) {
  const city = params?.city || params?.destination || 'الرياض';
  return [
    {
      id: 'tour-mock-1',
      name: `جولة مدينة ${city} التراثية`,
      type: 'cultural',
      category: 'مغامرة ثقافية',
      duration: '4 ساعات',
      maxGroupSize: 15,
      languages: ['العربية', 'الإنجليزية'],
      image: null,
      priceTotal: 280,
      currency: 'SAR',
      summary: `اكتشف معالم ${city} التاريخية والثقافية مع مرشد محترف يأخذك في رحلة عبر الزمن`,
      meetingPoint: `فندق هيلتون - ${city}`,
      rating: 4.8,
      reviewsCount: 124,
    },
    {
      id: 'tour-mock-2',
      name: 'رحلة صحراوية مع عشاء بدوي',
      type: 'adventure',
      category: 'مغامرة',
      duration: '6 ساعات',
      maxGroupSize: 20,
      languages: ['العربية', 'الإنجليزية'],
      image: null,
      priceTotal: 450,
      currency: 'SAR',
      summary: 'استمتع بتجربة الصحراء الحقيقية مع ركوب الجمال والعشاء البدوي تحت النجوم',
      meetingPoint: 'بوابة المخيم الصحراوي',
      rating: 4.9,
      reviewsCount: 256,
    },
    {
      id: 'tour-mock-3',
      name: 'جولة تسوق الأسواق الشعبية',
      type: 'shopping',
      category: 'تسوق وترفيه',
      duration: '3 ساعات',
      maxGroupSize: 10,
      languages: ['العربية'],
      image: null,
      priceTotal: 150,
      currency: 'SAR',
      summary: 'اكتشف أجمل الأسواق الشعبية والتقليدية مع خبير محلي يعرف أفضل المتاجر والأسعار',
      meetingPoint: 'سوق الزل - المدخل الرئيسي',
      rating: 4.5,
      reviewsCount: 89,
    },
    {
      id: 'tour-mock-4',
      name: 'رحلة استكشاف الطبيعة والجبال',
      type: 'nature',
      category: 'طبيعة',
      duration: '8 ساعات',
      maxGroupSize: 12,
      languages: ['العربية', 'الإنجليزية'],
      image: null,
      priceTotal: 550,
      currency: 'SAR',
      summary: 'رحلة ليوم كامل لاستكشاف المناظر الطبيعية الخلابة والجبال مع وجبة غداء ومشروبات',
      meetingPoint: 'مركز الزوار - المنتزه الوطني',
      rating: 4.7,
      reviewsCount: 178,
    },
    {
      id: 'tour-mock-5',
      name: 'جولة طعام وأكلات شعبية',
      type: 'food',
      category: 'طعام',
      duration: '3 ساعات',
      maxGroupSize: 8,
      languages: ['العربية'],
      image: null,
      priceTotal: 200,
      currency: 'SAR',
      summary: 'تذوق أشهر الأكلات الشعبية والمأكولات التقليدية في جولة ممتعة مع خبير الطعام',
      meetingPoint: 'ساحة المطاعم المركزية',
      rating: 4.6,
      reviewsCount: 145,
    },
    {
      id: 'tour-mock-6',
      name: 'رحلة بحرية مع غوص وسباحة',
      type: 'water',
      category: 'بحري',
      duration: '5 ساعات',
      maxGroupSize: 16,
      languages: ['العربية', 'الإنجليزية'],
      image: null,
      priceTotal: 380,
      currency: 'SAR',
      summary: 'استمتع برحلة بحرية رائعة مع فرصة للغوص والسباحة في المياه الصافية',
      meetingPoint: 'مرسى القوارب - الكورنيش',
      rating: 4.8,
      reviewsCount: 203,
    },
  ];
}

export async function searchTours(params = {}) {
  const config = await resolveConfig();
  if (!config.baseUrl) {
    return { results: getMockTours(params), meta: { source: 'mock', total: 6 } };
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
      (Array.isArray(payload.tours) && payload.tours) ||
      (Array.isArray(payload.items) && payload.items) ||
      [];

    const results = data.map(normalizeTourItem);

    return {
      results,
      meta: payload.meta || null,
      warnings: payload.warnings || null,
      raw: payload,
    };
  } catch (error) {
    const payload = error?.response?.data || error?.message || error;
    await logAmadeusError('tours_search_error', { params, error: payload });
    const err = new Error('tours_search_failed');
    err.cause = payload;
    err.status = error?.response?.status || 502;
    throw err;
  }
}

export async function getTourDetails(params = {}) {
  const { tourId } = params;
  if (!tourId) {
    const err = new Error('missing_tour_id');
    err.status = 400;
    throw err;
  }
  const config = await resolveConfig();
  if (config.baseUrl) {
    try {
      const url = buildUrl(config.baseUrl, config.detailsPath);
      const headers = await buildAuthHeaders(config);
      const res = await axios.get(url, { params: { id: tourId }, headers, timeout: 15000 });
      const item = res.data?.result || res.data || {};
      return normalizeTourItem(item);
    } catch (e) {
      await logAmadeusError('tour_details_error', { error: e?.message });
    }
  }
  return { id: tourId, name: null, message: 'details_from_cache' };
}

export async function bookTour(_params = {}) {
  const params = _params || {};
  const { tourId, offerId, travelers, payment } = params;
  if (!offerId && !tourId) {
    const err = new Error('missing_offer_or_tour_id');
    err.status = 400;
    throw err;
  }

  const record = {
    id: uuid(),
    type: 'tour',
    provider: 'tours_service',
    provider_offer_id: offerId || null,
    provider_tour_id: tourId || null,
    status: 'created',
    raw_request: params,
  };

  const saved = await insertBooking(record);
  const response = { booking: saved, bookingId: record.id };
  if (payment && payment.amount) response.paymentInfo = createMockMoyasarPayment(payment);
  return response;
}
