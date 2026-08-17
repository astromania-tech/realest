// app/api/referral/resolve/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import {
  buildReferralShareUrl,
  getCurrentMilestone,
  getNextMilestone,
  getWaitlistRewardCopy,
  isWaitlistPersona,
} from '@/lib/referral-system';
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Resolve referral code',
  description: 'Resolve a referral code to inviter details and milestone context.',
  tags: ['Utility'],
  parameters: [{ name: 'code', in: 'query', required: true, schema: { type: 'string' } }],
  responses: {
    '200': { description: 'Referral code resolved' },
    '400': { description: 'Referral code is required' },
    '404': { description: 'Referral code not found' },
  },
};

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code')?.trim().toUpperCase();

  if (!code) {
    return NextResponse.json(
      { ok: false, error: 'Referral code is required' },
      { status: 400 },
    );
  }

  // 1. Check profiles first (registered users take priority)
  const profileReferrer = await prisma.profiles.findFirst({
    where: { referral_code: code },
    select: {
      id: true,
      email: true,
      full_name: true,
      referral_code: true,
      referral_count: true,
      waitlist_persona: true,
      candidate_role: true,
    },
  });

  if (profileReferrer) {
    const persona = isWaitlistPersona(profileReferrer.waitlist_persona)
      ? profileReferrer.waitlist_persona
      : null;
    const referralCount = profileReferrer.referral_count ?? 0;

    return NextResponse.json({
      ok: true,
      inviter: {
        id: profileReferrer.id,
        firstName: profileReferrer.full_name?.split(' ')[0] ?? 'A RealEST member',
        email: profileReferrer.email,
        referralCode: profileReferrer.referral_code ?? code,
        referralCount,
        currentMilestone: getCurrentMilestone(referralCount),
        nextMilestone: getNextMilestone(referralCount),
        persona,
        candidateRole: profileReferrer.candidate_role ?? 'user',
        waitlistReward: persona ? getWaitlistRewardCopy(persona) : null,
        shareUrl: buildReferralShareUrl(profileReferrer.referral_code ?? code),
      },
    });
  }

  // 2. Fall back to waitlist (pre-registration users)
  const waitlistReferrer = await prisma.waitlist.findFirst({
    where: { referral_code: code },
    select: {
      id: true,
      email: true,
      first_name: true,
      referral_code: true,
      referral_count: true,
      persona: true,
      candidate_role: true,
      queue_rank: true,
    },
  });

  if (!waitlistReferrer) {
    return NextResponse.json(
      { ok: false, error: 'Referral code not found' },
      { status: 404 },
    );
  }

  const persona = isWaitlistPersona(waitlistReferrer.persona)
    ? waitlistReferrer.persona
    : null;
  const referralCount = waitlistReferrer.referral_count ?? 0;

  return NextResponse.json({
    ok: true,
    inviter: {
      id: waitlistReferrer.id,
      firstName: waitlistReferrer.first_name ?? 'A RealEST member',
      email: waitlistReferrer.email,
      referralCode: waitlistReferrer.referral_code ?? code,
      referralCount,
      currentMilestone: getCurrentMilestone(referralCount),
      nextMilestone: getNextMilestone(referralCount),
      persona,
      candidateRole: waitlistReferrer.candidate_role ?? 'user',
      waitlistReward: persona ? getWaitlistRewardCopy(persona) : null,
      shareUrl: buildReferralShareUrl(waitlistReferrer.referral_code ?? code),
      queueRank: waitlistReferrer.queue_rank,
    },
  });
}
