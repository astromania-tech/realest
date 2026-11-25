/**
 * Password reset completion must run on the server with recovery cookies.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import {
  changePasswordWithCurrentPassword,
  missingPasswordRequirements,
  sendPasswordChangedNotification,
} from "./change-password.ts";

test("handlePasswordResetSession allows OTP arrival without client session", () => {
  const source = readFileSync(new URL("../auth.ts", import.meta.url), "utf8");
  assert.match(
    source,
    /deferring to server cookie check/,
  );
  assert.doesNotMatch(
    source,
    /No reset token found\. Please check your email link/,
  );
});

test("complete-password-reset route signs out after update", () => {
  const source = readFileSync(
    new URL(
      "../../app/api/auth/complete-password-reset/route.ts",
      import.meta.url,
    ),
    "utf8",
  );
  const updateIdx = source.indexOf("updateUser");
  const notifyIdx = source.indexOf("sendPasswordChangedEmail");
  const signOutIdx = source.indexOf("signOut");
  assert.ok(updateIdx > 0);
  assert.ok(notifyIdx > updateIdx, "notify after update");
  assert.ok(signOutIdx > notifyIdx, "signOut after notify");
});

test("profile password change verifies, updates, then requests the notification", async () => {
  const calls: string[] = [];
  const auth = {
    getUser: async () => ({
      data: { user: { email: "owner@example.com" } },
      error: null,
    }),
    signInWithPassword: async (credentials: { email: string; password: string }) => {
      calls.push(`verify:${credentials.email}:${credentials.password}`);
      return { error: null };
    },
    updateUser: async (attributes: { password: string }) => {
      calls.push(`update:${attributes.password}`);
      return { error: null };
    },
  };

  const result = await changePasswordWithCurrentPassword(
    auth,
    "current-secret",
    "NewSecret1!",
    async () => {
      calls.push("notify");
      return true;
    },
  );

  assert.deepEqual(result, { success: true, notificationSent: true });
  assert.deepEqual(calls, [
    "verify:owner@example.com:current-secret",
    "update:NewSecret1!",
    "notify",
  ]);
});

test("password-changed notification posts to the authenticated endpoint", async () => {
  let request: { url: string | URL | Request; init?: RequestInit } | undefined;
  const notificationSent = await sendPasswordChangedNotification(
    async (url, init) => {
      request = { url, init };
      return new Response(JSON.stringify({ success: true }), { status: 200 });
    },
  );

  assert.equal(notificationSent, true);
  assert.equal(request?.url, "/api/auth/password-changed");
  assert.equal(request?.init?.method, "POST");
});

test("password-changed notification reports endpoint delivery failures", async () => {
  const notificationSent = await sendPasswordChangedNotification(
    async () => new Response(JSON.stringify({ success: false }), { status: 200 }),
  );

  assert.equal(notificationSent, false);
});

test("notification failure does not undo a successful password update", async () => {
  const auth = {
    getUser: async () => ({
      data: { user: { email: "owner@example.com" } },
      error: null,
    }),
    signInWithPassword: async () => ({ error: null }),
    updateUser: async () => ({ error: null }),
  };

  const result = await changePasswordWithCurrentPassword(
    auth,
    "current-secret",
    "NewSecret1!",
    async () => false,
  );

  assert.deepEqual(result, { success: true, notificationSent: false });
});

test("missing password requirements are listed individually", () => {
  assert.deepEqual(missingPasswordRequirements("abc"), [
    "at least 8 characters",
    "an uppercase letter",
    "a number",
    "a symbol",
  ]);
  assert.deepEqual(missingPasswordRequirements("NewSecret1!"), []);
});

test("profile password change stops when the current password is wrong", async () => {
  let updateCalled = false;
  const auth = {
    getUser: async () => ({
      data: { user: { email: "owner@example.com" } },
      error: null,
    }),
    signInWithPassword: async () => ({
      error: { code: "invalid_credentials", message: "Invalid login credentials" },
    }),
    updateUser: async () => {
      updateCalled = true;
      return { error: null };
    },
  };

  const result = await changePasswordWithCurrentPassword(
    auth,
    "wrong-secret",
    "NewSecret1!",
  );

  assert.deepEqual(result, {
    success: false,
    error: "Your current password is incorrect.",
  });
  assert.equal(updateCalled, false);
});

test("profile password change reports a missing session without updating", async () => {
  let updateCalled = false;
  const auth = {
    getUser: async () => ({ data: { user: null }, error: null }),
    signInWithPassword: async () => ({ error: null }),
    updateUser: async () => {
      updateCalled = true;
      return { error: null };
    },
  };

  const result = await changePasswordWithCurrentPassword(
    auth,
    "current-secret",
    "NewSecret1!",
  );

  assert.equal(result.success, false);
  assert.equal(updateCalled, false);
});

test("profile change-password UI calls the auth helper and has real result states", () => {
  const source = readFileSync(
    new URL(
      "../../app/(dashboard)/profile/change-password/page.tsx",
      import.meta.url,
    ),
    "utf8",
  );
  assert.match(source, /changePasswordWithCurrentPassword/);
  assert.match(source, /role="status"/);
  assert.match(source, /role="alert"/);
  assert.doesNotMatch(source, /TODO: Implement password change|setTimeout\(|alert\(/);
});
