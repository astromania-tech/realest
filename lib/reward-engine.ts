/**
 * lib/reward-engine.ts
 *
 * Reward engine — fully migrated from Supabase JS client to Prisma.
 * Architecture rule: Supabase = auth only. Prisma = all DB operations.
 *
 * All functions retain their original signatures so call-sites need
 * no changes, except the `client` parameter is now gone (Prisma is a
 * singleton; no client needs to be threaded through).
 */
import { prisma, type Prisma } from '@/lib/prisma';
import {
  WAITLIST_REWARD_KEY,
  buildReferralShareUrl,
  computeQueueScore,
  getCandidateRoleFromPersona,
  getCurrentMilestone,
  getLaunchRewardWindowEnd,
  getNextMilestone,
  getReachedMilestones,
  getWaitlistRewardCopy,
  isSupplySidePersona,
  isWaitlistPersona,
  type WaitlistPersona,
} from '@/lib/referral-system';
// import type { Prisma } from '@/lib/prisma';

// ─── Shared types ─────────────────────────────────────────────────────────────

export interface WaitlistLikeRecord {
  id: string;
  email: string;
  first_name: string;
  referral_code: string | null;
  referral_count: number | null;
  persona: string | null;
  poll_completion_count: number | null;
  subscribed_at: string | null;
}

// ─── recordReferralEvent ──────────────────────────────────────────────────────

