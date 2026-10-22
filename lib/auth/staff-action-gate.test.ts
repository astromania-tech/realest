/**
 * [A-01] Trust-gate APIs must not treat every Connect role as desk admin.
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  canAssignFieldVisit,
  canMakeDeskDecision,
  vettingActionAllowed,
} from "./staff-action-gate.ts";

test("[A-01] desk decisions are admin or reviewer only", () => {
  assert.equal(canMakeDeskDecision("admin"), true);
  assert.equal(canMakeDeskDecision("reviewer"), true);
  assert.equal(canMakeDeskDecision("supervisor"), false);
  assert.equal(canMakeDeskDecision("team_leader"), false);
  assert.equal(canMakeDeskDecision("team_member"), false);
});

test("[A-01] field assign is admin, supervisor, or reviewer", () => {
  assert.equal(canAssignFieldVisit("admin"), true);
  assert.equal(canAssignFieldVisit("supervisor"), true);
  assert.equal(canAssignFieldVisit("reviewer"), true);
  assert.equal(canAssignFieldVisit("team_member"), false);
  assert.equal(canAssignFieldVisit("team_leader"), false);
});

test("[A-01] team_member cannot approve or reject a listing", () => {
  assert.equal(vettingActionAllowed("team_member", "approve"), false);
  assert.equal(vettingActionAllowed("team_member", "reject"), false);
  assert.equal(vettingActionAllowed("team_member", "assign"), false);
  assert.equal(vettingActionAllowed("team_member", "check_in"), true);
  assert.equal(vettingActionAllowed("reviewer", "approve"), true);
  assert.equal(vettingActionAllowed("supervisor", "assign"), true);
});

test("[A-01] ML and vetting routes enforce staff-action gates", () => {
  const ml = readFileSync("app/api/admin/validation/ml/[id]/route.ts", "utf8");
  const vetting = readFileSync(
    "app/api/admin/validation/vetting/[id]/route.ts",
    "utf8",
  );
  assert.match(ml, /canMakeDeskDecision/);
  assert.match(vetting, /vettingActionAllowed/);
});
