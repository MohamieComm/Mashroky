export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getBookings } from '../route-handlers';

export async function GET(req: NextRequest) {
  return getBookings(req);
}
