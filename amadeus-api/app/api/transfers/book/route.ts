export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { bookTransfer } from '../route-handlers';

export async function POST(req: NextRequest) {
  return bookTransfer(req);
}
