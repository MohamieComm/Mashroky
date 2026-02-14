// ============================================================
// Flights API Route Handlers
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusClient } from '@/lib/amadeus-server';
import { logApiRequest } from '@/lib/api-logger';
import { FlightSearchParams, FlightAvailabilityQuery, FlightOfferPricingInput } from '@/lib/amadeus/types';

// ── Search Flight Offers ────────────────────────────────────

export async function searchFlights(req: NextRequest) {
  const start = Date.now();
  try {
    const params = await req.json() as FlightSearchParams;
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.flightOffers.search(params);

    await logApiRequest({
      endpoint: '/v2/shopping/flight-offers',
      method: 'GET',
      requestParams: params,
      responseStatus: 200,
      responseTimeMs: Date.now() - start,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    await logApiRequest({
      endpoint: '/v2/shopping/flight-offers',
      method: 'GET',
      responseStatus: err.status || 500,
      responseTimeMs: Date.now() - start,
      errorMessage: err.message,
    });
    return NextResponse.json(
      { error: err.message, errors: err.errors },
      { status: err.status || 500 },
    );
  }
}

// ── Price Flight Offers ─────────────────────────────────────

export async function priceFlightOffers(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.flightOffers.pricing(body);

    await logApiRequest({
      endpoint: '/v1/shopping/flight-offers/pricing',
      method: 'POST',
      responseStatus: 200,
      responseTimeMs: Date.now() - start,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, errors: err.errors },
      { status: err.status || 500 },
    );
  }
}

// ── Check Availability ──────────────────────────────────────

export async function checkAvailability(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json() as FlightAvailabilityQuery;
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.flightOffers.availability(body);

    await logApiRequest({
      endpoint: '/v1/shopping/availability/flight-availabilities',
      method: 'POST',
      responseStatus: 200,
      responseTimeMs: Date.now() - start,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, errors: err.errors },
      { status: err.status || 500 },
    );
  }
}

// ── Cheapest Dates ──────────────────────────────────────────

export async function cheapestDates(req: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.flightOffers.cheapestDates(params as any);

    await logApiRequest({
      endpoint: '/v1/shopping/flight-dates',
      method: 'GET',
      requestParams: params,
      responseStatus: 200,
      responseTimeMs: Date.now() - start,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, errors: err.errors },
      { status: err.status || 500 },
    );
  }
}

// ── Inspiration Search ──────────────────────────────────────

export async function inspirationSearch(req: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.flightOffers.inspirationSearch(params as any);

    await logApiRequest({
      endpoint: '/v1/shopping/flight-destinations',
      method: 'GET',
      requestParams: params,
      responseStatus: 200,
      responseTimeMs: Date.now() - start,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, errors: err.errors },
      { status: err.status || 500 },
    );
  }
}

// ── Create Flight Order ─────────────────────────────────────

export async function createFlightOrder(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const amadeus = getAmadeusClient();
    const result = await amadeus.booking.flightOrders.create(body);

    await logApiRequest({
      endpoint: '/v1/booking/flight-orders',
      method: 'POST',
      responseStatus: 200,
      responseTimeMs: Date.now() - start,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, errors: err.errors },
      { status: err.status || 500 },
    );
  }
}

// ── Get Flight Order ────────────────────────────────────────

export async function getFlightOrder(orderId: string) {
  const start = Date.now();
  try {
    const amadeus = getAmadeusClient();
    const result = await amadeus.booking.flightOrders.get(orderId);

    await logApiRequest({
      endpoint: `/v1/booking/flight-orders/${orderId}`,
      method: 'GET',
      responseStatus: 200,
      responseTimeMs: Date.now() - start,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, errors: err.errors },
      { status: err.status || 500 },
    );
  }
}

// ── Cancel Flight Order ─────────────────────────────────────

export async function cancelFlightOrder(orderId: string) {
  const start = Date.now();
  try {
    const amadeus = getAmadeusClient();
    await amadeus.booking.flightOrders.cancel(orderId);

    await logApiRequest({
      endpoint: `/v1/booking/flight-orders/${orderId}`,
      method: 'DELETE',
      responseStatus: 200,
      responseTimeMs: Date.now() - start,
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, errors: err.errors },
      { status: err.status || 500 },
    );
  }
}

// ── Flight Status ───────────────────────────────────────────

export async function flightStatus(req: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const params = {
      carrierCode: searchParams.get('carrierCode')!,
      flightNumber: parseInt(searchParams.get('flightNumber')!),
      scheduledDepartureDate: searchParams.get('scheduledDepartureDate')!,
    };
    const amadeus = getAmadeusClient();
    const result = await amadeus.schedule.flightStatus(params);

    await logApiRequest({
      endpoint: '/v2/schedule/flights',
      method: 'GET',
      requestParams: params,
      responseStatus: 200,
      responseTimeMs: Date.now() - start,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, errors: err.errors },
      { status: err.status || 500 },
    );
  }
}

// ── Seat Maps ───────────────────────────────────────────────

export async function seatMaps(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.seatMaps.post({ data: body.flightOffers });

    await logApiRequest({
      endpoint: '/v1/shopping/seatmaps',
      method: 'POST',
      responseStatus: 200,
      responseTimeMs: Date.now() - start,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, errors: err.errors },
      { status: err.status || 500 },
    );
  }
}
