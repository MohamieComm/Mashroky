// ============================================================
// Hotels API Route Handlers
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusClient } from '@/lib/amadeus-server';
import { logApiRequest } from '@/lib/api-logger';

// ── Search Hotels by City ───────────────────────────────────

export async function searchHotelsByCity(req: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const params = Object.fromEntries(searchParams.entries());
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.hotelOffers.byCity(params as any);

    await logApiRequest({
      endpoint: '/v1/reference-data/locations/hotels/by-city',
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

// ── Search Hotels by Geocode ────────────────────────────────

export async function searchHotelsByGeo(req: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const params: any = {};
    params.latitude = parseFloat(searchParams.get('latitude')!);
    params.longitude = parseFloat(searchParams.get('longitude')!);
    if (searchParams.has('radius')) params.radius = parseInt(searchParams.get('radius')!);
    if (searchParams.has('radiusUnit')) params.radiusUnit = searchParams.get('radiusUnit');

    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.hotelOffers.byGeocode(params);

    await logApiRequest({
      endpoint: '/v1/reference-data/locations/hotels/by-geocode',
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

// ── Search Hotel Offers (prices) ────────────────────────────

export async function searchHotelOffers(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.hotelOffers.search(body);

    await logApiRequest({
      endpoint: '/v3/shopping/hotel-offers',
      method: 'GET',
      requestParams: body,
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

// ── Hotel Autocomplete ──────────────────────────────────────

export async function hotelAutocomplete(req: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const params: any = {
      keyword: searchParams.get('keyword')!,
      subType: (searchParams.get('subType') || 'HOTEL_LEISURE,HOTEL_GDS').split(','),
    };
    if (searchParams.has('countryCode')) params.countryCode = searchParams.get('countryCode');
    if (searchParams.has('lang')) params.lang = searchParams.get('lang');
    if (searchParams.has('max')) params.max = parseInt(searchParams.get('max')!);

    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.hotelOffers.autocomplete(params);

    await logApiRequest({
      endpoint: '/v1/reference-data/locations/hotels/autocomplete',
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

// ── Hotel Sentiments ────────────────────────────────────────

export async function hotelSentiments(req: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const hotelIds = searchParams.get('hotelIds')!.split(',');
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.hotelOffers.sentiments({ hotelIds });

    await logApiRequest({
      endpoint: '/v2/e-reputation/hotel-sentiments',
      method: 'GET',
      requestParams: { hotelIds },
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

// ── Book Hotel ──────────────────────────────────────────────

export async function bookHotel(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const amadeus = getAmadeusClient();
    const result = await amadeus.booking.hotelOrders.create(body);

    await logApiRequest({
      endpoint: '/v2/booking/hotel-orders',
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
