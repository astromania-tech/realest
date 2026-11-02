import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { turnstileMode, verifyTurnstileToken } from "./turnstile.ts";

test("turnstileMode skips locally without secret and verifies when secret is set", () => {
  const env = process.env as Record<string, string | undefined>;
  const prevSecret = env.TURNSTILE_SECRET_KEY;
  const prevNode = env.NODE_ENV;
  const prevMode = env.NEXT_PUBLIC_APP_MODE;
  try {
    delete env.TURNSTILE_SECRET_KEY;
    env.NODE_ENV = "development";
    env.NEXT_PUBLIC_APP_MODE = "development";
    assert.equal(turnstileMode(), "skip");

    env.TURNSTILE_SECRET_KEY = "test-secret";
    assert.equal(turnstileMode(), "verify");

    delete env.TURNSTILE_SECRET_KEY;
    env.NODE_ENV = "production";
    assert.equal(turnstileMode(), "misconfigured");
  } finally {
    if (prevSecret === undefined) delete env.TURNSTILE_SECRET_KEY;
    else env.TURNSTILE_SECRET_KEY = prevSecret;
    if (prevNode === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = prevNode;
    if (prevMode === undefined) delete env.NEXT_PUBLIC_APP_MODE;
    else env.NEXT_PUBLIC_APP_MODE = prevMode;
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
