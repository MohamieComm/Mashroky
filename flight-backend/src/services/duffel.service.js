import { duffelClient } from '../config/duffel.config.js';

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
  return offerRequest;
}

export async function bookFlights({ offerId, passengers }) {
  const order = await duffelClient.orders.create({
    selected_offers: [offerId],
    passengers: passengers.map((p) => ({
      type: 'adult',
      title: p.title || 'mr',
      given_name: p.firstName,
      family_name: p.lastName,
      email: p.email,
      phone_number: p.phone,
    })),
  });
  return order;
}
