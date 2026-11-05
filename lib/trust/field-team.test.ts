/**
 * Connect field-team gates: who assigns leaders, who confirms, who may check in.
 */
/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assignTeamLeaderAllowed,
  canAssignTeamLeader,
  canConfirmFieldTeam,
  confirmFieldTeamAllowed,
} from "./field-team.ts";

test("supervisor and reviewer can assign a team leader; members cannot", () => {
  assert.equal(canAssignTeamLeader("supervisor"), true);
  assert.equal(canAssignTeamLeader("reviewer"), true);
  assert.equal(canAssignTeamLeader("admin"), true);
  assert.equal(canAssignTeamLeader("team_leader"), false);
  assert.equal(canAssignTeamLeader("team_member"), false);
});

test("team leader, supervisor, and admin can confirm a team", () => {
  assert.equal(canConfirmFieldTeam("team_leader"), true);
  assert.equal(canConfirmFieldTeam("supervisor"), true);
  assert.equal(canConfirmFieldTeam("admin"), true);
  assert.equal(canConfirmFieldTeam("team_member"), false);
  assert.equal(canConfirmFieldTeam("reviewer"), false);
});

test("assignTeamLeaderAllowed rejects past days and inactive leaders", () => {
  const ok = assignTeamLeaderAllowed({
    actorRole: "supervisor",
    leaderRole: "team_leader",
    leaderActive: true,
    visitDay: "2030-01-15",
    today: "2030-01-10",
  });
  assert.equal(ok.ok, true);

  const past = assignTeamLeaderAllowed({
    actorRole: "supervisor",
    leaderRole: "team_leader",
    leaderActive: true,
    visitDay: "2020-01-01",
    today: "2030-01-10",
  });
  assert.equal(past.ok, false);
  if (!past.ok) assert.equal(past.status, 400);

  const memberAsLeader = assignTeamLeaderAllowed({
    actorRole: "supervisor",
    leaderRole: "team_member",
    leaderActive: true,
    visitDay: "2030-01-15",
    today: "2030-01-10",
  });
  assert.equal(memberAsLeader.ok, false);
});

test("confirmFieldTeamAllowed requires check-in officer on the team and blocks other leaders", () => {
  const leaderId = "11111111-1111-1111-1111-111111111111";
  const memberId = "22222222-2222-2222-2222-222222222222";
  const otherLeader = "33333333-3333-3333-3333-333333333333";

  const ok = confirmFieldTeamAllowed({
    actorRole: "team_leader",
    actorId: leaderId,
    teamLeaderId: leaderId,
    memberIds: [memberId],
    checkInOfficerId: memberId,
    memberRoles: {
      [leaderId]: { role: "team_leader", is_active: true },
      [memberId]: { role: "team_member", is_active: true },
    },
  });
  assert.equal(ok.ok, true);
  if (ok.ok) {
    assert.ok(ok.memberIds.includes(leaderId));
    assert.ok(ok.memberIds.includes(memberId));
  }

  const wrongLeader = confirmFieldTeamAllowed({
    actorRole: "team_leader",
    actorId: otherLeader,
    teamLeaderId: leaderId,
    memberIds: [memberId],
    checkInOfficerId: memberId,
    memberRoles: {
      [leaderId]: { role: "team_leader", is_active: true },
      [memberId]: { role: "team_member", is_active: true },
      [otherLeader]: { role: "team_leader", is_active: true },
    },
  });
  assert.equal(wrongLeader.ok, false);
  if (!wrongLeader.ok) assert.equal(wrongLeader.status, 403);

  const supervisorOk = confirmFieldTeamAllowed({
    actorRole: "supervisor",
    actorId: "44444444-4444-4444-4444-444444444444",
    teamLeaderId: leaderId,
    memberIds: [],
    checkInOfficerId: leaderId,
    memberRoles: {
      [leaderId]: { role: "team_leader", is_active: true },
    },
  });
  assert.equal(supervisorOk.ok, true);
});

test("assignTeamLeaderAllowed hard-blocks wrong-state leaders", () => {
  const blocked = assignTeamLeaderAllowed({
    actorRole: "supervisor",
    leaderRole: "team_leader",
    leaderActive: true,
    visitDay: "2030-01-15",
    today: "2030-01-10",
    propertyState: "Lagos",
    leaderState: "Abuja",
  });
  assert.equal(blocked.ok, false);

  const adminOverride = assignTeamLeaderAllowed({
    actorRole: "admin",
    leaderRole: "team_leader",
    leaderActive: true,
    visitDay: "2030-01-15",
    today: "2030-01-10",
    propertyState: "Lagos",
    leaderState: "Abuja",
    forceGeoOverride: true,
  });
  assert.equal(adminOverride.ok, true);
});

test("confirmFieldTeamAllowed hard-blocks wrong-state members", () => {
  const leaderId = "11111111-1111-1111-1111-111111111111";
  const memberId = "22222222-2222-2222-2222-222222222222";

  const blocked = confirmFieldTeamAllowed({
    actorRole: "team_leader",
    actorId: leaderId,
    teamLeaderId: leaderId,
    memberIds: [memberId],
    checkInOfficerId: memberId,
    propertyState: "Lagos",
    memberRoles: {
      [leaderId]: { role: "team_leader", is_active: true, state: "Lagos" },
      [memberId]: { role: "team_member", is_active: true, state: "Abuja" },
    },
  });
  assert.equal(blocked.ok, false);
});

