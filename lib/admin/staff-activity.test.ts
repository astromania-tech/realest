import assert from "node:assert/strict";
import test from "node:test";
import { activityHref, activityLabel, activityScope } from "./staff-activity.ts";

test("activity scope is everyone unless the admin asks for their own", () => {
  assert.equal(activityScope(undefined), "all");
  assert.equal(activityScope("all"), "all");
  assert.equal(activityScope("mine"), "mine");
});

test("activity rows name the action and link the case or user", () => {
  assert.equal(
    activityLabel("physical_vetting", { action: "check_in", open_issue: "secret note" }).title,
    "Checked in at the pin",
  );
  assert.equal(activityLabel("physical_vetting", { action: "check_in" }).detail, null);
  assert.equal(
    activityLabel("assign_field_team_leader", { visit_day: "2026-11-02", brief: "gate code" }).detail,
    "Visit day 2026-11-02",
  );
  assert.equal(activityLabel("user_moderation", { action: "ban", reason: "fraud" }).title, "Banned a user");
  assert.equal(activityLabel("invite_staff", { role: "team_member" }).detail, "team member");
  assert.equal(
    activityHref("confirm_field_team", "11111111-1111-1111-1111-111111111111"),
    "/admin/validation/cases/11111111-1111-1111-1111-111111111111",
  );
  assert.equal(
    activityHref("user_moderation", "22222222-2222-2222-2222-222222222222"),
    "/admin/users/22222222-2222-2222-2222-222222222222",
  );
  assert.equal(activityHref("invite_staff", null), null);
});
