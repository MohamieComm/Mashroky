import { skyscannerClient } from '../config/skyscanner.config.js';

// ملاحظة: مسارات سكاي سكانر قد تختلف حسب الاشتراك. هذا طلب حي مبسّط.
export async function searchFlights({
  origin,
  destination,
  departureDate,
  adults = 1,
  currency = 'USD',
  market = 'SA',
  locale = 'en-US',
}) {
  const payload = {
    query: {
      market,
      locale,
      currency,
      queryLegs: [
        {
          originPlaceId: { iata: origin },
          destinationPlaceId: { iata: destination },
          date: {
            year: Number(departureDate.slice(0, 4)),
            month: Number(departureDate.slice(5, 7)),
            day: Number(departureDate.slice(8, 10)),
          },
        },
      ],
      adults,
    },
  };

  const { data } = await skyscannerClient.post(
    '/apiservices/v3/flights/live/search/create',
    payload
  );
  return data;
}
