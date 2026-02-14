export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { searchActivities } from '../route-handlers';

export async function GET(req: NextRequest) {
  return searchActivities(req);
}
