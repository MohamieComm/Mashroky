export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { seatMaps } from '../route-handlers';

export async function POST(req: NextRequest) {
  return seatMaps(req);
}
