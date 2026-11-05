/**
 * Password-reset OTP must exchange token_hash with Supabase, not token+email.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { deriveNumericOtp } from "../utils/otp.ts";
import {
  normalizeResetEmail,
  recoveryVerifyOtpParams,
  resetOtpMatches,
} from "./password-reset-otp.ts";

test("normalizeResetEmail trims and lowercases", () => {
  assert.equal(normalizeResetEmail("  Ada@RealEST.ng "), "ada@realest.ng");
});

test("recoveryVerifyOtpParams uses token_hash + recovery type", () => {
  const params = recoveryVerifyOtpParams("abc123hashed");
  assert.deepEqual(params, {
    token_hash: "abc123hashed",
    type: "recovery",
  });
  assert.equal("token" in params, false);
  assert.equal("email" in params, false);
});

test("resetOtpMatches accepts the derived 6-digit code", () => {
  const hash = "deadbeefcafebabe0123456789abcdef";
  const code = deriveNumericOtp(hash);
  assert.match(code, /^\d{6}$/);
  assert.equal(resetOtpMatches(code, hash, deriveNumericOtp), true);
  assert.equal(resetOtpMatches("000000", hash, deriveNumericOtp), false);
});

test("verify-reset-otp route calls recoveryVerifyOtpParams / token_hash", () => {
  const source = readFileSync(
    new URL("../../app/api/auth/verify-reset-otp/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /recoveryVerifyOtpParams/);
  assert.match(source, /token_hash/);
  assert.doesNotMatch(
    source,
    /token:\s*storedHash/,
  );
  assert.doesNotMatch(source, /email:\s*""/);
});

test("forgot-password normalizes email and coalesces duplicate sends", () => {
  const source = readFileSync(
    new URL("../../app/api/auth/forgot-password/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(source, /normalizeResetEmail/);
  assert.match(source, /coalesceForgotPasswordSend/);
  assert.match(source, /isForgotPasswordSendOnCooldown/);
  assert.match(source, /verificationType:\s*"reset"/);
});

test("complete-password-reset updates password on the server", () => {
  const source = readFileSync(
    new URL(
      "../../app/api/auth/complete-password-reset/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /updateUser\(\{\s*password/);
  assert.match(source, /createServerClient/);
  assert.match(source, /signOut/);
});

test("reset-password client posts to complete-password-reset", () => {
  const source = readFileSync(
    new URL(
      "../../app/(auth)/reset-password/ResetPasswordClient.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /\/api\/auth\/complete-password-reset/);
  assert.doesNotMatch(source, /resetPassword\(/);
});

test("forgot-password client guards double submit with a ref", () => {
  const source = readFileSync(
    new URL(
      "../../app/(auth)/forgot-password/ForgotPasswordClient.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /submitLockRef/);
});
