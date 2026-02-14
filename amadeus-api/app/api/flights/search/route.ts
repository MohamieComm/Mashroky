export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { searchFlights, cheapestDates, inspirationSearch, flightStatus } from '../route-handlers';

export async function POST(req: NextRequest) {
  return searchFlights(req);
}
