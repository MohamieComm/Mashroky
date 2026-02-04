import * as amadeusService from '../services/amadeus.service.js';
import * as skyscannerService from '../services/skyscanner.service.js';
import * as duffelService from '../services/duffel.service.js';

export async function searchFlights(req, res, next) {
  try {
    const { provider = 'amadeus', ...params } = req.body || {};
    let result;
    if (provider === 'amadeus') result = await amadeusService.searchFlights(params);
    else if (provider === 'skyscanner') result = await skyscannerService.searchFlights(params);
    else if (provider === 'duffel') result = await duffelService.searchFlights(params);
    else return res.status(400).json({ error: 'unknown_provider' });

    res.json({ provider, result });
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
    const { flightOffers, travelers } = req.body || {};
    const result = await amadeusService.bookFlights({ flightOffers, travelers });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function bookDuffel(req, res, next) {
  try {
    const { offerId, passengers } = req.body || {};
    const result = await duffelService.bookFlights({ offerId, passengers });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
