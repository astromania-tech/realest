import { NextRequest, NextResponse } from 'next/server';
import { sendReferralInviteEmail } from '@/lib/emailService';
import { recordReferralEvent } from '@/lib/reward-engine';
import { buildReferralShareUrl, getCurrentMilestone, getNextMilestone } from '@/lib/referral-system';
import prisma from '@/lib/prisma';
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Send referral invite',
  description: 'Send a referral invite email using the inviter\'s referral code.',
  tags: ['Utility'],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['inviteeEmail', 'referralCode'],
          properties: {
            inviteeEmail: { type: 'string', format: 'email' },
            inviteeName: { type: 'string' },
            referralCode: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Invite email sent' },
    '400': { description: 'Invalid JSON body or missing fields' },
    '404': { description: 'Referral code not found' },
    '429': { description: 'Too many invites' },
  },
}

const inviteRateLimitStore = new Map<string, { count: number; resetTime: number }>();

function isInviteRateLimited(ip: string): boolean {
  const now = Date.now();
  const current = inviteRateLimitStore.get(ip);

  if (!current || now > current.resetTime) {
    inviteRateLimitStore.set(ip, { count: 1, resetTime: now + 60_000 });
    return false;
  }

  if (current.count >= 5) {
    return true;
  }

  current.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
  if (isInviteRateLimited(ip)) {
    return NextResponse.json({ ok: false, error: 'Too many invites. Try again later.' }, { status: 429 });
  }

  let inviteeEmail = '';
  let inviteeName = '';
  let referralCode = '';

  try {
    const body = await request.json();
    inviteeEmail = String(body.inviteeEmail ?? '').trim().toLowerCase();
    inviteeName = String(body.inviteeName ?? '').trim();
    referralCode = String(body.referralCode ?? '').trim().toUpperCase();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!inviteeEmail || !referralCode) {
    return NextResponse.json({ ok: false, error: 'Invitee email and referral code are required' }, { status: 400 });
  }

  const profileReferrer = await prisma.profiles.findFirst({
    where: { referral_code: referralCode },
    select: { id: true, email: true, full_name: true, referral_code: true, referral_count: true },
  });

  const waitlistReferrer = profileReferrer
    ? null
    : await prisma.waitlist.findFirst({
        where: { referral_code: referralCode },
        select: { id: true, email: true, first_name: true, referral_code: true, referral_count: true },
      });

  const inviter = profileReferrer
    ? {
        profileId: profileReferrer.id,
        waitlistId: null,
        email: profileReferrer.email,
        firstName: profileReferrer.full_name?.split(' ')[0] ?? 'RealEST member',
        referralCode: profileReferrer.referral_code ?? referralCode,
        referralCount: profileReferrer.referral_count ?? 0,
      }
    : waitlistReferrer
      ? {
          profileId: null,
          waitlistId: waitlistReferrer.id,
          email: waitlistReferrer.email,
          firstName: waitlistReferrer.first_name ?? 'RealEST member',
          referralCode: waitlistReferrer.referral_code ?? referralCode,
          referralCount: waitlistReferrer.referral_count ?? 0,
        }
      : null;

  if (!inviter) {
    return NextResponse.json({ ok: false, error: 'Referral code not found' }, { status: 404 });
  }

  const nextMilestone = getNextMilestone(inviter.referralCount);
  const currentMilestone = getCurrentMilestone(inviter.referralCount);
  const result = await sendReferralInviteEmail(inviteeEmail, {
    firstName: inviteeName || 'there',
    inviterName: inviter.firstName,
    referralCode: inviter.referralCode,
    referralUrl: buildReferralShareUrl(inviter.referralCode),
    rewardDescription: currentMilestone?.label ?? 'priority verification on your first listing',
    rewardForReferrer: nextMilestone?.label ?? '1 month of premium visibility',
  });

  if (!result.success) {
    return NextResponse.json({ ok: false, error: result.error ?? 'Unable to send invite' }, { status: 500 });
  }

  await recordReferralEvent({
    referrerWaitlistId: inviter.waitlistId,
    referrerProfileId: inviter.profileId,
    referralCode: inviter.referralCode,
    eventType: 'invite_email_sent',
    metadata: {
      invitee_email: inviteeEmail,
      invitee_name: inviteeName || null,
    },
  });

  return NextResponse.json({ ok: true });
}