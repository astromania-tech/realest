import assert from "node:assert/strict";
import test from "node:test";
import {
  createWaitlistUnsubscribeToken,
  verifyWaitlistUnsubscribeToken,
} from "./waitlist-unsubscribe-token.ts";

test("unsubscribe token verifies for the same email and rejects others", () => {
  const prev = process.env.WAITLIST_UNSUBSCRIBE_SECRET;
  process.env.WAITLIST_UNSUBSCRIBE_SECRET = "test-secret-at-least-16";
  try {
    const token = createWaitlistUnsubscribeToken("Ada@RealEST.ng");
    assert.ok(token);
    assert.equal(verifyWaitlistUnsubscribeToken("ada@realest.ng", token), true);
    assert.equal(verifyWaitlistUnsubscribeToken("other@realest.ng", token), false);
    assert.equal(verifyWaitlistUnsubscribeToken("ada@realest.ng", "garbage"), false);
  } finally {
    if (prev === undefined) delete process.env.WAITLIST_UNSUBSCRIBE_SECRET;
    else process.env.WAITLIST_UNSUBSCRIBE_SECRET = prev;
  }
});

test("expired unsubscribe token is rejected", () => {
  const prev = process.env.WAITLIST_UNSUBSCRIBE_SECRET;
  process.env.WAITLIST_UNSUBSCRIBE_SECRET = "test-secret-at-least-16";
  try {
    const now = Date.now();
    const token = createWaitlistUnsubscribeToken("ada@realest.ng", now);
    assert.ok(token);
    const monthLater = now + 1000 * 60 * 60 * 24 * 31;
    assert.equal(
      verifyWaitlistUnsubscribeToken("ada@realest.ng", token, monthLater),
      false,
    );
  } finally {
    if (prev === undefined) delete process.env.WAITLIST_UNSUBSCRIBE_SECRET;
    else process.env.WAITLIST_UNSUBSCRIBE_SECRET = prev;
  }
});
