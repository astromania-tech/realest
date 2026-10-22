import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  isStaffPermissionDenied,
  staffPermissionDeniedMessage,
  STAFF_PERMISSION_DENIED_MESSAGE,
} from "./staff-permission-ui.ts";

test("403 is treated as a permission denial for staff UI", () => {
  assert.equal(isStaffPermissionDenied(403), true);
  assert.equal(isStaffPermissionDenied(401), false);
  assert.equal(isStaffPermissionDenied(409), false);
});

test("permission modal copy prefers the API error when present", () => {
  assert.equal(
    staffPermissionDeniedMessage({ error: "Desk reviewers or admins make this decision." }),
    "Desk reviewers or admins make this decision.",
  );
  assert.equal(staffPermissionDeniedMessage({}), STAFF_PERMISSION_DENIED_MESSAGE);
});

test("desk action UIs open StaffPermissionModal on 403", () => {
  for (const file of [
    "components/realest/validation/TrustReviewActions.tsx",
    "components/realest/validation/VettingDecisionActions.tsx",
    "components/realest/validation/DuplicateResolutionActions.tsx",
  ]) {
    const source = readFileSync(file, "utf8");
    assert.match(source, /StaffPermissionModal/);
    assert.match(source, /isStaffPermissionDenied/);
  }
});
