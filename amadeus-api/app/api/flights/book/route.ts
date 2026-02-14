export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { createFlightOrder } from '../route-handlers';

export async function POST(req: NextRequest) {
  return createFlightOrder(req);
}
