export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { hotelAutocomplete } from '../route-handlers';

export async function GET(req: NextRequest) {
  return hotelAutocomplete(req);
}
