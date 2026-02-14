export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getUsers, updateUserRole } from '../route-handlers';

export async function GET(req: NextRequest) {
  return getUsers(req);
}

export async function PUT(req: NextRequest) {
  return updateUserRole(req);
}
