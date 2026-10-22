/**
 * Deterministic eval: Connect field teams stay case-scoped and quiet.
 *
 *   npx tsx evals/field-teams/run.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  assignTeamLeaderAllowed,
  canAssignTeamLeader,
  canConfirmFieldTeam,
  confirmFieldTeamAllowed,
} from "../../lib/trust/field-team.ts";
import { isStaffAllowedPath, staffHomePath } from "../../lib/auth/roles.ts";

const leaderId = "11111111-1111-1111-1111-111111111111";
const memberId = "22222222-2222-2222-2222-222222222222";

const cases: Array<{ id: string; run: () => boolean }> = [
  {
    id: "only-desk-and-ops-assign-leaders",
    run: () =>
      canAssignTeamLeader("supervisor") &&
      canAssignTeamLeader("reviewer") &&
      !canAssignTeamLeader("team_member"),
  },
  {
    id: "leader-builds-team-member-cannot",
    run: () => canConfirmFieldTeam("team_leader") && !canConfirmFieldTeam("team_member"),
  },
  {
    id: "past-visit-day-blocked",
    run: () =>
      assignTeamLeaderAllowed({
        actorRole: "supervisor",
        leaderRole: "team_leader",
        leaderActive: true,
        visitDay: "2020-01-01",
        today: "2026-10-22",
      }).ok === false,
  },
  {
    id: "check-in-officer-must-be-on-team",
    run: () => {
      const result = confirmFieldTeamAllowed({
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
      return result.ok === true;
    },
  },
  {
    id: "wrong-leader-cannot-confirm",
    run: () =>
      confirmFieldTeamAllowed({
        actorRole: "team_leader",
        actorId: memberId,
        teamLeaderId: leaderId,
        memberIds: [memberId],
        checkInOfficerId: memberId,
        memberRoles: {
          [leaderId]: { role: "team_leader", is_active: true },
          [memberId]: { role: "team_member", is_active: true },
        },
      }).ok === false,
  },
  {
    id: "team-member-home-is-my-visits",
    run: () => staffHomePath("team_member") === "/admin/validation/my-visits",
  },
  {
    id: "team-member-blocked-from-users",
    run: () =>
      !isStaffAllowedPath("team_member", "/admin/users") &&
      isStaffAllowedPath("team_member", "/admin/validation/my-visits"),
  },
  {
    id: "confirm-syncs-vetting-officer",
    run: () => {
      const source = readFileSync("lib/trust/field-team-store.ts", "utf8");
      return (
        source.includes("vetting_officer_id = ${input.checkInOfficerId}") &&
        source.includes("notifyStaffMany") &&
        source.includes("field_check_in_officer")
      );
    },
  },
  {
    id: "notifications-stay-case-scoped",
    run: () => {
      const source = readFileSync("lib/trust/field-team-store.ts", "utf8");
      return (
        source.includes("notifyStaff({") &&
        source.includes("field_team_leader") &&
        !source.includes("notifyAllStaff")
      );
    },
  },
  {
    id: "wrong-state-leader-blocked",
    run: () =>
      assignTeamLeaderAllowed({
        actorRole: "supervisor",
        leaderRole: "team_leader",
        leaderActive: true,
        visitDay: "2030-01-15",
        today: "2026-10-22",
        propertyState: "Lagos",
        leaderState: "Abuja",
      }).ok === false,
  },
  {
    id: "ranking-and-geo-wired",
    run: () => {
      const store = readFileSync("lib/trust/field-team-store.ts", "utf8");
      const panel = readFileSync("components/realest/validation/FieldTeamPanel.tsx", "utf8");
      const ops = readFileSync("lib/trust/officer-ops.ts", "utf8");
      return (
        store.includes("listRankedStaffForProperty") &&
        store.includes("rankOfficersForProperty") &&
        store.includes("pickAutoRecommendedOfficerIds") &&
        panel.includes("recommendedLeaderIds") &&
        panel.includes("force_geo_override") &&
        ops.includes("officerGeoAllowed") &&
        ops.includes("MAX_OPEN_VISITS_SOFT")
      );
    },
  },
];


let failed = 0;
for (const item of cases) {
  const passed = item.run();
  if (!passed) {
    failed += 1;
    console.error(`FAIL ${item.id}`);
  } else {
    console.log(`PASS ${item.id}`);
  }
}

assert.equal(failed, 0, `${failed} field-team eval case(s) failed`);
console.log(`field-teams eval: ${cases.length - failed}/${cases.length} passed`);
