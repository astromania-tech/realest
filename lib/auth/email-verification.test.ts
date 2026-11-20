import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import type { User } from "@supabase/supabase-js";
import {
  verificationDestinationForUser,
  verificationFailureKind,
  verificationFailureMessage,
  verifyEmailLink,
  type VerificationAuthApi,
} from "./email-verification.ts";

const agentUser = {
  aud: "authenticated",
  id: "agent-1",
  email: "agent@example.com",
  email_confirmed_at: "2026-11-20T10:00:00Z",
  app_metadata: { role: "agent" },
  user_metadata: { user_type: "agent" },
  created_at: "2026-11-20T09:00:00Z",
} as User;

test("token verification link verifies with Supabase and routes an agent to onboarding", async () => {
  let usedToken = "";
  const auth: VerificationAuthApi = {
    initialize: async () => ({ error: null }),
    verifyOtp: async (params) => {
      usedToken = params.token;
      assert.equal(params.email, "");
      assert.equal(params.type, "signup");
      return { data: { user: agentUser }, error: null };
    },
    getSession: async () => {
      throw new Error("token link should use verifyOtp");
    },
  };

  const result = await verifyEmailLink(auth, {
    token: "token-hash",
    code: null,
    type: "signup",
  });

  assert.equal(usedToken, "token-hash");
  assert.equal(result.status, "verified");
  if (result.status === "verified") {
    assert.equal(verificationDestinationForUser(result.user), "/onboarding");
  }
});

test("PKCE code link routes the session Supabase established to onboarding", async () => {
  let readSession = false;
  const auth: VerificationAuthApi = {
    initialize: async () => ({ error: null }),
    verifyOtp: async () => {
      throw new Error("PKCE link must not verify the code a second time");
    },
    getSession: async () => {
      readSession = true;
      return { data: { session: { user: agentUser } }, error: null };
    },
  };

  const result = await verifyEmailLink(auth, {
    token: null,
    code: "supabase-pkce-code",
    type: "signup",
  });

  assert.equal(readSession, true);
  assert.equal(result.status, "verified");
  if (result.status === "verified") {
    assert.equal(verificationDestinationForUser(result.user), "/onboarding");
  }
});

test("expired and wrong verification inputs have distinct user-facing messages", () => {
  assert.equal(verificationFailureKind("Token has expired"), "expired");
  assert.equal(verificationFailureKind("Invalid code"), "invalid");
  assert.equal(
    verificationFailureMessage("expired", "link"),
    "This verification link has expired. Request a new email to verify your address.",
  );
  assert.equal(
    verificationFailureMessage("invalid", "code"),
    "That code is incorrect. Check the email and try again.",
  );
  assert.equal(
    verificationFailureMessage("invalid", "link"),
    "This verification link is invalid or has already been used. Request a new verification email.",
  );
});

test("users without a role return to login for the existing verified-account fallback", () => {
  const userWithoutRole = { ...agentUser, app_metadata: {}, user_metadata: {} } as User;
  assert.equal(verificationDestinationForUser(userWithoutRole), "/login?verified=true");
});

test("verification requires a confirmed user and reports missing or invalid links", async () => {
  const auth: VerificationAuthApi = {
    initialize: async () => ({ error: null }),
    verifyOtp: async () => ({
      data: { user: { ...agentUser, email_confirmed_at: undefined } as User },
      error: null,
    }),
    getSession: async () => ({ data: { session: null }, error: null }),
  };

  const noLink = await verifyEmailLink(auth, {
    token: null,
    code: null,
    type: "signup",
  });
  const unconfirmedToken = await verifyEmailLink(auth, {
    token: "unconfirmed-token",
    code: null,
    type: "signup",
  });
  const missingPkceSession = await verifyEmailLink(auth, {
    token: null,
    code: "expired-code",
    type: "signup",
  });

  assert.deepEqual(noLink, { status: "failed", kind: "missing" });
  assert.deepEqual(unconfirmedToken, { status: "failed", kind: "invalid" });
  assert.deepEqual(missingPkceSession, { status: "failed", kind: "invalid" });
});

test("PKCE initialization errors surface an expired-link state without exchanging twice", async () => {
  let sessionWasRead = false;
  let tokenWasVerified = false;
  const auth: VerificationAuthApi = {
    initialize: async () => ({ error: { message: "Email link has expired" } }),
    verifyOtp: async () => {
      tokenWasVerified = true;
      return { data: { user: null }, error: null };
    },
    getSession: async () => {
      sessionWasRead = true;
      return { data: { session: null }, error: null };
    },
  };

  const result = await verifyEmailLink(auth, {
    token: null,
    code: "expired-pkce-code",
    type: "signup",
  });

  assert.deepEqual(result, { status: "failed", kind: "expired" });
  assert.equal(sessionWasRead, false);
  assert.equal(tokenWasVerified, false);
});

test("verification page consumes both link types and routes through the role destination", () => {
  const source = readFileSync("app/(auth)/verify/VerifyClient.tsx", "utf8");
  assert.match(source, /verifyEmailLink\(supabase\.auth/);
  assert.match(source, /verificationDestinationForUser/);
  assert.match(source, /router\.push\(destination\)/);
});

test("OTP UI renders distinct expired and incorrect-code copy", () => {
  const source = readFileSync("app/(auth)/otp/OtpClient.tsx", "utf8");
  assert.match(source, /verificationFailureKind/);
  assert.match(source, /verificationFailureMessage/);
  assert.equal(
    verificationFailureMessage("expired", "code"),
    "Your code has expired. Request a new one below.",
  );
  assert.equal(
    verificationFailureMessage("invalid", "code"),
    "That code is incorrect. Check the email and try again.",
  );
});
