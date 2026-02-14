export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { searchHotelsByCity } from '../route-handlers';

export async function GET(req: NextRequest) {
  return searchHotelsByCity(req);
}
