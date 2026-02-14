// ============================================================
// Amadeus SDK — Unified Entry Point
// All 34 endpoints organized by namespace
// ============================================================

import { AmadeusClient } from './client';
import { AmadeusConfig } from './types';
import * as T from './types';

export class Amadeus {
  private client: AmadeusClient;

  public shopping: Shopping;
  public booking: Booking;
  public referenceData: ReferenceData;
  public schedule: Schedule;
  public travel: Travel;
  public analytics: Analytics;

  constructor(config: AmadeusConfig) {
    this.client = new AmadeusClient(config);
    this.shopping = new Shopping(this.client);
    this.booking = new Booking(this.client);
    this.referenceData = new ReferenceData(this.client);
    this.schedule = new Schedule(this.client);
    this.travel = new Travel(this.client);
    this.analytics = new Analytics(this.client);
  }
}

// ── Shopping ────────────────────────────────────────────────

class Shopping {
  public flightOffers: FlightOffersShopping;
  public hotelOffers: HotelOffersShopping;
  public activities: ActivitiesShopping;
  public transferOffers: TransferOffersShopping;
  public seatMaps: SeatMapsShopping;

  constructor(private client: AmadeusClient) {
    this.flightOffers = new FlightOffersShopping(client);
    this.hotelOffers = new HotelOffersShopping(client);
    this.activities = new ActivitiesShopping(client);
    this.transferOffers = new TransferOffersShopping(client);
    this.seatMaps = new SeatMapsShopping(client);
  }
}

class FlightOffersShopping {
  constructor(private client: AmadeusClient) {}

  /** GET /v2/shopping/flight-offers — Search flight offers */
  async search(params: T.FlightSearchParams) {
    return this.client.get<T.FlightOffer[]>(
      '/v2/shopping/flight-offers',
      params as any,
    );
  }

  /** POST /v1/shopping/flight-offers/pricing — Price flight offers (POST-as-GET) */
  async pricing(body: T.FlightOfferPricingInput, params?: T.FlightOfferPricingParams) {
    return this.client.postAsGet<T.FlightOffer[]>(
      '/v1/shopping/flight-offers/pricing',
      { data: body },
      params as any,
    );
  }

  /** POST /v1/shopping/availability/flight-availabilities — Search availability */
  async availability(body: T.FlightAvailabilityQuery) {
    return this.client.postAsGet<T.FlightAvailability[]>(
      '/v1/shopping/availability/flight-availabilities',
      { data: body },
    );
  }

  /** GET /v1/shopping/flight-dates — Cheapest flight dates */
  async cheapestDates(params: T.FlightCheapestDateParams) {
    return this.client.get<T.FlightDate[]>(
      '/v1/shopping/flight-dates',
      params as any,
    );
  }

  /** GET /v1/shopping/flight-destinations — Flight inspiration */
  async inspirationSearch(params: T.FlightInspirationParams) {
    return this.client.get<T.FlightDestination[]>(
      '/v1/shopping/flight-destinations',
      params as any,
    );
  }

  /** POST /v1/shopping/flight-offers/upselling — Branded fares upsell */
  async upsell(body: { data: { type: string; flightOffers: T.FlightOffer[] } }) {
    return this.client.postAsGet<T.FlightOffer[]>(
      '/v1/shopping/flight-offers/upselling',
      body,
    );
  }
}

class SeatMapsShopping {
  constructor(private client: AmadeusClient) {}

  /** GET /v1/shopping/seatmaps — Seat maps by flight offer query */
  async get(params: { 'flight-orderId'?: string }) {
    return this.client.get<T.SeatMap[]>(
      '/v1/shopping/seatmaps',
      params as any,
    );
  }

  /** POST /v1/shopping/seatmaps — Seat maps by flight offer (POST-as-GET) */
  async post(body: { data: T.FlightOffer[] }) {
    return this.client.postAsGet<T.SeatMap[]>(
      '/v1/shopping/seatmaps',
      body,
    );
  }
}

class HotelOffersShopping {
  constructor(private client: AmadeusClient) {}

  /** GET /v1/reference-data/locations/hotels/by-city — Hotels by city */
  async byCity(params: T.HotelListByCityParams) {
    return this.client.get<T.Hotel[]>(
      '/v1/reference-data/locations/hotels/by-city',
      params as any,
    );
  }

  /** GET /v1/reference-data/locations/hotels/by-geocode — Hotels by geo */
  async byGeocode(params: T.HotelListByGeoParams) {
    return this.client.get<T.Hotel[]>(
      '/v1/reference-data/locations/hotels/by-geocode',
      params as any,
    );
  }

