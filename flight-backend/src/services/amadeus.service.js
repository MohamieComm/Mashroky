import { amadeusClient } from '../config/amadeus.config.js';

export async function searchFlights({ origin, destination, departureDate, adults = 1 }) {
  const response = await amadeusClient.shopping.flightOffersSearch.get({
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults: String(adults),
    currencyCode: 'USD',
    max: 30,
  });
  return response.result;
}

export async function priceFlights({ flightOffers }) {
  const response = await amadeusClient.shopping.flightOffers.pricing.post(
    JSON.stringify({
      data: {
        type: 'flight-offers-pricing',
        flightOffers,
      },
    })
  );
  return response.result;
}

export async function bookFlights({ flightOffers, travelers }) {
  const response = await amadeusClient.booking.flightOrders.post(
    JSON.stringify({
      data: {
        type: 'flight-order',
        flightOffers,
        travelers,
      },
    })
  );
  return response.result;
}
