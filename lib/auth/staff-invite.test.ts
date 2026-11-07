/**
 * Staff invite gates: invitable roles, create vs promote, refuse admin, state/LGA required.
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isInvitableStaffRole,
  localStaffSetupLink,
  staffInviteExistingDecision,
  staffInviteHomePath,
  staffInviteInputAllowed,
  staffInviteRedirectTo,
} from "./staff-invite.ts";
import { resolveResendAction } from "../resend-key.ts";

test("only Connect staff roles are invitable (not admin)", () => {
  assert.equal(isInvitableStaffRole("reviewer"), true);
  assert.equal(isInvitableStaffRole("supervisor"), true);
  assert.equal(isInvitableStaffRole("team_leader"), true);
  assert.equal(isInvitableStaffRole("team_member"), true);
  assert.equal(isInvitableStaffRole("admin"), false);
  assert.equal(isInvitableStaffRole("user"), false);
  assert.equal(isInvitableStaffRole("owner"), false);
});

test("staffInviteInputAllowed requires state and LGA", () => {
  const ok = staffInviteInputAllowed({
    email: "  Chioma@Example.NG ",
    fullName: "Chioma Adeyemi",
    role: "team_leader",
    state: "Lagos",
    lga: "Ikeja",
    knownStateNames: ["Lagos", "Abuja"],
  });
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.equal(ok.email, "chioma@example.ng");
    assert.equal(ok.role, "team_leader");
    assert.equal(ok.state, "Lagos");
    assert.equal(ok.lga, "Ikeja");
  }

  const missingLocation = staffInviteInputAllowed({
    email: "a@b.c",
    fullName: "Someone",
    role: "team_member",
  });
  assert.equal(missingLocation.ok, false);

  const badState = staffInviteInputAllowed({
    email: "a@b.c",
    fullName: "Someone",
    role: "team_member",
    state: "Narnia",
    lga: "Ikeja",
    knownStateNames: ["Lagos"],
  });
  assert.equal(badState.ok, false);

  const badRole = staffInviteInputAllowed({
    email: "a@b.c",
    fullName: "Someone",
    role: "admin",
    state: "Lagos",
    lga: "Ikeja",
  });
  assert.equal(badRole.ok, false);
});

test("existing admin cannot be invited via staff path", () => {
  const result = staffInviteExistingDecision({
    existingRole: "admin",
    requestedRole: "supervisor",
  });
  assert.equal(result.action, "refuse_admin");
});

test("same role is a noop conflict; different role promotes", () => {
  assert.equal(
    staffInviteExistingDecision({
      existingRole: "team_member",
      requestedRole: "team_member",
    }).action,
    "noop",
  );
  assert.equal(
    staffInviteExistingDecision({
      existingRole: "user",
      requestedRole: "team_leader",
    }).action,
    "promote",
  );
  assert.equal(
    staffInviteExistingDecision({
      existingRole: "reviewer",
      requestedRole: "supervisor",
    }).action,
    "promote",
  );
});

test("staffInviteHomePath matches Connect shells", () => {
  assert.equal(staffInviteHomePath("reviewer"), "/admin/validation");
  assert.equal(staffInviteHomePath("supervisor"), "/admin/validation/field");
  assert.equal(staffInviteHomePath("team_leader"), "/admin/validation/field");
  assert.equal(staffInviteHomePath("team_member"), "/admin/validation/my-visits");
});

test("localStaffSetupLink only returns the link when Resend is skipped locally", () => {
  const link = "http://127.0.0.1:54321/auth/v1/verify?token=local-test";
  const previous = process.env.RESEND_API_KEY;
  const previousVercel = process.env.VERCEL_ENV;
  try {
    delete process.env.RESEND_API_KEY;
    delete process.env.VERCEL_ENV;
    assert.equal(resolveResendAction(), "skip-local");
    assert.equal(localStaffSetupLink(link), link);

    process.env.RESEND_API_KEY = "re_test_key";
    assert.equal(resolveResendAction(), "send");
    assert.equal(localStaffSetupLink(link), undefined);
  } finally {
    if (previous === undefined) delete process.env.RESEND_API_KEY;
    else process.env.RESEND_API_KEY = previous;
    if (previousVercel === undefined) delete process.env.VERCEL_ENV;
    else process.env.VERCEL_ENV = previousVercel;
  }
});

test("staffInviteRedirectTo lands on setup-password", () => {
  assert.equal(
    staffInviteRedirectTo({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }),
    "http://127.0.0.1:3000/setup-password",
  );
  assert.equal(
    staffInviteRedirectTo({ NEXT_PUBLIC_APP_URL: "https://realest.ng/" }),
    "https://realest.ng/setup-password",
  );
});

