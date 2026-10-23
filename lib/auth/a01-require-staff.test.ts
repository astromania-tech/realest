/**
 * [A-01] requireStaff: Connect staff roles allowed; marketplace users forbidden.
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { requireStaff } from "./require-staff.ts";
import {
  isAdminOnlyPath,
  isStaffAllowedPath,
  isStaffRole,
  postLoginHomePath,
  staffHomePath,
  staffRoleBadgeLabel,
  staffRolePanelTitle,
} from "./roles.ts";

test("[A-01] requireStaff returns 401 when there is no session user", async () => {
  const result = await requireStaff({
    getAuthUser: async () => ({ data: { user: null } }),
  });
  assert.deepEqual(result, {
    ok: false,
    error: "Unauthorized",
    status: 401,
  });
});

test("[A-01] requireStaff returns 403 for marketplace user role", async () => {
  const result = await requireStaff({
    getAuthUser: async () => ({
      data: { user: { id: "u1", email: "a@b.c" } },
    }),
    findUserRole: async () => ({ role: "user" }),
  });
  assert.equal(result.ok, false);
  if (!result.ok) assert.equal(result.status, 403);
});

test("[A-01] requireStaff returns ok for reviewer", async () => {
  const result = await requireStaff({
    getAuthUser: async () => ({
      data: { user: { id: "u2", email: "rev@x.com" } },
    }),
    findUserRole: async () => ({ role: "reviewer" }),
  });
  assert.deepEqual(result, {
    ok: true,
    userId: "u2",
    email: "rev@x.com",
    role: "reviewer",
  });
});

test("[A-01] requireStaff returns ok for admin", async () => {
  const result = await requireStaff({
    getAuthUser: async () => ({
      data: { user: { id: "u3", email: "admin@x.com" } },
    }),
    findUserRole: async () => ({ role: "admin" }),
  });
  assert.equal(result.ok, true);
  if (result.ok) assert.equal(result.role, "admin");
});

test("[A-01] requireStaff returns ok for supervisor, team_leader, team_member", async () => {
  for (const role of ["supervisor", "team_leader", "team_member"] as const) {
    const result = await requireStaff({
      getAuthUser: async () => ({
        data: { user: { id: `u-${role}`, email: `${role}@x.com` } },
      }),
      findUserRole: async () => ({ role }),
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.role, role);
  }
});

test("[A-01] requireStaff returns 500 when role lookup throws", async () => {
  const result = await requireStaff({
    getAuthUser: async () => ({
      data: { user: { id: "u1", email: "a@b.c" } },
    }),
    findUserRole: async () => {
      throw new Error("db down");
    },
  });
  assert.deepEqual(result, {
    ok: false,
    error: "Internal server error",
    status: 500,
  });
});

test("[A-01] reviewer path rules hide sensitive admin surfaces", () => {
  assert.equal(isStaffRole("reviewer"), true);
  assert.equal(isAdminOnlyPath("/admin/users"), true);
  assert.equal(isAdminOnlyPath("/admin/users/abc"), true);
  assert.equal(isAdminOnlyPath("/admin/emails/campaigns"), true);
  assert.equal(isAdminOnlyPath("/admin/cms/waitlist"), true);
  assert.equal(isAdminOnlyPath("/admin/staff"), true);
  assert.equal(isAdminOnlyPath("/admin/validation"), false);
  assert.equal(isStaffAllowedPath("reviewer", "/admin/validation"), true);
  assert.equal(isStaffAllowedPath("reviewer", "/admin/validation/vetting/x"), true);
  assert.equal(isStaffAllowedPath("reviewer", "/field/visit/x"), true);
  assert.equal(isStaffAllowedPath("reviewer", "/admin"), false);
  assert.equal(isStaffAllowedPath("reviewer", "/admin/users"), false);
  assert.equal(staffHomePath("reviewer"), "/admin/validation");
  assert.equal(staffHomePath("admin"), "/admin");
  assert.equal(staffHomePath("supervisor"), "/admin/validation/field");
  assert.equal(staffHomePath("team_leader"), "/admin/validation/field");
  assert.equal(staffHomePath("team_member"), "/admin/validation/my-visits");
  assert.equal(isStaffAllowedPath("team_member", "/admin/validation/my-visits"), true);
  assert.equal(isStaffAllowedPath("team_member", "/admin/validation/inbox"), true);
  assert.equal(isStaffAllowedPath("team_member", "/admin/validation/field"), false);
  assert.equal(isStaffAllowedPath("supervisor", "/admin/validation/field"), true);
  assert.equal(isStaffAllowedPath("supervisor", "/admin/users"), false);
  assert.equal(isStaffRole("supervisor"), true);
  assert.equal(isStaffRole("team_leader"), true);
  assert.equal(isStaffRole("team_member"), true);
  assert.equal(staffRoleBadgeLabel("admin"), "ADMINISTRATOR");
  assert.equal(staffRoleBadgeLabel("reviewer"), "REVIEWER");
  assert.equal(staffRoleBadgeLabel("supervisor"), "SUPERVISOR");
  assert.equal(staffRoleBadgeLabel("team_leader"), "TEAM LEAD");
  assert.equal(staffRoleBadgeLabel("team_member"), "TEAM MEMBER");
  assert.equal(staffRolePanelTitle("admin"), "Admin Panel");
  assert.equal(staffRolePanelTitle("reviewer"), "Reviewer Panel");
  assert.equal(staffRolePanelTitle("team_leader"), "Team Lead Panel");
  assert.equal(postLoginHomePath("reviewer"), "/admin/validation");
  assert.equal(postLoginHomePath("admin"), "/admin");
  assert.equal(postLoginHomePath("user"), "/profile");
  assert.equal(postLoginHomePath("owner"), "/owner");
});



