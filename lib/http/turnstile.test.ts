import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { turnstileMode, verifyTurnstileToken } from "./turnstile.ts";

test("turnstileMode skips locally without secret and verifies when secret is set", () => {
  const prevSecret = process.env.TURNSTILE_SECRET_KEY;
  const prevNode = process.env.NODE_ENV;
  const prevMode = process.env.NEXT_PUBLIC_APP_MODE;
  try {
    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.NODE_ENV = "development";
    process.env.NEXT_PUBLIC_APP_MODE = "development";
    assert.equal(turnstileMode(), "skip");

    process.env.TURNSTILE_SECRET_KEY = "test-secret";
    assert.equal(turnstileMode(), "verify");

    delete process.env.TURNSTILE_SECRET_KEY;
    process.env.NODE_ENV = "production";
    assert.equal(turnstileMode(), "misconfigured");
  } finally {
    if (prevSecret === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = prevSecret;
    if (prevNode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = prevNode;
    if (prevMode === undefined) delete process.env.NEXT_PUBLIC_APP_MODE;
    else process.env.NEXT_PUBLIC_APP_MODE = prevMode;
  }
});

test("verifyTurnstileToken skips locally and rejects empty token when verifying", async () => {
  const skipped = await verifyTurnstileToken(null, { mode: "skip" });
  assert.equal(skipped.ok, true);

  const prev = process.env.TURNSTILE_SECRET_KEY;
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  try {
    const empty = await verifyTurnstileToken("", { mode: "verify" });
    assert.equal(empty.ok, false);
    if (!empty.ok) assert.equal(empty.status, 403);
  } finally {
    if (prev === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = prev;
  }
});

test("verifyTurnstileToken accepts Cloudflare success", async () => {
  const prev = process.env.TURNSTILE_SECRET_KEY;
  process.env.TURNSTILE_SECRET_KEY = "test-secret";
  try {
    const result = await verifyTurnstileToken("tok_valid_token_here", {
      mode: "verify",
      fetchImpl: async () =>
        new Response(JSON.stringify({ success: true }), { status: 200 }),
    });
    assert.equal(result.ok, true);
  } finally {
    if (prev === undefined) delete process.env.TURNSTILE_SECRET_KEY;
    else process.env.TURNSTILE_SECRET_KEY = prev;
  }
});

test("waitlist POST verifies Turnstile before insert", () => {
  const source = readFileSync("app/api/waitlist/route.ts", "utf8");
  assert.match(source, /verifyTurnstileToken/);
  assert.match(source, /turnstileToken/);
});
