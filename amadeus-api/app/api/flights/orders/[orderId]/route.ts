export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getFlightOrder, cancelFlightOrder } from '../../route-handlers';

export async function GET(
  req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  return getFlightOrder(params.orderId);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { orderId: string } },
) {
  return cancelFlightOrder(params.orderId);
}
