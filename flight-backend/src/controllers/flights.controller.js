import * as amadeusService from '../services/amadeus.service.js';
import * as skyscannerService from '../services/skyscanner.service.js';
import * as duffelService from '../services/duffel.service.js';
import { createMockMoyasarPayment } from '../services/moyasar.service.js';

export async function searchFlights(req, res, next) {
  try {
    const { provider = 'amadeus', ...params } = req.body || {};
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