  /** GET /v1/reference-data/locations/hotels/by-hotels — Hotels by IDs */
  async byHotelIds(params: { hotelIds: string[] }) {
    return this.client.get<T.Hotel[]>(
      '/v1/reference-data/locations/hotels/by-hotels',
      { hotelIds: params.hotelIds.join(',') },
    );
  }

  /** GET /v3/shopping/hotel-offers — Search hotel offers */
  async search(params: T.HotelSearchParams) {
    const { hotelIds, ...rest } = params;
    return this.client.get<T.HotelOffers[]>(
      '/v3/shopping/hotel-offers',
      { hotelIds: hotelIds.join(','), ...rest } as any,
    );
  }

  /** GET /v1/reference-data/locations/hotels/autocomplete — Hotel autocomplete */
  async autocomplete(params: T.HotelAutocompleteParams) {
    const { subType, ...rest } = params;
    return this.client.get<T.HotelAutocomplete[]>(
      '/v1/reference-data/locations/hotels/autocomplete',
      { subType: subType.join(','), ...rest } as any,
    );
  }

  /** GET /v2/e-reputation/hotel-sentiments — Hotel ratings / sentiments */
  async sentiments(params: { hotelIds: string[] }) {
    return this.client.get<T.HotelSentiment[]>(
      '/v2/e-reputation/hotel-sentiments',
      { hotelIds: params.hotelIds.join(',') },
    );
  }
}

class TransferOffersShopping {
  constructor(private client: AmadeusClient) {}

  /** POST /v1/shopping/transfer-offers — Search transfers */
  async search(body: T.TransferSearchInput) {
    return this.client.post<T.TransferOffer[]>(
      '/v1/shopping/transfer-offers',
      body,
    );
  }
}

class ActivitiesShopping {
  constructor(private client: AmadeusClient) {}

  /** GET /v1/shopping/activities — Activities by geo point */
  async byGeocode(params: T.ActivitySearchParams) {
    return this.client.get<T.Activity[]>(
      '/v1/shopping/activities',
      params as any,
    );
  }

  /** GET /v1/shopping/activities/by-square — Activities by bounding box */
  async bySquare(params: T.ActivityBySquareParams) {
    return this.client.get<T.Activity[]>(
      '/v1/shopping/activities/by-square',
      params as any,
    );
  }

  /** GET /v1/shopping/activities/{activityId} — Single activity */
  async get(activityId: string) {
    return this.client.get<T.Activity>(
      `/v1/shopping/activities/${activityId}`,
    );
  }
}

// ── Booking ─────────────────────────────────────────────────

class Booking {
  public flightOrders: FlightOrdersBooking;
  public hotelOrders: HotelOrdersBooking;
  public transferOrders: TransferOrdersBooking;

  constructor(private client: AmadeusClient) {
    this.flightOrders = new FlightOrdersBooking(client);
    this.hotelOrders = new HotelOrdersBooking(client);
    this.transferOrders = new TransferOrdersBooking(client);
  }
}

class FlightOrdersBooking {
  constructor(private client: AmadeusClient) {}

  /** POST /v1/booking/flight-orders — Create flight order */
  async create(body: {
    data: {
      type: 'flight-order';
      flightOffers: T.FlightOffer[];
      travelers: T.Traveler[];
      remarks?: { general?: { subType: string; text: string }[] };
      ticketingAgreement?: { option: string; dateTime?: string };
      contacts?: T.Contact[];
      formOfPayment?: T.FormOfPayment[];
    };
  }) {
    return this.client.post<T.FlightOrder>(
      '/v1/booking/flight-orders',
      body,
    );
  }

  /** GET /v1/booking/flight-orders/{orderId} — Get flight order */
  async get(orderId: string) {
    return this.client.get<T.FlightOrder>(
      `/v1/booking/flight-orders/${orderId}`,
    );
  }

  /** DELETE /v1/booking/flight-orders/{orderId} — Cancel flight order */
  async cancel(orderId: string) {
    return this.client.delete<void>(
      `/v1/booking/flight-orders/${orderId}`,
    );
  }
}

class HotelOrdersBooking {
  constructor(private client: AmadeusClient) {}

  /** POST /v2/booking/hotel-orders — Create hotel booking */
  async create(body: T.HotelBookingInput) {
    return this.client.post<T.HotelOrder>(
      '/v2/booking/hotel-orders',
      body,
    );
  }
}

class TransferOrdersBooking {
  constructor(private client: AmadeusClient) {}

  /** POST /v1/ordering/transfer-orders — Book transfer */
  async create(offerId: string, body: T.TransferBookingInput) {
    return this.client.post<T.TransferOrder>(
      `/v1/ordering/transfer-orders?offerId=${offerId}`,
      body,
    );
  }

