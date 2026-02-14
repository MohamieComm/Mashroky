export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { cheapestDates } from '../route-handlers';

export async function GET(req: NextRequest) {
  return cheapestDates(req);
}
