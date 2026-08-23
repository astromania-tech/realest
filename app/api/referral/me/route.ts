import { NextResponse } from 'next/server';
import { getReferralSummaryForEmail } from '@/lib/reward-engine';
import { createClient, getAuthUser } from "@/lib/supabase/server";
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get my referral summary',
  description: 'Return the authenticated user\'s referral summary and progress.',
  tags: ['Utility'],
  security: [{ bearerAuth: [] }],
  responses: {
    '200': { description: 'Referral summary loaded' },
    '401': { description: 'Unauthorized' },
  },
}

export async function GET() {
  const supabase = await createClient();
  const { data: { user }, error } = await getAuthUser();

  if (error || !user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  const summary = await getReferralSummaryForEmail(user.email);
  return NextResponse.json({ ok: true, summary });
}