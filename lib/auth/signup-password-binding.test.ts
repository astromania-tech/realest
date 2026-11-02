/**
 * Signup must call the password rule in this module.
 * A re-export alone is not a local binding, so isPasswordValid threw,
 * the client catch showed "An unexpected error occurred", and
 * POST /api/auth/signup never ran. The waitlist GET still returned 200.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { signUpWithPassword } from "@/lib/auth";

const validPassword = "Abcdef1!";

test("valid signup posts to /api/auth/signup", async () => {
  const original = globalThis.fetch;
  const calls: Array<{ url: string; method: string; body: string }> = [];
  globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    calls.push({
      url: String(input),
      method: init?.method ?? "GET",
      body: String(init?.body ?? ""),
    });
    return new Response(
      JSON.stringify({
        success: true,
        user: { id: "user-1" },
        localConfirmed: true,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  }) as typeof fetch;

  try {
    const result = await signUpWithPassword(
      "seeker@example.com",
      validPassword,
      "",
      "user",
    );
    assert.equal(result.success, true);
    assert.equal(result.localConfirmed, true);
    assert.equal(result.error, undefined);
    assert.equal(calls.length, 1);
    assert.equal(calls[0].url, "/api/auth/signup");
    assert.equal(calls[0].method, "POST");
    const body = JSON.parse(calls[0].body) as {
      email: string;
      password: string;
      userType: string;
    };
    assert.equal(body.email, "seeker@example.com");
    assert.equal(body.password, validPassword);
    assert.equal(body.userType, "user");
  } finally {
    globalThis.fetch = original;
  }
});

test("a hosted signup that did not send mail keeps emailSent false", async () => {
  const original = globalThis.fetch;
  globalThis.fetch = (async () =>
    new Response(
      JSON.stringify({ success: true, user: { id: "user-1" }, emailSent: false }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    )) as typeof fetch;
  try {
    const result = await signUpWithPassword("seeker@example.com", validPassword, "", "user");
    assert.equal(result.success, true);
    assert.equal(result.emailSent, false);
    assert.equal(result.localConfirmed, false);
  } finally {
    globalThis.fetch = original;
  }
});

test("weak signup returns the password rule and does not fetch", async () => {
  const original = globalThis.fetch;
  let called = false;
  globalThis.fetch = (async () => {
    called = true;
    throw new Error("signup fetch should not run");
  }) as typeof fetch;

  try {
    const result = await signUpWithPassword(
      "seeker@example.com",
      "short",
      "",
      "user",
    );
    assert.equal(result.success, false);
    assert.match(result.error ?? "", /Weak password/);
    assert.equal(called, false);
  } finally {
    globalThis.fetch = original;
  }
});
