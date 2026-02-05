import { skyscannerClient } from '../config/skyscanner.config.js';

function mapSkyscannerToDTOs(raw) {
  const offers = raw?.itineraries || raw?.offers || [];

  return offers.map((offer) => {
    const slices = (offer.legs || []).map((leg) =>
      (leg.segments || []).map((seg) => {
        const duration = seg.durationInMinutes || seg.duration || 0;
        return {
          marketingCarrier: seg.marketingCarrier?.code || seg.carrierCode,
          operatingCarrier: seg.operatingCarrier?.code || seg.marketingCarrier?.code,
          flightNumber: seg.flightNumber,
          origin: seg.origin?.iata || seg.origin,
          destination: seg.destination?.iata || seg.destination,
          departureTime: seg.departure || seg.departureTime,
          arrivalTime: seg.arrival || seg.arrivalTime,
          durationMinutes: Number(duration),
          aircraft: seg.aircraft?.code || null,
        };
      })
    );

    const price = offer.price || {};
    const currency = price.currency || 'USD';
    const total = Number(price.amount || price.total || 0);
    const cabins = (offer.cabins || ['ECONOMY']).map((c) => String(c).toUpperCase());

    return {
      provider: 'skyscanner',
      providerOfferId: offer.id || offer.itineraryId,
      slices,
      pricing: {
        currency,
        total,
        base: null,
        taxes: null,
      },
      cabins,
      refundable: offer.refundable ?? null,
      baggageInfo: {},
    };
  });
}

function buildSkyscannerPayload({
  origin,
  destination,
  departureDate,
  adults = 1,
  currency = 'USD',
  market = 'SA',
  locale = 'en-US',
}) {
  return {
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
}

// ملاحظة: مسارات سكاي سكانر قد تختلف حسب الاشتراك.
export async function searchFlights(params) {
  const payload = buildSkyscannerPayload(params);
  const { data } = await skyscannerClient.post(
    '/apiservices/v3/flights/live/search/create',
    payload
  );
  return mapSkyscannerToDTOs(data);
}
