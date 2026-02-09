import axios from 'axios';
import { amadeusClient } from '../config/amadeus.config.js';
import { amadeusEnv } from '../config/env.config.js';
import { parseISODurationToMinutes } from '../utils/duration.js';
import { logAmadeusError } from '../utils/amadeus-logger.js';

const ensureAmadeusConfigured = () => {
  if (!amadeusEnv.clientId || !amadeusEnv.clientSecret) {
    const err = new Error('amadeus_not_configured');
    err.status = 500;
    throw err;
  }
};

const resolveAmadeusBaseUrl = () => {
  const base = String(process.env.AMADEUS_BASE_URL || '').trim();
  if (base) return base.replace(/\/$/, '');
  const env = String(process.env.AMADEUS_ENV || '').toLowerCase();
  return env === 'production' || env === 'prod'
    ? 'https://api.amadeus.com'
    : 'https://test.api.amadeus.com';
};

const normalizeTravelClass = (value) => {
  const raw = String(value || '').trim();
  if (!raw) return '';
  const upper = raw.toUpperCase();
  if (upper === 'ECONOMY' || upper === 'BUSINESS' || upper === 'FIRST' || upper === 'PREMIUM_ECONOMY') {
    return upper;
  }
  const map = {
    economy: 'ECONOMY',
    premiumeconomy: 'PREMIUM_ECONOMY',
    premium_economy: 'PREMIUM_ECONOMY',
    business: 'BUSINESS',
    first: 'FIRST',
  };
  return map[raw.toLowerCase()] || '';
};

export async function getAccessToken() {
  ensureAmadeusConfigured();
  const tokenUrl = `${resolveAmadeusBaseUrl()}/v1/security/oauth2/token`;
  try {
    const body = new URLSearchParams();
    body.set('grant_type', 'client_credentials');
    body.set('client_id', amadeusEnv.clientId);
    body.set('client_secret', amadeusEnv.clientSecret);

    const response = await axios.post(tokenUrl, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: 15000,
    });

    const data = response?.data || {};
    return {
      accessToken: data.access_token || '',
      tokenType: data.token_type || 'Bearer',
      expiresIn: data.expires_in || 0,
      raw: data,
    };
  } catch (error) {
    const errorPayload = error?.response?.data || error?.message || error;
    console.error('amadeus_token_error', errorPayload);
    await logAmadeusError('amadeus_token_error', { error: errorPayload });
    const err = new Error('amadeus_token_failed');
    err.status = 502;
    throw err;
  }
}

export function mapAmadeusOfferToDTO(offer) {
  const slices = (offer.itineraries || []).map((itinerary) =>
    (itinerary.segments || []).map((seg) => {
      const dep = seg.departure || {};
      const arr = seg.arrival || {};
      const durationMinutes = parseISODurationToMinutes(seg.duration);
      return {
        marketingCarrier: seg.carrierCode,
        operatingCarrier: seg.operating?.carrierCode || seg.carrierCode,
        flightNumber: seg.number,
        origin: dep.iataCode,
        destination: arr.iataCode,
        departureTime: dep.at,
        arrivalTime: arr.at,
        durationMinutes,
        aircraft: seg.aircraft?.code || null,
      };
    })
  );

  const price = offer.price || {};
  const fees = Array.isArray(price.fees) ? price.fees : [];
  const taxes =
    fees.length > 0
      ? fees.reduce((sum, f) => sum + Number(f.amount || 0), 0)
      : null;

  const cabinsSet = new Set();
  (offer.travelerPricings || []).forEach((tp) => {
    (tp.fareDetailsBySegment || []).forEach((fd) => {
      if (fd.cabin) cabinsSet.add(String(fd.cabin).toUpperCase());
    });
  });

  return {
    provider: 'amadeus',
    providerOfferId: offer.id,
    slices,
    raw: offer,
    pricing: {
      currency: price.currency || 'USD',
      total: Number(price.total || 0),
      base: price.base ? Number(price.base) : null,
      taxes,
    },
    cabins: Array.from(cabinsSet),
    refundable: null,
    baggageInfo: {},
  };
}

