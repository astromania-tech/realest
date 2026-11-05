/**
 * Invite setup is one-shot: pending → completed blocks reuse.
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  inviteSetupBlocked,
  inviteSetupCompletedPatch,
  inviteSetupPendingPatch,
  readInviteSetupStatus,
} from "./invite-setup.ts";

test("readInviteSetupStatus defaults to none", () => {
  assert.equal(readInviteSetupStatus(null), "none");
  assert.equal(readInviteSetupStatus({}), "none");
  assert.equal(readInviteSetupStatus({ invite_setup: { status: "pending" } }), "pending");
  assert.equal(readInviteSetupStatus({ invite_setup: { status: "completed" } }), "completed");
});

test("inviteSetupBlocked only for completed", () => {
  assert.equal(inviteSetupBlocked("none"), false);
  assert.equal(inviteSetupBlocked("pending"), false);
  assert.equal(inviteSetupBlocked("completed"), true);
});

test("pending and completed patches carry status timestamps", () => {
  const pending = inviteSetupPendingPatch(new Date("2026-10-22T00:00:00.000Z"));
  assert.equal(pending.invite_setup.status, "pending");
  assert.equal(pending.invite_setup.issued_at, "2026-10-22T00:00:00.000Z");

  const done = inviteSetupCompletedPatch(new Date("2026-10-22T01:00:00.000Z"));
  assert.equal(done.invite_setup.status, "completed");
  assert.equal(done.invite_setup.completed_at, "2026-10-22T01:00:00.000Z");
});
