import { amadeusClient } from '../config/amadeus.config.js';
import { parseISODurationToMinutes } from '../utils/duration.js';

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

export async function searchFlights({ origin, destination, departureDate, adults = 1, airline }) {
  const params = {
    originLocationCode: origin,
    destinationLocationCode: destination,
    departureDate,
    adults: String(adults),
    currencyCode: 'SAR',
    max: 30,
  };
  if (airline) params.includedAirlineCodes = airline;
  const response = await amadeusClient.shopping.flightOffersSearch.get(params);
  const result = response.result;
  const offers = result?.data || result || [];
  return offers.map(mapAmadeusOfferToDTO);
}

export async function listAirlines({ codes }) {
  if (!codes) return [];
  const response = await amadeusClient.referenceData.airlines.get({
    airlineCodes: codes,
  });
  const result = response.result;
  const list = result?.data || result || [];
  return list.map((item) => ({
    code: item.iataCode || item.icaoCode || item.airlineCode || item.code,
    name: item.commonName || item.businessName || item.name || item.airlineName,
  }));
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
  const result = response.result;
  return mapAmadeusOrderToDTO(result);
}
