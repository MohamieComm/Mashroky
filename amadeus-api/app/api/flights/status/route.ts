export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { flightStatus } from '../route-handlers';

export async function GET(req: NextRequest) {
  return flightStatus(req);
}
