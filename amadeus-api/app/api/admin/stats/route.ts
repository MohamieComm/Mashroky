export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getDashboardStats } from '../route-handlers';

export async function GET(req: NextRequest) {
  return getDashboardStats(req);
}
