/**
 * [A-01] Invite setup password is server-gated: pending only, one-shot.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  completeInviteSetupAllowed,
  inviteSetupCompletedMetadata,
} from "./complete-invite-setup.ts";
import { INVITE_SETUP_USED_MESSAGE } from "./invite-setup.ts";

test("[A-01] completeInviteSetupAllowed requires pending + strong password", () => {
  assert.equal(
    completeInviteSetupAllowed({
      password: "x",
      passwordValid: false,
      userMetadata: { invite_setup: { status: "pending" } },
    }).ok,
    false,
  );
  assert.deepEqual(
    completeInviteSetupAllowed({
      password: "GoodPass1!",
      passwordValid: true,
      userMetadata: { invite_setup: { status: "completed" } },
    }),
    { ok: false, error: INVITE_SETUP_USED_MESSAGE, status: 403 },
  );
  assert.equal(
    completeInviteSetupAllowed({
      password: "GoodPass1!",
      passwordValid: true,
      userMetadata: {},
    }).ok,
    false,
  );
  assert.equal(
    completeInviteSetupAllowed({
      password: "GoodPass1!",
      passwordValid: true,
      userMetadata: { invite_setup: { status: "pending" } },
    }).ok,
    true,
  );
});

test("[A-01] completed metadata merges invite_setup completed", () => {
  const meta = inviteSetupCompletedMetadata(
    { full_name: "Ada", invite_setup: { status: "pending" } },
    new Date("2026-10-22T12:00:00.000Z"),
  );
  assert.equal(meta.full_name, "Ada");
  assert.deepEqual(meta.invite_setup, {
    status: "completed",
    completed_at: "2026-10-22T12:00:00.000Z",
  });
});

test("[A-01] setup-password page calls server complete route", () => {
  const page = readFileSync(
    "app/(auth)/setup-password/SetupPasswordClient.tsx",
    "utf8",
  );
  const route = readFileSync(
    "app/api/auth/invite-setup-password/route.ts",
    "utf8",
  );
  assert.match(page, /\/api\/auth\/invite-setup-password/);
  assert.doesNotMatch(page, /inviteSetupCompletedPatch/);
  assert.match(route, /completeInviteSetupAllowed/);
  assert.match(route, /updateUserById/);
});
