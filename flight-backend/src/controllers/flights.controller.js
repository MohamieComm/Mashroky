import * as amadeusService from '../services/amadeus.service.js';
import * as skyscannerService from '../services/skyscanner.service.js';
import * as duffelService from '../services/duffel.service.js';
import { createMockMoyasarPayment } from '../services/moyasar.service.js';
import { sendBookingEmail } from '../services/email.service.js';

const escapeHtml = (str) =>
  String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

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
const TRAVEL_CLASS_OPTIONS = new Set([
  'ECONOMY',
  'PREMIUM_ECONOMY',
  'BUSINESS',
  'FIRST',
]);

const isNonEmptyArray = (value) => Array.isArray(value) && value.length > 0;
const normalizeCode = (value) => String(value || '').trim().toUpperCase();
const isValidDate = (value) => Number.isFinite(Date.parse(value));

export async function searchFlights(req, res, next) {
  try {
    const {
      provider = 'amadeus',
      origin,
      destination,
      departureDate,
      returnDate,
      adults,
      airline,
      travelClass,
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
    if (returnDate && !isValidDate(returnDate)) {
      return res.status(400).json({ error: 'invalid_return_date' });
    }
    if (!Number.isFinite(adultCount) || adultCount < 1 || adultCount > 9) {
      return res.status(400).json({ error: 'invalid_passenger_count' });
    }

    const params = {
      origin: originCode,
      destination: destinationCode,
      departureDate,
      returnDate: returnDate || undefined,
      adults: adultCount,
      airline: AIRLINE_CODE_RE.test(airlineCode) ? airlineCode : undefined,
      travelClass: TRAVEL_CLASS_OPTIONS.has(String(travelClass || '').toUpperCase())
        ? String(travelClass).toUpperCase()
        : undefined,
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
    if (!isNonEmptyArray(flightOffers)) {
      return res.status(400).json({ error: 'missing_flight_offers' });
    }
    const result = await amadeusService.priceFlights({ flightOffers });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookAmadeus(req, res, next) {
  try {
    const { flightOffers, travelers, payment, sendEmail, customerEmail } = req.body || {};
    if (!isNonEmptyArray(flightOffers)) {
      return res.status(400).json({ error: 'missing_flight_offers' });
    }
    if (!isNonEmptyArray(travelers)) {
      return res.status(400).json({ error: 'missing_travelers' });
    }
    const result = await amadeusService.createOrder({ flightOffers, travelers });
    const flightOrder = result?.data || result || {};
    const offers = Array.isArray(flightOrder?.flightOffers) ? flightOrder.flightOffers : [];
    const associatedRecords = Array.isArray(flightOrder?.associatedRecords)
      ? flightOrder.associatedRecords
      : [];
    const bookingReference =
      associatedRecords.find((record) => record?.reference)?.reference ||
      flightOrder?.id ||
      '';
    const providerOrderId = flightOrder?.id || '';
    const response = {
      provider: 'amadeus',
      bookingReference,
      providerOrderId,
      offers,
      raw: result,
    };
    if (payment?.amount) {
      response.paymentInfo = createMockMoyasarPayment(payment);
    }
    if (sendEmail) {
      const passengerEmail =
        customerEmail ||
        flightOrder?.travelers?.find((p) => p?.contact?.emailAddress)?.contact?.emailAddress ||
        travelers?.find((t) => t?.contact?.emailAddress)?.contact?.emailAddress ||
        null;
      if (passengerEmail) {
        const bookingRef = bookingReference || providerOrderId || '';
        const total =
          offers.reduce(
            (sum, offer) =>
              sum + Number(offer?.price?.total || offer?.pricing?.total || 0),
            0
          ) || 0;
        const currency =
          offers?.[0]?.price?.currency ||
          offers?.[0]?.pricing?.currency ||
          flightOrder?.price?.currency ||
          'SAR';
        await sendBookingEmail({
          to: passengerEmail,
          subject: 'تأكيد حجز مشروك',
          text: `تم إصدار الحجز بنجاح. رقم الحجز: ${bookingRef}. الإجمالي: ${total} ${currency}.`,
          html: `
            <div style="font-family:Arial,sans-serif;direction:rtl;text-align:right;">
              <h2>تأكيد حجز مشروك</h2>
              <p>تم إصدار الحجز بنجاح.</p>
              <p><strong>رقم الحجز:</strong> ${escapeHtml(bookingRef)}</p>
              <p><strong>الإجمالي:</strong> ${escapeHtml(total)} ${escapeHtml(currency)}</p>
              <p>شكراً لاختيارك مشروك.</p>
            </div>
          `,
        });
      }
    }
    res.json(response);
  } catch (err) {
    next(err);
  }
}

export async function bookDuffel(req, res, next) {
  try {
    const { offerId, passengers, payment } = req.body || {};
    if (!offerId || typeof offerId !== 'string') {
      return res.status(400).json({ error: 'missing_offer_id' });
    }
    if (!Array.isArray(passengers) || passengers.length === 0) {
      return res.status(400).json({ error: 'missing_passengers' });
    }
    const result = await duffelService.bookFlights({ offerId, passengers });
    if (payment?.amount) {
      result.paymentInfo = createMockMoyasarPayment(payment);
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function priceFlights(req, res, next) {
  return priceAmadeus(req, res, next);
}

export async function bookFlights(req, res, next) {
  return bookAmadeus(req, res, next);
}
