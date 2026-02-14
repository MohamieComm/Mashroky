// ============================================================
// Activities API Route Handlers
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusClient } from '@/lib/amadeus-server';
import { logApiRequest } from '@/lib/api-logger';

export async function searchActivities(req: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const params = {
      latitude: parseFloat(searchParams.get('latitude')!),
      longitude: parseFloat(searchParams.get('longitude')!),
      radius: searchParams.has('radius') ? parseInt(searchParams.get('radius')!) : undefined,
    };
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.activities.byGeocode(params as any);

    await logApiRequest({
      endpoint: '/v1/shopping/activities',
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

export async function searchActivitiesBySquare(req: NextRequest) {
  const start = Date.now();
  try {
    const { searchParams } = new URL(req.url);
    const params = {
      north: parseFloat(searchParams.get('north')!),
      west: parseFloat(searchParams.get('west')!),
      south: parseFloat(searchParams.get('south')!),
      east: parseFloat(searchParams.get('east')!),
    };
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.activities.bySquare(params);

    await logApiRequest({
      endpoint: '/v1/shopping/activities/by-square',
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

export async function getActivity(activityId: string) {
  const start = Date.now();
  try {
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.activities.get(activityId);

    await logApiRequest({
      endpoint: `/v1/shopping/activities/${activityId}`,
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
