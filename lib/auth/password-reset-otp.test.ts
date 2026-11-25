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
  resetOtpResendSecondsRemaining,
  resetOtpExpiresAt,
  resetOtpSecondsRemaining,
  resetOtpMatches,
  RESET_EMAIL_RESEND_COOLDOWN_SECONDS,
  RESET_OTP_TTL_SECONDS,
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

test("reset expiry and resend countdown match the server token and send limits", () => {
  assert.equal(RESET_OTP_TTL_SECONDS, 15 * 60);
  assert.equal(RESET_EMAIL_RESEND_COOLDOWN_SECONDS, 60);
  assert.equal(resetOtpResendSecondsRemaining(RESET_OTP_TTL_SECONDS), 60);
  assert.equal(resetOtpResendSecondsRemaining(RESET_OTP_TTL_SECONDS - 59), 1);
  assert.equal(resetOtpResendSecondsRemaining(RESET_OTP_TTL_SECONDS - 60), 0);
  assert.equal(resetOtpResendSecondsRemaining(0), 0);
});

test("reset expiry timestamp is absolute and remaining time does not restart", () => {
  const requestedAt = 1_000_000;
  const expiresAt = resetOtpExpiresAt(requestedAt);

  assert.equal(expiresAt, requestedAt + 15 * 60 * 1_000);
  assert.equal(resetOtpSecondsRemaining(expiresAt, requestedAt), 900);
  assert.equal(resetOtpSecondsRemaining(expiresAt, requestedAt + 120_500), 780);
  assert.equal(resetOtpSecondsRemaining(expiresAt, expiresAt), 0);
  assert.equal(resetOtpSecondsRemaining(Number.NaN, requestedAt), 0);
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
  assert.match(source, /claimForgotPasswordSend/);
  assert.match(source, /verificationType:\s*"reset"/);
  assert.match(source, /sendHybridPasswordResetEmail/);
  assert.match(source, /otpCode/);
  assert.match(source, /resetLink/);
  assert.match(source, /expiryMinutes:\s*15/);
  assert.match(source, /maxAge:\s*RESET_OTP_TTL_SECONDS/);
});

test("password-changed notification selects full_name for its greeting", () => {
  const route = readFileSync(
    new URL("../../app/api/auth/password-changed/route.ts", import.meta.url),
    "utf8",
  );
  assert.match(route, /select:\s*\{\s*full_name:\s*true\s*\}/);
  assert.match(route, /profile\?\.full_name/);
  assert.match(route, /sendPasswordChangedEmail/);
  assert.doesNotMatch(route, /first_name/);

  const resetRoute = readFileSync(
    new URL(
      "../../app/api/auth/complete-password-reset/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(resetRoute, /select:\s*\{\s*full_name:\s*true\s*\}/);
  assert.match(resetRoute, /profile\?\.full_name/);
  assert.doesNotMatch(resetRoute, /first_name/);
});

test("forgot-password and reset-code screens explain expiry and resend timing", () => {
  const forgotClient = readFileSync(
    new URL(
      "../../app/(auth)/forgot-password/ForgotPasswordClient.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  const otpClient = readFileSync(
    new URL("../../app/(auth)/otp/OtpClient.tsx", import.meta.url),
    "utf8",
  );

  assert.match(forgotClient, /expire after 15 minutes/);
  assert.match(forgotClient, /one per minute/);
  assert.match(otpClient, /expires after 15 minutes/);
  assert.match(otpClient, /once a minute/);
  assert.match(
    otpClient,
    /otpType === "reset" && \(\s*<div className="text-center text-sm text-muted-foreground">/,
  );
  assert.doesNotMatch(otpClient, /Timer paused/);
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
