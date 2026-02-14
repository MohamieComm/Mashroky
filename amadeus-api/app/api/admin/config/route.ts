export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getAmadeusConfig, updateAmadeusConfig } from '../route-handlers';

export async function GET(req: NextRequest) {
  return getAmadeusConfig(req);
}

export async function PUT(req: NextRequest) {
  return updateAmadeusConfig(req);
}
