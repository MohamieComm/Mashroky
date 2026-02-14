export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { getActivity } from '../route-handlers';

export async function GET(
  req: NextRequest,
  { params }: { params: { activityId: string } },
) {
  return getActivity(params.activityId);
}
