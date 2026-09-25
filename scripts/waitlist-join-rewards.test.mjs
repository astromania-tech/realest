import assert from "node:assert/strict";
import test from "node:test";
import { applyWaitlistJoinRewards } from "./lib/waitlist-join-rewards.mjs";

const record = {
  id: "w1",
  email: "test@example.com",
  first_name: "Test",
  referral_code: "ABC",
  referral_count: 0,
  persona: "buyer_renter",
  poll_completion_count: 0,
  subscribed_at: null,
};

test("null record is a no-op success", async () => {
  const out = await applyWaitlistJoinRewards(null, {
    ensureWaitlistCohortReward: async () => {
      throw new Error("should not run");
    },
    recomputeWaitlistRankings: async () => {
      throw new Error("should not run");
    },
  });
  assert.deepEqual(out, { rewardsOk: true });
});

test("P2003 from ranking does not throw", async () => {
  const err = Object.assign(new Error("Foreign key constraint violated"), {
    code: "P2003",
  });
  const out = await applyWaitlistJoinRewards(record, {
    ensureWaitlistCohortReward: async () => {},
    recomputeWaitlistRankings: async () => {
      throw err;
    },
  });
  assert.equal(out.rewardsOk, false);
});

test("success path calls both deps", async () => {
  const calls = [];
  const out = await applyWaitlistJoinRewards(record, {
    ensureWaitlistCohortReward: async (row) => {
      calls.push("ensure:" + row.id);
    },
    recomputeWaitlistRankings: async () => {
      calls.push("recompute");
    },
  });
  assert.deepEqual(out, { rewardsOk: true });
  assert.deepEqual(calls, ["ensure:w1", "recompute"]);
});