export async function recordReferralEvent(event: {
  referrerWaitlistId?: string | null;
  referrerProfileId?: string | null;
  referredWaitlistId?: string | null;
  referredProfileId?: string | null;
  referralCode?: string | null;
  eventType: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await prisma.referral_events.create({
    data: {
      referrer_waitlist_id: event.referrerWaitlistId ?? null,
      referrer_profile_id: event.referrerProfileId ?? null,
      referred_waitlist_id: event.referredWaitlistId ?? null,
      referred_profile_id: event.referredProfileId ?? null,
      referral_code: event.referralCode ?? null,
      event_type: event.eventType,
      metadata: (event.metadata as Prisma.InputJsonValue) ?? {},
    },
  });
}

// ─── ensureWaitlistCohortReward ───────────────────────────────────────────────

export async function ensureWaitlistCohortReward(
  waitlistRecord: WaitlistLikeRecord,
): Promise<void> {
  if (
    !isWaitlistPersona(waitlistRecord.persona) ||
    !isSupplySidePersona(waitlistRecord.persona)
  ) {
    return;
  }

  const existing = await prisma.reward_entitlements.findFirst({
    where: {
      waitlist_id: waitlistRecord.id,
      reward_key: WAITLIST_REWARD_KEY,
    },
    select: { id: true },
  });

  if (existing) return;

  const entitlement = await prisma.reward_entitlements.create({
    data: {
      user_email: waitlistRecord.email,
      waitlist_id: waitlistRecord.id,
      reward_key: WAITLIST_REWARD_KEY,
      source_event: 'waitlist_joined',
      status: 'active',
      granted_at: new Date(),
      expires_at: getLaunchRewardWindowEnd(),
      metadata: ({
        persona: waitlistRecord.persona,
        reward_copy: getWaitlistRewardCopy(waitlistRecord.persona),
        referral_code: waitlistRecord.referral_code,
      } as Prisma.InputJsonValue),
    },
  });

  await recordReferralEvent({
    referrerWaitlistId: waitlistRecord.id,
    referralCode: waitlistRecord.referral_code,
    eventType: 'reward_entitlement_granted',
    metadata: { reward_key: WAITLIST_REWARD_KEY },
  });
}

// ─── ensureReferralMilestoneRewards ───────────────────────────────────────────

export async function ensureReferralMilestoneRewards(params: {
  userEmail: string;
  referralCount: number;
  referralCode?: string | null;
  waitlistId?: string | null;
  profileId?: string | null;
}): Promise<void> {
  const reachedMilestones = getReachedMilestones(params.referralCount);

  for (const milestone of reachedMilestones) {
    const existing = await prisma.reward_entitlements.findFirst({
      where: {
        reward_key: milestone.key,
        user_email: params.userEmail,
      },
      select: { id: true },
    });

    if (existing) continue;

    await prisma.reward_entitlements.create({
      data: {
        user_email: params.userEmail,
        waitlist_id: params.waitlistId ?? null,
        profile_id: params.profileId ?? null,
        reward_key: milestone.key,
        source_event: 'referral_count_incremented',
        source_referral_count: milestone.count,
        status: 'active',
        granted_at: new Date(),
        metadata: ({
          reward_label: milestone.label,
          reward_description: milestone.description,
          referral_code: params.referralCode ?? null,
        } as Prisma.InputJsonValue),
      },
    });
  }
}

// ─── recomputeWaitlistRankings ────────────────────────────────────────────────

export async function recomputeWaitlistRankings(): Promise<void> {
  const rows = await prisma.waitlist.findMany({
    where: { status: 'active' },
    select: {
      id: true,
      email: true,
      first_name: true,
      referral_code: true,
      referral_count: true,
      persona: true,
      poll_completion_count: true,
      subscribed_at: true,
    },
  });

  const rankedRows = rows
    .map((row) => {
      const persona = isWaitlistPersona(row.persona) ? row.persona : 'buyer_renter';
      return {
        ...row,
        persona,
        queue_score: computeQueueScore({
          persona,
          referralCount: row.referral_count ?? 0,
          pollCompletionCount: row.poll_completion_count ?? 0,
        }),
        candidate_role: getCandidateRoleFromPersona(persona),
        waitlist_reward_eligible: isSupplySidePersona(persona),
      };
    })
    .sort((a, b) => {
      if (b.queue_score !== a.queue_score) return b.queue_score - a.queue_score;
      const aDate = a.subscribed_at ? new Date(a.subscribed_at).getTime() : 0;
      const bDate = b.subscribed_at ? new Date(b.subscribed_at).getTime() : 0;
      return aDate - bDate;
    });

  // Process all rows — update rankings, history, and rewards
  for (const [index, row] of rankedRows.entries()) {
    const rank = index + 1;

    await prisma.waitlist.update({
      where: { id: row.id },
      data: {
        queue_score: row.queue_score,
        queue_rank: rank,
        candidate_role: row.candidate_role,
        waitlist_reward_eligible: row.waitlist_reward_eligible,
      },
    });

    await prisma.waitlist_rank_history.create({
      data: {
        waitlist_id: row.id,
        rank,
        score: row.queue_score,
        reason: 'recompute',
      },
    });

    await ensureReferralMilestoneRewards({
      userEmail: row.email,
      referralCount: row.referral_count ?? 0,
      referralCode: row.referral_code,
      waitlistId: row.id,
    });

    await ensureWaitlistCohortReward({
      id: row.id,
      email: row.email,
      first_name: row.first_name,
      referral_code: row.referral_code,
      referral_count: row.referral_count,
      persona: row.persona,
      poll_completion_count: row.poll_completion_count,
      subscribed_at: row.subscribed_at?.toISOString() ?? null,
    });
  }
}

// ─── syncWaitlistContextToProfile ────────────────────────────────────────────

export async function syncWaitlistContextToProfile(
  email: string,
  profileId: string,
): Promise<{
  persona: WaitlistPersona;
  candidateRole: string;
  queueRank: number | null;
  queueScore: number;
  referralCount: number | null;
  referralCode: string | null;
  shareUrl: string | null;
} | null> {
  const normalizedEmail = email.trim().toLowerCase();

  const waitlistRow = await prisma.waitlist.findUnique({
    where: { email: normalizedEmail },
    select: {
      id: true,
      email: true,
      persona: true,
      referral_code: true,
      referral_count: true,
      queue_rank: true,
      queue_score: true,
      candidate_role: true,
      waitlist_reward_eligible: true,
    },
  });

  if (!waitlistRow) return null;

  const persona = isWaitlistPersona(waitlistRow.persona)
    ? waitlistRow.persona
    : 'buyer_renter';
  const candidateRole = getCandidateRoleFromPersona(persona);
  const launchRewardWindowEnd = isSupplySidePersona(persona)
    ? getLaunchRewardWindowEnd()
    : null;

  await prisma.profiles.update({
    where: { id: profileId },
    data: {
      waitlist_persona: persona,
      candidate_role: candidateRole,
      launch_reward_window_ends_at: launchRewardWindowEnd,
    },
  });

  if (candidateRole !== 'user') {
    await prisma.users.update({
      where: { id: profileId },
      data: { role: candidateRole as any },
    });
  }

  // Link any unlinked reward entitlements to this profile
  await prisma.reward_entitlements.updateMany({
    where: {
      user_email: normalizedEmail,
      profile_id: null,
    },
    data: { profile_id: profileId },
  });

  await recordReferralEvent({
    referredWaitlistId: waitlistRow.id,
    referredProfileId: profileId,
    referralCode: waitlistRow.referral_code,
    eventType: 'account_created_from_waitlist',
    metadata: { persona, candidate_role: candidateRole },
  });

  return {
    persona,
    candidateRole,
    queueRank: waitlistRow.queue_rank,
    queueScore: waitlistRow.queue_score,
    referralCount: waitlistRow.referral_count,
    referralCode: waitlistRow.referral_code,
    shareUrl: waitlistRow.referral_code
      ? buildReferralShareUrl(waitlistRow.referral_code)
      : null,
  };
}

// ─── getReferralSummaryForEmail ───────────────────────────────────────────────

export async function getReferralSummaryForEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();

  const [waitlistRow, profileRow, entitlements] = await Promise.all([
    prisma.waitlist.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        first_name: true,
        referral_code: true,
        referral_count: true,
        queue_rank: true,
        queue_score: true,
        persona: true,
      },
    }),
    prisma.profiles.findFirst({
      where: { email: normalizedEmail },
      select: {
        id: true,
        full_name: true,
        referral_code: true,
        referral_count: true,
        waitlist_persona: true,
        candidate_role: true,
        launch_reward_window_ends_at: true,
      },
    }),
    prisma.reward_entitlements.findMany({
      where: { user_email: normalizedEmail },
      select: {
        id: true,
        reward_key: true,
        status: true,
        granted_at: true,
        expires_at: true,
        metadata: true,
      },
      orderBy: { granted_at: 'desc' },
    }),
  ]);

  const referralCount = Math.max(
    waitlistRow?.referral_count ?? 0,
    profileRow?.referral_count ?? 0,
  );
  const referralCode =
    profileRow?.referral_code ?? waitlistRow?.referral_code ?? null;
  const persona = isWaitlistPersona(profileRow?.waitlist_persona)
    ? profileRow.waitlist_persona
    : isWaitlistPersona(waitlistRow?.persona)
    ? waitlistRow.persona
    : null;

  return {
    email: normalizedEmail,
    firstName:
      profileRow?.full_name?.split(' ')[0] ??
      waitlistRow?.first_name ??
      'there',
    referralCode,
    referralCount,
    currentMilestone: getCurrentMilestone(referralCount),
    nextMilestone: getNextMilestone(referralCount),
    queueRank: waitlistRow?.queue_rank ?? null,
    queueScore: waitlistRow?.queue_score ?? null,
    persona,
    candidateRole:
      profileRow?.candidate_role ??
      (persona ? getCandidateRoleFromPersona(persona) : 'user'),
    entitlements,
    launchRewardWindowEndsAt:
      profileRow?.launch_reward_window_ends_at ?? null,
    shareUrl: referralCode ? buildReferralShareUrl(referralCode) : null,
  };
}