  /** POST /v1/ordering/transfer-orders/{orderId}/transfers/cancellation — Cancel */
  async cancel(orderId: string, confirmNbr: string) {
    return this.client.post<T.TransferCancellation>(
      `/v1/ordering/transfer-orders/${orderId}/transfers/cancellation`,
      { data: { confirmNbr } },
    );
  }
}

// ── Reference Data ──────────────────────────────────────────

class ReferenceData {
  public locations: LocationsRef;
  public airlines: AirlinesRef;

  constructor(private client: AmadeusClient) {
    this.locations = new LocationsRef(client);
    this.airlines = new AirlinesRef(client);
  }
}

class LocationsRef {
  constructor(private client: AmadeusClient) {}

  /** GET /v1/reference-data/locations — Airport & city search */
  async search(params: T.LocationSearchParams) {
    const { subType, ...rest } = params;
    return this.client.get<T.Location[]>(
      '/v1/reference-data/locations',
      { subType: subType.join(','), ...rest } as any,
    );
  }

  /** GET /v1/reference-data/locations/{id} — Single location */
  async get(locationId: string) {
    return this.client.get<T.Location>(
      `/v1/reference-data/locations/${locationId}`,
    );
  }

  /** GET /v1/reference-data/locations/cities — City search */
  async cities(params: T.CitySearchParams) {
    const { include, ...rest } = params;
    return this.client.get<T.Location[]>(
      '/v1/reference-data/locations/cities',
      { include: include?.join(','), ...rest } as any,
    );
  }

  /** GET /v1/reference-data/recommended-locations — Travel recommendations */
  async recommended(params: { cityCodes: string; travelerCountryCode?: string; destinationCountryCodes?: string }) {
    return this.client.get<T.RecommendedLocation[]>(
      '/v1/reference-data/recommended-locations',
      params as any,
    );
  }
}

class AirlinesRef {
  constructor(private client: AmadeusClient) {}

  /** GET /v1/reference-data/airlines — Airline lookup */
  async get(params: { airlineCodes?: string }) {
    return this.client.get<T.Airline[]>(
      '/v1/reference-data/airlines',
      params as any,
    );
  }

  /** GET /v1/airline/destinations — Airline routes / destinations */
  async destinations(params: { airlineCode: string; max?: number }) {
    return this.client.get<T.Location[]>(
      '/v1/airline/destinations',
      params as any,
    );
  }

  /** GET /v1/airport/direct-destinations — Airport routes */
  async airportRoutes(params: { departureAirportCode: string; max?: number }) {
    return this.client.get<T.Location[]>(
      '/v1/airport/direct-destinations',
      params as any,
    );
  }
}

// ── Schedule ────────────────────────────────────────────────

class Schedule {
  constructor(private client: AmadeusClient) {}

  /** GET /v2/schedule/flights — On-demand flight status */
  async flightStatus(params: T.FlightStatusParams) {
    return this.client.get<T.DatedFlight[]>(
      '/v2/schedule/flights',
      params as any,
    );
  }

  /** GET /v2/reference-data/urls/checkin-links — Check-in links */
  async checkinLinks(params: { airlineCode: string; language?: string }) {
    return this.client.get<T.CheckinLink[]>(
      '/v2/reference-data/urls/checkin-links',
      params as any,
    );
  }
}

// ── Travel ──────────────────────────────────────────────────

class Travel {
  constructor(private client: AmadeusClient) {}

  /** GET /v1/reference-data/recommended-locations — Travel recommendations */
  async recommendations(params: { cityCodes: string; travelerCountryCode?: string }) {
    return this.client.get<T.RecommendedLocation[]>(
      '/v1/reference-data/recommended-locations',
      params as any,
    );
  }
}

// ── Analytics / Market Insights ─────────────────────────────

class Analytics {
  constructor(private client: AmadeusClient) {}

  /** GET /v1/travel/analytics/air-traffic/busiest-period — Busiest travel periods */
  async busiestPeriod(params: T.AirTrafficParams) {
    return this.client.get<T.AirTraffic[]>(
      '/v1/travel/analytics/air-traffic/busiest-period',
      params as any,
    );
  }

  /** GET /v1/travel/analytics/air-traffic/traveled — Most traveled destinations */
  async mostTraveled(params: T.AirTrafficParams) {
    return this.client.get<T.AirTraffic[]>(
      '/v1/travel/analytics/air-traffic/traveled',
      params as any,
    );
  }

  /** GET /v1/travel/analytics/air-traffic/booked — Most booked destinations */
  async mostBooked(params: T.AirTrafficParams) {
    return this.client.get<T.AirTraffic[]>(
      '/v1/travel/analytics/air-traffic/booked',
      params as any,
    );
  }
}

// ── Re-exports ──────────────────────────────────────────────
export { AmadeusClient } from './client';
export { AmadeusApiError } from './client';
export { TokenManager, AmadeusAuthError } from './token-manager';
export * from './types';
