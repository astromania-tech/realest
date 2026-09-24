import assert from "node:assert/strict";
import test from "node:test";
import {
  isResendConfigured,
  resendApiKey,
  resendSkipReason,
  resolveResendAction,
} from "./lib/resend-key.mjs";

test("missing key is not configured", () => {
  assert.equal(isResendConfigured({}), false);
  assert.equal(isResendConfigured({ RESEND_API_KEY: "" }), false);
  assert.equal(isResendConfigured({ RESEND_API_KEY: "   " }), false);
});

test("present key is configured", () => {
  assert.equal(isResendConfigured({ RESEND_API_KEY: "re_test" }), true);
});

test("production with key always sends (local skip cannot win)", () => {
  const env = { RESEND_API_KEY: "re_prod", VERCEL_ENV: "production" };
  assert.equal(resolveResendAction(env), "send");
  assert.equal(resendSkipReason(env), null);
  assert.equal(resendApiKey(env), "re_prod");
});

test("preview with key still sends", () => {
  const env = { RESEND_API_KEY: "re_preview", VERCEL_ENV: "preview" };
  assert.equal(resolveResendAction(env), "send");
  assert.equal(resendSkipReason(env), null);
});

test("local with key still sends", () => {
  const env = { RESEND_API_KEY: "re_local", NODE_ENV: "development" };
  assert.equal(resolveResendAction(env), "send");
  assert.equal(resendSkipReason(env), null);
});

test("local without key skips", () => {
  assert.equal(resolveResendAction({ NODE_ENV: "development" }), "skip-local");
  assert.match(resendSkipReason({ NODE_ENV: "development" }), /local/);
  assert.equal(resendApiKey({ NODE_ENV: "development" }), null);
});

test("production without key is not the local skip", () => {
  const env = { VERCEL_ENV: "production" };
  assert.equal(resolveResendAction(env), "missing-on-production");
  assert.equal(resendSkipReason(env), "RESEND_API_KEY not configured");
  assert.doesNotMatch(resendSkipReason(env), /local/);
});

test("key present wins over missing VERCEL_ENV", () => {
  assert.equal(resolveResendAction({ RESEND_API_KEY: "re_x" }), "send");
});
