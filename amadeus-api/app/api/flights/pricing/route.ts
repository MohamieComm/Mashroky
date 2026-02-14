export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { priceFlightOffers } from '../route-handlers';

export async function POST(req: NextRequest) {
  return priceFlightOffers(req);
}
