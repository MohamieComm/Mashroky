export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAmadeusClient } from '@/lib/amadeus-server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const keyword = searchParams.get('keyword')!;
    const subType = (searchParams.get('subType') || 'AIRPORT,CITY').split(',') as any;
    const amadeus = getAmadeusClient();
    const result = await amadeus.referenceData.locations.search({
      keyword,
      subType,
    });
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message, errors: err.errors },
      { status: err.status || 500 },
    );
  }
}
