/**
 * Waitlist join must not fail because rewards/ranking failed.
 * Subscribe + email stay on the success path.
 */
export async function applyWaitlistJoinRewards(record, deps) {
  if (!record) return { rewardsOk: true };
  if (!deps?.ensureWaitlistCohortReward || !deps?.recomputeWaitlistRankings) {
    throw new Error("applyWaitlistJoinRewards requires reward deps");
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