function mapAmadeusOrderToDTO(order) {
  const data = order?.data || order || {};

  let bookingReference = null;
  if (Array.isArray(data.associatedRecords) && data.associatedRecords.length > 0) {
    bookingReference = data.associatedRecords[0].reference || null;
  }

  const passengers = (data.travelers || []).map((t) => ({
    id: t.id,
    firstName: t.name?.firstName,
    lastName: t.name?.lastName,
    title: undefined,
    email: t.contact?.emailAddress,
    phone: t.contact?.phones?.[0]
      ? `+${t.contact.phones[0].countryCallingCode}${t.contact.phones[0].number}`
      : undefined,
  }));

  const offers = (data.flightOffers || []).map((fo) => mapAmadeusOfferToDTO(fo));
  const createdAt = data.bookingDate || data.creationDate || null;

  return {
    provider: 'amadeus',
    providerOrderId: data.id,
    bookingReference,
    createdAt,
    passengers,
    offers,
    status: 'CONFIRMED',
    raw: order,
  };
}

export async function searchFlights({
  origin,
  destination,
  departureDate,
  returnDate,
  adults = 1,
  airline,
  travelClass,
}) {
  ensureAmadeusConfigured();
  const params = {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults: String(adults),
    currencyCode: 'SAR',
    max: 30,
  };
  if (returnDate) params.returnDate = returnDate;
  const airlineCodes = Array.isArray(airline)
    ? airline.filter(Boolean).join(',')
    : String(airline || '').trim();
  if (airlineCodes) params.includedAirlineCodes = airlineCodes;
  const normalizedClass = normalizeTravelClass(travelClass);
  if (normalizedClass) params.travelClass = normalizedClass;
  try {
    const response = await amadeusClient.shopping.flightOffersSearch.get(params);
    const result = response.result;
    const offers = result?.data || result || [];
    return offers.map(mapAmadeusOfferToDTO);
  } catch (error) {
    const errorPayload = error?.response?.data || error?.message || error;
    console.error('amadeus_search_error', errorPayload);
    await logAmadeusError('amadeus_search_error', {
      params,
      error: errorPayload,
    });
    throw error;
  }
}

export async function listAirlines({ codes }) {
  ensureAmadeusConfigured();
  if (!codes) return [];
  try {
    const response = await amadeusClient.referenceData.airlines.get({
      airlineCodes: codes,
    });
    const result = response.result;
    const list = result?.data || result || [];
    return list.map((item) => ({
      code: item.iataCode || item.icaoCode || item.airlineCode || item.code,
      name: item.commonName || item.businessName || item.name || item.airlineName,
    }));
  } catch (error) {
    const errorPayload = error?.response?.data || error?.message || error;
    console.error('amadeus_airlines_error', errorPayload);
    await logAmadeusError('amadeus_airlines_error', { codes, error: errorPayload });
    throw error;
  }
}

export async function priceFlights({ flightOffers }) {
  ensureAmadeusConfigured();
  try {
    const response = await amadeusClient.shopping.flightOffers.pricing.post(
      JSON.stringify({
        data: {
          type: 'flight-offers-pricing',
          flightOffers,
        },
      })
    );
    return response.result;
  } catch (error) {
    const errorPayload = error?.response?.data || error?.message || error;
    console.error('amadeus_price_error', errorPayload);
    await logAmadeusError('amadeus_price_error', {
      error: errorPayload,
    });
    throw error;
  }
}

export async function bookFlights({ flightOffers, travelers }) {
  ensureAmadeusConfigured();
  try {
    const response = await amadeusClient.booking.flightOrders.post(
      JSON.stringify({
        data: {
          type: 'flight-order',
          flightOffers,
          travelers,
        },
      })
    );
    const result = response.result;
    return mapAmadeusOrderToDTO(result);
  } catch (error) {
    const errorPayload = error?.response?.data || error?.message || error;
    console.error('amadeus_booking_error', errorPayload);
    await logAmadeusError('amadeus_booking_error', {
      error: errorPayload,
    });
    throw error;
  }
}
