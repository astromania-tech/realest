// The listing fee is not charged yet. This route must not mark the waiver redeemed.
import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { data: { user }, error } = await getAuthUser();

  if (error || !user) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let listingId = '';
  try {
    const body = await request.json();
    listingId = String(body.listingId ?? '').trim();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!listingId) {
    return NextResponse.json({ ok: false, error: 'Listing ID is required' }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    redemption: { redeemed: false, reason: 'Listing fee is not charged yet.' },
  });
}