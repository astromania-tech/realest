import assert from "node:assert/strict";
import test from "node:test";
import {
  accountRoleLabel,
  usersListHref,
  usersListWhere,
  usersRoleFilter,
  usersSearchTerm,
} from "./users-list.ts";

test("user search keeps a short name or email and drops an unknown role", () => {
  assert.equal(usersSearchTerm("  Ada Okonkwo  "), "Ada Okonkwo");
  assert.equal(usersSearchTerm("x".repeat(90)).length, 80);
  assert.equal(usersRoleFilter("reviewer"), "reviewer");
  assert.equal(usersRoleFilter("superadmin"), "");
  assert.equal(accountRoleLabel("team_leader"), "Team leader");
});

test("the user list link keeps the search and returns to page one when the filter changes", () => {
  assert.equal(usersListHref(1, "", ""), "/admin/users");
  assert.equal(usersListHref(2, "ada", "reviewer"), "/admin/users?q=ada&role=reviewer&page=2");
  const where = usersListWhere("Ada", "reviewer");
  assert.equal(where?.role, "reviewer");
  assert.equal(where?.OR?.length, 2);
  assert.equal(usersListWhere("", ""), undefined);
});
