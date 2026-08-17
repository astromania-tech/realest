import { NextRequest, NextResponse, after } from 'next/server';
import {
  checkEmailWithPosition,
  getWaitlistStats,
  getWaitlistPosition,
  createWaitlistEntry,
} from '@/lib/waitlist';
import type { WaitlistSubscriptionData } from '@/lib/waitlist';
import {
  sendWaitlistConfirmationEmail,
  sendWaitlistAdminNotification,
  sendReferralSuccessEmail,
} from '@/lib/emailService';
import { syncWaitlistJoin, syncWaitlistUnsubscribe } from '@/lib/resend-audiences';
import {
  ensureReferralMilestoneRewards,
  ensureWaitlistCohortReward,
  recomputeWaitlistRankings,
  recordReferralEvent,
} from '@/lib/reward-engine';
import {
  buildReferralShareUrl,
  getCurrentMilestone,
  getWaitlistRewardCopy,
  isWaitlistPersona,
} from '@/lib/referral-system';
import prisma from '@/lib/prisma'; // ← replaces createServiceClient
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Join waitlist',
  description: 'Subscribe a user to the waitlist and trigger referral/cohort workflows.',
  tags: ['Utility'],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['email', 'firstName', 'persona'],
          properties: {
            email: { type: 'string', format: 'email' },
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            phone: { type: 'string' },
            source: { type: 'string' },
            ref: { type: 'string' },
            persona: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Waitlist subscription accepted' },
    '400': { description: 'Validation error' },
    '429': { description: 'Rate limited' },
  },
};

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimitStore.get(ip);
  if (!limit || now > limit.resetTime) {
    rateLimitStore.set(ip, { count: 1, resetTime: now + 60000 });
    return false;
  }
  if (limit.count >= 5) return true;
  limit.count += 1;
  return false;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Waitlist API POST called');

    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';

    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 },
      );
    }

    const body = await request.json();
    const {
      email, firstName, lastName, phone, source, ref,
      persona, interests, locationPreference,
      propertyTypePreference, budgetRange, personaDetails,
    } = body;

    console.log('📧 Received subscription data:', { email, firstName, lastName, phone, source, persona });

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!firstName || typeof firstName !== 'string') {
      return NextResponse.json({ error: 'First name is required' }, { status: 400 });
    }
    if (!persona || typeof persona !== 'string' || !isWaitlistPersona(persona)) {
      return NextResponse.json({ error: 'A valid persona is required' }, { status: 400 });
    }

    const subscriptionData: WaitlistSubscriptionData = {
      email: email.trim(),
      firstName: firstName.trim(),
      lastName: lastName?.trim() || undefined,
      phone: phone?.trim() || undefined,
      persona,
      source: source || 'coming_soon_modal',
      interests: Array.isArray(interests) ? interests : undefined,
      locationPreference: typeof locationPreference === 'string' ? locationPreference.trim() : undefined,
      propertyTypePreference: typeof propertyTypePreference === 'string' ? propertyTypePreference.trim() : undefined,
      budgetRange: typeof budgetRange === 'string' ? budgetRange.trim() : undefined,
      personaDetails: typeof personaDetails === 'object' && personaDetails !== null ? personaDetails : undefined,
      referrerUrl: request.headers.get('referer') || undefined,
    };

    console.log('🔄 Attempting to subscribe:', subscriptionData.email);

    const result = await createWaitlistEntry({
      ...subscriptionData,
      userAgent: request.headers.get('user-agent'),
      ipAddress: ip,
    });

    if (!result.success) {
      console.error('❌ Subscription failed:', result.error);
      return NextResponse.json(
        { error: result.error },
        { status: result.isExistingUser ? 200 : 400 },
      );
    }

    console.log(`New waitlist subscriber: ${subscriptionData.email} (${subscriptionData.firstName} ${subscriptionData.lastName || ''})`);

    if (result.data) {
      await ensureWaitlistCohortReward({
        id: result.data.id,
        email: result.data.email,
        first_name: result.data.first_name,
        referral_code: result.data.referral_code,
        referral_count: result.data.referral_count,
        persona: result.data.persona,
        poll_completion_count: result.data.poll_completion_count,
        subscribed_at: result.data.subscribed_at,
      });
      await recomputeWaitlistRankings();
    }

    const positionData = await getWaitlistPosition(subscriptionData.email);
    console.log(`📊 Position data for ${subscriptionData.email}:`, positionData);

    if (result.success && result.data) {
      const refCode =
        (typeof ref === 'string' ? ref.trim().toUpperCase() : '') || null;

      // ── Referral attribution (fire-and-forget via after()) ──────────────────
      if (refCode && result.data.id) {
        after(async () => {
          try {
            // Find the referrer by referral code, excluding self-referral
            const referrer = await prisma.waitlist.findFirst({
              where: {
                referral_code: refCode,
                NOT: { id: result.data!.id },
              },
              select: {
                id: true,
                email: true,
                first_name: true,
                referral_code: true,
                referral_count: true,
              },
            });

            if (referrer) {
              const newCount = (referrer.referral_count ?? 0) + 1;

              // Update referred_by on the new entry and increment referrer count
              await prisma.waitlist.update({
                where: { id: result.data!.id },
                data: { referred_by: referrer.id },
              });
              await prisma.waitlist.update({
                where: { id: referrer.id },
                data: { referral_count: newCount },
              });

              await recordReferralEvent({
                referrerWaitlistId: referrer.id,
                referredWaitlistId: result.data!.id,
                referralCode: referrer.referral_code ?? refCode,
                eventType: 'waitlist_referral_attributed',
                metadata: { referred_email: result.data!.email },
              });

              await ensureReferralMilestoneRewards({
                userEmail: referrer.email,
                referralCount: newCount,
                referralCode: referrer.referral_code ?? refCode,
                waitlistId: referrer.id,
              });

              await recomputeWaitlistRankings();

              console.log(`✅ Referral attributed: ${result.data!.id} ← ${referrer.id}`);

              await sendReferralSuccessEmail(referrer.email, {
                referrerFirstName: referrer.first_name ?? 'there',
                referredFirstName: result.data!.first_name ?? 'Someone',
                referralCount: newCount,
                referralCode: referrer.referral_code ?? refCode,
                referralUrl: buildReferralShareUrl(referrer.referral_code ?? refCode),
                contextType: 'waitlist',
              });
            }
          } catch (err) {
            console.error('❌ Referral attribution failed:', err);
          }
        });
      }

      // ── Email notifications (fire-and-forget via after()) ───────────────────
      after(async () => {
        try {
          const code = result.data?.referral_code ?? undefined;
          await sendWaitlistConfirmationEmail({
            email: subscriptionData.email,
            firstName: subscriptionData.firstName,
            lastName: subscriptionData.lastName,
            position: positionData.position,
            referralCode: code,
            referralUrl: code ? buildReferralShareUrl(code) : undefined,
          });
        } catch (error) {
          console.error('❌ Email confirmation failed:', error);
        }

        await new Promise((resolve) => setTimeout(resolve, 600));

        try {
          await sendWaitlistAdminNotification({
            email: subscriptionData.email,
            firstName: subscriptionData.firstName,
            lastName: subscriptionData.lastName,
            position: positionData.position,
          });
        } catch (error) {
          console.error('❌ Admin notification failed:', error);
        }
      });

      // Sync to Resend audience (fire-and-forget)
      syncWaitlistJoin(
        subscriptionData.email,
        subscriptionData.firstName,
        subscriptionData.lastName,
      ).catch((error) => console.error('❌ Resend audience sync failed:', error));
    }

    return NextResponse.json(
      {
        message: 'Successfully added to waitlist!',
        email: subscriptionData.email,
        firstName: subscriptionData.firstName,
        lastName: subscriptionData.lastName,
        position: positionData.position || null,
        totalCount: positionData.totalCount || 0,
        persona,
        candidateRole: result.data?.candidate_role ?? null,
        referralCode: result.data?.referral_code ?? null,
        referralUrl: result.data?.referral_code
          ? buildReferralShareUrl(result.data.referral_code)
          : null,
        currentMilestone: getCurrentMilestone(result.data?.referral_count ?? 0),
        waitlistReward: getWaitlistRewardCopy(persona),
        ...(positionData.error && { positionError: positionData.error }),
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('❌ Waitlist API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error. Please try again.',
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('📋 Waitlist API GET called');

    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const stats = searchParams.get('stats');

    if (email) {
      const emailCheck = await checkEmailWithPosition(email);
      console.log(`🔍 Email check for ${email}: ${emailCheck.exists}${emailCheck.position ? ` (#${emailCheck.position})` : ''}`);

      return NextResponse.json({
        exists: emailCheck.exists,
        status: emailCheck.status,
        firstName: emailCheck.firstName,
        position: emailCheck.position,
        totalCount: emailCheck.totalCount,
        persona: emailCheck.persona,
        candidateRole: emailCheck.candidateRole,
        queueScore: emailCheck.queueScore,
        referralCount: emailCheck.referralCount,
        referralCode: emailCheck.referralCode,
        currentMilestone: getCurrentMilestone(emailCheck.referralCount ?? 0),
        waitlistRewardEligible: emailCheck.waitlistRewardEligible,
        waitlistReward: emailCheck.persona
          ? getWaitlistRewardCopy(emailCheck.persona)
          : null,
      });
    }

    if (stats === 'true') {
      const waitlistStats = await getWaitlistStats();
      console.log('📊 Waitlist stats requested:', waitlistStats);
      return NextResponse.json({
        ...waitlistStats,
        message: 'Waitlist statistics from database',
      });
    }

    return NextResponse.json({
      message: 'Waitlist API is working!',
      mode: 'Prisma + Supabase PostgreSQL',
      timestamp: new Date().toISOString(),
      endpoints: {
        'POST /': 'Subscribe to waitlist',
        'GET /?email=user@example.com': 'Check if email exists',
        'GET /?stats=true': 'Get waitlist statistics',
        'DELETE /': 'Unsubscribe from waitlist',
      },
    });
  } catch (error) {
    console.error('❌ Waitlist GET API error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    console.log('🗑️  Waitlist API DELETE called');

    const body = await request.json();
    const { email } = body;

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const entry = await prisma.waitlist.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true },
    });

    if (!entry) {
      return NextResponse.json({ error: 'Email not found on waitlist.' }, { status: 404 });
    }

    await prisma.waitlist.update({
      where: { email: email.toLowerCase().trim() },
      data: { status: 'unsubscribed', unsubscribed_at: new Date() },
    });

    console.log(`✅ User unsubscribed from waitlist: ${email}`);

    syncWaitlistUnsubscribe(email.trim()).catch((error) =>
      console.error('❌ Resend audience unsubscribe sync failed:', error),
    );

    return NextResponse.json(
      { message: 'Successfully unsubscribed from waitlist' },
      { status: 200 },
    );
  } catch (error) {
    console.error('❌ Waitlist DELETE error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details:
          process.env.NODE_ENV === 'development' && error instanceof Error
            ? error.message
            : undefined,
      },
      { status: 500 },
    );
  }
}
