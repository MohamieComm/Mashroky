// ============================================================
// Transfers API Route Handlers
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusClient } from '@/lib/amadeus-server';
import { logApiRequest } from '@/lib/api-logger';

export async function searchTransfers(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const amadeus = getAmadeusClient();
    const result = await amadeus.shopping.transferOffers.search(body);

    await logApiRequest({
      endpoint: '/v1/shopping/transfer-offers',
      method: 'POST',
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

export async function bookTransfer(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const { offerId, ...bookingData } = body;
    const amadeus = getAmadeusClient();
    const result = await amadeus.booking.transferOrders.create(offerId, bookingData);

    await logApiRequest({
      endpoint: '/v1/ordering/transfer-orders',
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

export async function cancelTransfer(req: NextRequest) {
  const start = Date.now();
  try {
    const body = await req.json();
    const { orderId, confirmNbr } = body;
    const amadeus = getAmadeusClient();
    const result = await amadeus.booking.transferOrders.cancel(orderId, confirmNbr);

    await logApiRequest({
      endpoint: `/v1/ordering/transfer-orders/${orderId}/transfers/cancellation`,
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
