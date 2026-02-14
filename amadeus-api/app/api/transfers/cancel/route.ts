export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { cancelTransfer } from '../route-handlers';

export async function POST(req: NextRequest) {
  return cancelTransfer(req);
}
