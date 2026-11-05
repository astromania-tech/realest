/**
 * Forgot-password must not send two emails for one double-click.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  coalesceForgotPasswordSend,
  isForgotPasswordSendOnCooldown,
  markForgotPasswordSent,
  resetForgotPasswordSendGateForTests,
} from "./forgot-password-send-gate.ts";

test("coalesceForgotPasswordSend runs the sender once for concurrent callers", async () => {
  resetForgotPasswordSendGateForTests();
  let runs = 0;
  const send = async () => {
    runs += 1;
    await new Promise((r) => setTimeout(r, 30));
    return { hashed: "abc" };
  };

  const [a, b] = await Promise.all([
    coalesceForgotPasswordSend("ada@realest.ng", send),
    coalesceForgotPasswordSend("ada@realest.ng", send),
  ]);

  assert.equal(runs, 1);
  assert.deepEqual(a, b);
  assert.equal(a.hashed, "abc");
});

test("isForgotPasswordSendOnCooldown after markForgotPasswordSent", () => {
  resetForgotPasswordSendGateForTests();
  const email = "chidi@realest.ng";
  const t0 = 1_000_000;
  assert.equal(isForgotPasswordSendOnCooldown(email, t0), false);
  markForgotPasswordSent(email, t0);
  assert.equal(isForgotPasswordSendOnCooldown(email, t0 + 1_000), true);
  assert.equal(isForgotPasswordSendOnCooldown(email, t0 + 60_000), false);
});
