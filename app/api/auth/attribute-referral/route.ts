import { NextRequest, NextResponse, after } from 'next/server';
import { createServiceClient } from '@/lib/supabase/service';
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
 *
 * Anti-abuse rules:
 *  - The profile must exist AND be no older than 120 seconds (brand-new account).
 *  - The profile must not already have been attributed.
 *
 * Lookup order for the referrer:
 *  1. profiles.referral_code   — referrer is a registered user
 *  2. waitlist.referral_code   — referrer is still waitlist-only
 *
 * Attribution and the referrer notification email are dispatched inside after()
 * so they never block the HTTP response.
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

  const svc = createServiceClient();

  // Profile must be brand new (created in the last 120 seconds)
  const cutoff = new Date(Date.now() - 120_000).toISOString();
  const { data: newProfile } = await svc
    .from('profiles')
    .select('id, email, full_name, referred_by, referred_by_code')
    .eq('email', email)
    .gte('created_at', cutoff)
    .maybeSingle();

  if (!newProfile) {
    // Either the profile doesn't exist yet or the window has passed — ignore silently
    return NextResponse.json({ ok: false, error: 'Profile not found or attribution window expired' }, { status: 404 });
  }

  // Already attributed — idempotent no-op
  if (newProfile.referred_by || newProfile.referred_by_code) {
    return NextResponse.json({ ok: true, already: true });
  }

  // Fire attribution + notification asynchronously after the response is sent
  after(async () => {
    try {
      const referredFirstName = newProfile.full_name?.split(' ')[0] ?? 'Someone';
      const { data: linkedWaitlistProfile } = await svc
        .from('waitlist')
        .select('id')
        .eq('email', email)
        .maybeSingle();

      // ── 1. Check registered referrer first ───────────────────────────────
      const { data: registeredReferrer } = await svc
        .from('profiles')
        .select('id, email, full_name, referral_code, referral_count')
        .eq('referral_code', refCode)
        .neq('id', newProfile.id)
        .maybeSingle();

      if (registeredReferrer) {
        await svc
          .from('profiles')
          .update({ referred_by: registeredReferrer.id, referred_by_code: refCode })
          .eq('id', newProfile.id);

        const newCount = (registeredReferrer.referral_count ?? 0) + 1;
        await svc
          .from('profiles')
          .update({ referral_count: newCount })
          .eq('id', registeredReferrer.id);

        const { data: referrerWaitlist } = await svc
          .from('waitlist')
          .select('id, email, referral_code, referral_count')
          .eq('email', registeredReferrer.email)
          .maybeSingle();

        if (referrerWaitlist) {
          await svc
            .from('waitlist')
            .update({ referral_count: Math.max(referrerWaitlist.referral_count ?? 0, newCount) })
            .eq('id', referrerWaitlist.id);
        }

        await recordReferralEvent({
          referrerWaitlistId: referrerWaitlist?.id,
          referrerProfileId: registeredReferrer.id,
          referredWaitlistId: linkedWaitlistProfile?.id,
          referredProfileId: newProfile.id,
          referralCode: registeredReferrer.referral_code ?? refCode,
          eventType: 'registration_referral_attributed',
          metadata: { referred_email: email },
        }, svc);

        await ensureReferralMilestoneRewards({
          userEmail: registeredReferrer.email,
          referralCount: newCount,
          referralCode: registeredReferrer.referral_code ?? refCode,
          waitlistId: referrerWaitlist?.id,
          profileId: registeredReferrer.id,
        }, svc);

        await recomputeWaitlistRankings(svc);

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

      // ── 2. Fall back to waitlist-only referrer ────────────────────────────
      const { data: waitlistReferrer } = await svc
        .from('waitlist')
        .select('id, email, first_name, referral_code, referral_count')
        .eq('referral_code', refCode)
        .maybeSingle();

      if (waitlistReferrer) {
        await svc
          .from('profiles')
          .update({ referred_by_code: refCode })
          .eq('id', newProfile.id);

        const newCount = (waitlistReferrer.referral_count ?? 0) + 1;
        await svc
          .from('waitlist')
          .update({ referral_count: newCount })
          .eq('id', waitlistReferrer.id);

        await recordReferralEvent({
          referrerWaitlistId: waitlistReferrer.id,
          referredWaitlistId: linkedWaitlistProfile?.id,
          referredProfileId: newProfile.id,
          referralCode: waitlistReferrer.referral_code ?? refCode,
          eventType: 'registration_referral_attributed',
          metadata: { referred_email: email },
        }, svc);

        await ensureReferralMilestoneRewards({
          userEmail: waitlistReferrer.email,
          referralCount: newCount,
          referralCode: waitlistReferrer.referral_code ?? refCode,
          waitlistId: waitlistReferrer.id,
        }, svc);

        await recomputeWaitlistRankings(svc);

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

  return NextResponse.json({ ok: true });
}
