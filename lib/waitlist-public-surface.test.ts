/**
 * [A-01] Public waitlist GET must not dump referral/persona PII; DELETE needs a token.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("[A-01] waitlist GET email lookup returns a minimal projection", () => {
  const source = readFileSync("app/api/waitlist/route.ts", "utf8");
  assert.match(source, /waitlist_lookup/);
  assert.match(source, /candidateRole: emailCheck\.candidateRole/);
  assert.doesNotMatch(
    source,
    /referralCode:\s*emailCheck\.referralCode/,
  );
  assert.doesNotMatch(source, /queueScore:\s*emailCheck\.queueScore/);
  assert.doesNotMatch(
    source,
    /waitlistRewardEligible:\s*emailCheck\.waitlistRewardEligible/,
  );
});

test("[A-01] waitlist DELETE requires a signed unsubscribe token", () => {
  const source = readFileSync("app/api/waitlist/route.ts", "utf8");
  assert.match(source, /verifyWaitlistUnsubscribeToken/);
  assert.match(source, /createWaitlistUnsubscribeToken/);
  assert.match(source, /status: 403/);
});