// ─── redeemFirstListingWaiver ─────────────────────────────────────────────────

export async function redeemFirstListingWaiver(
  profileId: string,
  listingId: string,
): Promise<{ redeemed: boolean; reason?: string; entitlementId?: string }> {
  const now = new Date();

  const entitlement = await prisma.reward_entitlements.findFirst({
    where: {
      profile_id: profileId,
      reward_key: WAITLIST_REWARD_KEY,
      status: 'active',
    },
    orderBy: { granted_at: 'asc' },
    select: { id: true, expires_at: true, status: true },
  });

  if (!entitlement) {
    return { redeemed: false, reason: 'No active first-listing fee waiver found.' };
  }

  if (entitlement.expires_at && entitlement.expires_at < now) {
    await prisma.reward_entitlements.update({
      where: { id: entitlement.id },
      data: { status: 'expired' },
    });
    return { redeemed: false, reason: 'The first-listing fee waiver has expired.' };
  }

  await prisma.reward_entitlements.update({
    where: { id: entitlement.id },
    data: { status: 'redeemed' },
  });

  await prisma.reward_redemptions.create({
    data: {
      entitlement_id: entitlement.id,
      profile_id: profileId,
      redemption_context: 'first_listing_fee_waiver',
      redemption_reference_id: listingId,
      redeemed_at: now,
      metadata: { listing_id: listingId },
    },
  });

  await recordReferralEvent({
    referredProfileId: profileId,
    eventType: 'first_listing_fee_waiver_redeemed',
    metadata: { listing_id: listingId, entitlement_id: entitlement.id },
  });

  return { redeemed: true, entitlementId: entitlement.id };
}
