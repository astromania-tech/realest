import assert from "node:assert/strict";
import test from "node:test";
import { isResendConfigured, resendSkipReason } from "./lib/resend-key.mjs";

test("missing key is not configured", () => {
  assert.equal(isResendConfigured({}), false);
  assert.equal(isResendConfigured({ RESEND_API_KEY: "" }), false);
  assert.equal(isResendConfigured({ RESEND_API_KEY: "   " }), false);
});

test("present key is configured", () => {
  assert.equal(isResendConfigured({ RESEND_API_KEY: "re_test" }), true);
});

test("local skip does not throw and names localhost", () => {
  const reason = resendSkipReason({ NODE_ENV: "development" });
  assert.equal(typeof reason, "string");
  assert.match(reason, /local/);
});

test("Vercel production skip is explicit, still no throw", () => {
  const reason = resendSkipReason({ VERCEL_ENV: "production" });
  assert.equal(reason, "RESEND_API_KEY not configured");
});

test("configured env has no skip reason", () => {
  assert.equal(
    resendSkipReason({ RESEND_API_KEY: "re_test", VERCEL_ENV: "production" }),
    null,
  );
});
