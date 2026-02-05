import { duffelClient } from '../config/duffel.config.js';
import { parseISODurationToMinutes } from '../utils/duration.js';

function mapDuffelOfferToDTO(offer) {
  const slices = (offer.slices || []).map((slice) =>
    (slice.segments || []).map((seg) => {
      const durationMinutes = parseISODurationToMinutes(seg.duration);
      return {
        marketingCarrier: seg.marketing_carrier?.iata_code,
        operatingCarrier:
          seg.operating_carrier?.iata_code || seg.marketing_carrier?.iata_code,
        flightNumber: seg.flight_number,
        origin: seg.origin?.iata_code,
        destination: seg.destination?.iata_code,
        departureTime: seg.departing_at,
        arrivalTime: seg.arriving_at,
        durationMinutes,
        aircraft: seg.aircraft?.iata_code || seg.aircraft?.name || null,
      };
    })
  );

  const totalAmount = offer.total_amount || offer.price?.total || '0';
  const currency = offer.total_currency || offer.price?.currency || 'USD';

  const cabinsSet = new Set();
  (offer.slices || []).forEach((slice) => {
    (slice.segments || []).forEach((seg) => {
      if (seg.cabin_class) cabinsSet.add(String(seg.cabin_class).toUpperCase());
    });
  });

  let refundable = null;
  if (offer.refunds && Array.isArray(offer.refunds)) {
    refundable = offer.refunds.some((r) => r.type === 'refundable');
  }

  return {
    provider: 'duffel',
    providerOfferId: offer.id,
    slices,
    pricing: {
      currency,
      total: Number(totalAmount),
      base: null,
      taxes: null,
    },
    cabins: Array.from(cabinsSet),
    refundable,
    baggageInfo: {},
  };
}

function mapDuffelOrderToDTO(order) {
  const data = order?.data || order || {};
  const providerOrderId = data.id;
  const bookingReference = data.booking_reference || null;
  const createdAt = data.created_at || null;

  const passengers = (data.passengers || []).map((p) => ({
    id: p.id,
    firstName: p.given_name,
    lastName: p.family_name,
    title: p.title,
    email: p.email,
    phone: p.phone_number,
  }));

  const offers = (data.offers || []).map((offer) => mapDuffelOfferToDTO(offer));
  let status = 'UNKNOWN';
  if (data.status === 'confirmed') status = 'CONFIRMED';
  else if (data.status === 'cancelled') status = 'CANCELLED';
  else if (data.status === 'pending') status = 'PENDING';

  return {
    provider: 'duffel',
    providerOrderId,
    bookingReference,
    createdAt,
    passengers,
    offers,
    status,
    raw: order,
  };
}

export async function searchFlights({ origin, destination, departureDate, adults = 1 }) {
  const offerRequest = await duffelClient.offerRequests.create({
    slices: [
      {
        origin,
        destination,
        departure_date: departureDate,
      },
    ],
    passengers: Array.from({ length: adults }).map(() => ({ type: 'adult' })),
    cabin_class: 'economy',
  });
  const offers = offerRequest?.offers || offerRequest?.data || [];
  return offers.map(mapDuffelOfferToDTO);
}

export async function bookFlights({ offerId, passengers }) {
  const order = await duffelClient.orders.create({
    selected_offers: [offerId],
    passengers: passengers.map((p, index) => ({
      id: `passenger_${index + 1}`,
      type: 'adult',
      title: p.title || 'mr',
      given_name: p.firstName,
      family_name: p.lastName,
      email: p.email,
      phone_number: p.phone,
    })),
  });
  return mapDuffelOrderToDTO(order);
}
