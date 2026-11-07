/**
 * Forgot-password must not send two emails for one double-click.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { readFileSync } from "node:fs";
import {
  claimForgotPasswordSend,
  coalesceForgotPasswordSend,
  FORGOT_PASSWORD_SEND_BUCKET,
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

test("claimForgotPasswordSend allows one send per email in the window", async () => {
  const seen: Array<{ bucket: string; subject: string; limit?: number }> = [];
  const consume = async (input: { bucket: string; subject: string; limit?: number }) => {
    seen.push(input);
    return { allowed: seen.length === 1 };
  };
  const now = new Date("2026-11-05T07:00:00.000Z");
  assert.equal(await claimForgotPasswordSend("chidi@realest.ng", now, consume), true);
  assert.equal(await claimForgotPasswordSend("chidi@realest.ng", now, consume), false);
  assert.equal(seen[0]?.bucket, FORGOT_PASSWORD_SEND_BUCKET);
  assert.equal(seen[0]?.subject, "chidi@realest.ng");
  assert.equal(seen[0]?.limit, 1);
});

test("forgot-password route uses the database send gate", () => {
  const source = readFileSync("app/api/auth/forgot-password/route.ts", "utf8");
  assert.match(source, /claimForgotPasswordSend/);
  assert.equal(source.includes("lastSentAt"), false);
  assert.equal(source.includes("isForgotPasswordSendOnCooldown"), false);
  assert.equal(source.includes("markForgotPasswordSent"), false);
});
