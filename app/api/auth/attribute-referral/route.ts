import { NextRequest, NextResponse, after } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendReferralSuccessEmail } from '@/lib/emailService';
import {
  ensureReferralMilestoneRewards,
  recomputeWaitlistRankings,
  recordReferralEvent,
} from '@/lib/reward-engine';
import { buildReferralShareUrl } from '@/lib/referral-system';
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Attribute signup referral',
  description: 'Attach a newly created profile to a referral code and trigger referral rewards and notifications.',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['email', 'refCode'],
          properties: {
            email: { type: 'string', format: 'email' },
            refCode: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Referral attribution accepted' },
    '400': { description: 'Invalid JSON or missing fields' },
    '404': { description: 'Profile not found or attribution window expired' },
  },
}

/**
 * POST /api/auth/attribute-referral
 * Body: { email: string; refCode: string }
 *
 * Called client-side immediately after a successful signUpWithPassword() to
 * attribute the new account to the person whose referral link they used.
 */
export async function POST(request: NextRequest) {
  let email: string;
  let refCode: string;

  try {
    const body = await request.json();
    email = String(body.email ?? '').trim().toLowerCase();
    refCode = String(body.refCode ?? '').trim().toUpperCase();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON' }, { status: 400 });
  }

  if (!email || !refCode) {
    return NextResponse.json({ ok: false, error: 'Missing email or refCode' }, { status: 400 });
  }

  const cutoff = new Date(Date.now() - 120_000);

  const newProfile = await prisma.profiles.findFirst({
    where: {
      email,
      created_at: { gte: cutoff },
    },
    select: {
      id: true,
      email: true,
      full_name: true,
      referred_by: true,
      referred_by_code: true,
    },
  });

  if (!newProfile) {
    return NextResponse.json({ ok: false, error: 'Profile not found or attribution window expired' }, { status: 404 });
  }

  if (newProfile.referred_by || newProfile.referred_by_code) {
    return NextResponse.json({ ok: true, already: true });
  }

  after(async () => {
    try {
      const referredFirstName = newProfile.full_name?.split(' ')[0] ?? 'Someone';
      const linkedWaitlistProfile = await prisma.waitlist.findFirst({
        where: { email },
        select: { id: true },
      });

      const registeredReferrer = await prisma.profiles.findFirst({
        where: {
          referral_code: refCode,
          id: { not: newProfile.id },
        },
        select: {
          id: true,
          email: true,
          full_name: true,
          referral_code: true,
          referral_count: true,
        },
      });

      if (registeredReferrer) {
        await prisma.profiles.update({
          where: { id: newProfile.id },
          data: { referred_by: registeredReferrer.id, referred_by_code: refCode },
        });

        const newCount = (registeredReferrer.referral_count ?? 0) + 1;
        await prisma.profiles.update({
          where: { id: registeredReferrer.id },
          data: { referral_count: newCount },
        });

        const referrerWaitlist = await prisma.waitlist.findFirst({
          where: { email: registeredReferrer.email },
          select: { id: true, email: true, referral_code: true, referral_count: true },
        });

        if (referrerWaitlist) {
          await prisma.waitlist.update({
            where: { id: referrerWaitlist.id },
            data: { referral_count: Math.max(referrerWaitlist.referral_count ?? 0, newCount) },
          });
        }

        await recordReferralEvent({
          referrerWaitlistId: referrerWaitlist?.id,
          referrerProfileId: registeredReferrer.id,
          referredWaitlistId: linkedWaitlistProfile?.id,
          referredProfileId: newProfile.id,
          referralCode: registeredReferrer.referral_code ?? refCode,
          eventType: 'registration_referral_attributed',
          metadata: { referred_email: email },
        });

        await ensureReferralMilestoneRewards({
          userEmail: registeredReferrer.email,
          referralCount: newCount,
          referralCode: registeredReferrer.referral_code ?? refCode,
          waitlistId: referrerWaitlist?.id,
          profileId: registeredReferrer.id,
        });

        await recomputeWaitlistRankings();

        await sendReferralSuccessEmail(registeredReferrer.email, {
          referrerFirstName: registeredReferrer.full_name?.split(' ')[0] ?? 'there',
          referredFirstName,
          referralCount: newCount,
          referralCode: registeredReferrer.referral_code ?? refCode,
          referralUrl: buildReferralShareUrl(registeredReferrer.referral_code ?? refCode),
          contextType: 'registration',
        });

        console.log(`✅ Registration referral attributed: ${newProfile.id} ← profile ${registeredReferrer.id}`);
        return;
      }

      const waitlistReferrer = await prisma.waitlist.findFirst({
        where: { referral_code: refCode },
        select: { id: true, email: true, first_name: true, referral_code: true, referral_count: true },
      });

      if (waitlistReferrer) {
        await prisma.profiles.update({
          where: { id: newProfile.id },
          data: { referred_by_code: refCode },
        });

        const newCount = (waitlistReferrer.referral_count ?? 0) + 1;
        await prisma.waitlist.update({
          where: { id: waitlistReferrer.id },
          data: { referral_count: newCount },
        });

        await recordReferralEvent({
          referrerWaitlistId: waitlistReferrer.id,
          referredWaitlistId: linkedWaitlistProfile?.id,
          referredProfileId: newProfile.id,
          referralCode: waitlistReferrer.referral_code ?? refCode,
          eventType: 'registration_referral_attributed',
          metadata: { referred_email: email },
        });

        await ensureReferralMilestoneRewards({
          userEmail: waitlistReferrer.email,
          referralCount: newCount,
          referralCode: waitlistReferrer.referral_code ?? refCode,
          waitlistId: waitlistReferrer.id,
        });

        await recomputeWaitlistRankings();

        await sendReferralSuccessEmail(waitlistReferrer.email, {
          referrerFirstName: waitlistReferrer.first_name ?? 'there',
          referredFirstName,
          referralCount: newCount,
          referralCode: waitlistReferrer.referral_code ?? refCode,
          referralUrl: buildReferralShareUrl(waitlistReferrer.referral_code ?? refCode),
          contextType: 'registration',
        });

        console.log(`✅ Registration referral attributed: ${newProfile.id} ← waitlist ${waitlistReferrer.id}`);
      }
    } catch (err) {
      console.error('❌ Registration referral attribution failed:', err);
    }
  });

  return NextResponse.json({ ok: true, accepted: true });
}
