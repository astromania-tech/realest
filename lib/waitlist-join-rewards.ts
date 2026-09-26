/**
 * Waitlist join must not fail because rewards/ranking failed.
 * Subscribe + email stay on the success path.
 * This function is the only error boundary. It must not throw.
 * The route awaits it and does not wrap it in try/catch.
 */

import type { WaitlistLikeRecord } from "@/lib/reward-engine";

export type WaitlistJoinRewardDeps = {
  ensureWaitlistCohortReward?: (
    record: WaitlistLikeRecord,
  ) => Promise<unknown>;
  recomputeWaitlistRankings?: () => Promise<unknown>;
};

export type WaitlistJoinRewardResult = { rewardsOk: boolean };

export async function applyWaitlistJoinRewards(
  record: WaitlistLikeRecord | null | undefined,
  deps: WaitlistJoinRewardDeps | null | undefined,
): Promise<WaitlistJoinRewardResult> {
  if (!record) return { rewardsOk: true };
  if (!deps?.ensureWaitlistCohortReward || !deps?.recomputeWaitlistRankings) {
    console.error(
      "❌ Waitlist reward/rank skipped: missing deps. Email will still send.",
    );
    return { rewardsOk: false };
  }
  try {
    await deps.ensureWaitlistCohortReward(record);
    await deps.recomputeWaitlistRankings();
    return { rewardsOk: true };
  } catch (error) {
    console.error(
      "❌ Waitlist reward/rank failed after subscribe. Email will still send.",
      error,
    );
    return { rewardsOk: false };
  }
}
