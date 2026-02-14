export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { searchHotelOffers } from '../route-handlers';

export async function POST(req: NextRequest) {
  return searchHotelOffers(req);
}
