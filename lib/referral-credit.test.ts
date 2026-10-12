import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { referralAlreadyCredited } from "./referral-credit.ts";

test("a referred person with no credit event can be counted", () => {
  assert.equal(referralAlreadyCredited([]), false);
  assert.equal(referralAlreadyCredited([{ event_type: "invite_email_sent" }]), false);
});

test("waitlist join and account signup are the same credit", () => {
  assert.equal(
    referralAlreadyCredited([{ event_type: "waitlist_referral_attributed" }]),
    true,
  );
  assert.equal(
    referralAlreadyCredited([{ event_type: "registration_referral_attributed" }]),
    true,
  );
});

test("signup and waitlist attribution check credit before adding a count", () => {
  const signup = readFileSync("app/api/auth/attribute-referral/route.ts", "utf8");
  const waitlist = readFileSync("app/api/waitlist/route.ts", "utf8");
  for (const text of [signup, waitlist]) {
    const creditAt = text.indexOf("referralAlreadyCredited");
    const incrementAt = text.indexOf("referral_count: newCount");
    assert.ok(creditAt !== -1);
    assert.ok(incrementAt !== -1);
    assert.ok(creditAt < incrementAt);
  }
});
