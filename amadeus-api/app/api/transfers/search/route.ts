export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { searchTransfers } from '../route-handlers';

export async function POST(req: NextRequest) {
  return searchTransfers(req);
}
