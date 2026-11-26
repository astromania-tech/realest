/**
 * Signup must call the password rule in this module.
 * A re-export alone is not a local binding, so isPasswordValid threw,
 * the client catch showed "An unexpected error occurred", and
 * POST /api/auth/signup never ran. The waitlist GET still returned 200.
 */
import assert from "node:assert/strict";
import test from "node:test";
import { signUpWithPassword } from "@/lib/auth";
import {
  normalizeSignupEmail,
  signupApiFieldError,
  validateSignupFields,
} from "./signup-form-validation.ts";

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

test("registration validation identifies email, password, and confirmation errors", () => {
  assert.deepEqual(
    validateSignupFields({
      email: "bad-email",
      password: "short",
      confirmPassword: "different",
    }),
    {
      email: "Enter a valid email address.",
      password:
        "Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.",
      confirmPassword: "Passwords do not match.",
    },
  );
});

test("registration validation accepts normalized valid input", () => {
  assert.equal(normalizeSignupEmail("  Seeker@Example.com "), "seeker@example.com");
  assert.deepEqual(
    validateSignupFields({
      email: "  seeker@example.com ",
      password: validPassword,
      confirmPassword: validPassword,
    }),
    {},
  );
});

test("signup API validation errors map to the relevant form field", () => {
  assert.deepEqual(signupApiFieldError("User already registered"), {
    field: "email",
    message: "An account with this email already exists. Sign in or use another email.",
  });
  assert.deepEqual(signupApiFieldError("Password is too weak"), {
    field: "password",
    message:
      "Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.",
  });
  assert.deepEqual(
    signupApiFieldError("Password does not meet security requirements."),
    {
      field: "password",
      message:
        "Use at least 8 characters, including uppercase, lowercase, a number, and a symbol.",
    },
  );
  assert.deepEqual(signupApiFieldError("Email address is invalid"), {
    field: "email",
    message: "Enter a valid email address.",
  });
  assert.equal(signupApiFieldError("Signup service unavailable"), null);
});
