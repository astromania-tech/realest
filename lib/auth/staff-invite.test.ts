/**
 * Staff invite gates: invitable roles, create vs promote, refuse admin, state/LGA required.
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  isInvitableStaffRole,
  staffInviteExistingDecision,
  staffInviteHomePath,
  staffInviteInputAllowed,
} from "./staff-invite.ts";

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
