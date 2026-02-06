import * as amadeusService from '../services/amadeus.service.js';
import * as skyscannerService from '../services/skyscanner.service.js';
import * as duffelService from '../services/duffel.service.js';
import { createMockMoyasarPayment } from '../services/moyasar.service.js';

const DEFAULT_AIRLINE_CODES = [
  'SV',
  'EK',
  'FZ',
  'XY',
  'MS',
  'TK',
  'QR',
  'LH',
  'BA',
  'UA',
];

const AIRPORT_CODE_RE = /^[A-Z]{3}$/;
const AIRLINE_CODE_RE = /^[A-Z0-9]{2,3}$/;
const MAX_AIRLINE_CODES = 50;

const normalizeCode = (value) => String(value || '').trim().toUpperCase();
const isValidDate = (value) => Number.isFinite(Date.parse(value));

export async function searchFlights(req, res, next) {
  try {
    const {
      provider = 'amadeus',
      origin,
      destination,
      departureDate,
      adults,
      airline,
    } = req.body || {};

    const originCode = normalizeCode(origin);
    const destinationCode = normalizeCode(destination);
    const airlineCode = normalizeCode(airline);
    const adultCount = Number(adults || 1);

    if (!AIRPORT_CODE_RE.test(originCode) || !AIRPORT_CODE_RE.test(destinationCode)) {
      return res.status(400).json({ error: 'invalid_airport_code' });
    }
    if (!departureDate || !isValidDate(departureDate)) {
      return res.status(400).json({ error: 'invalid_departure_date' });
    }
    if (!Number.isFinite(adultCount) || adultCount < 1 || adultCount > 9) {
      return res.status(400).json({ error: 'invalid_passenger_count' });
    }

    const params = {
      origin: originCode,
      destination: destinationCode,
      departureDate,
      adults: adultCount,
      airline: AIRLINE_CODE_RE.test(airlineCode) ? airlineCode : undefined,
    };

    let results = [];
    if (provider === 'amadeus') results = await amadeusService.searchFlights(params);
    else if (provider === 'skyscanner') results = await skyscannerService.searchFlights(params);
    else if (provider === 'duffel') results = await duffelService.searchFlights(params);
    else if (provider === 'all') {
      const [a, s, d] = await Promise.all([
        amadeusService.searchFlights(params),
        skyscannerService.searchFlights(params),
        duffelService.searchFlights(params),
      ]);
      results = [...a, ...s, ...d];
    } else return res.status(400).json({ error: 'unknown_provider' });

    res.json({ results });
  } catch (err) {
    next(err);
  }
}

export async function listAirlines(req, res, next) {
  try {
    const codesParam = String(req.query.codes || '').trim();
    const codesList = (codesParam ? codesParam.split(',') : DEFAULT_AIRLINE_CODES)
      .map(normalizeCode)
      .filter((code) => AIRLINE_CODE_RE.test(code));
    const unique = Array.from(new Set(codesList)).slice(0, MAX_AIRLINE_CODES);
    const codes = (unique.length ? unique : DEFAULT_AIRLINE_CODES).join(',');
    const results = await amadeusService.listAirlines({ codes });
    res.json({ results });
  } catch (err) {
    next(err);
  }
}

export async function priceAmadeus(req, res, next) {
  try {
    const { flightOffers } = req.body || {};
    const result = await amadeusService.priceFlights({ flightOffers });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookAmadeus(req, res, next) {
  try {
    const { flightOffers, travelers, payment } = req.body || {};
    const result = await amadeusService.bookFlights({ flightOffers, travelers });
    if (payment?.amount) {
      result.paymentInfo = createMockMoyasarPayment(payment);
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookDuffel(req, res, next) {
  try {
    const { offerId, passengers, payment } = req.body || {};
    const result = await duffelService.bookFlights({ offerId, passengers });
    if (payment?.amount) {
      result.paymentInfo = createMockMoyasarPayment(payment);
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}
