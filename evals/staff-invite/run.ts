/**
 * Deterministic eval: staff invite stays admin-only, role-scoped, and location-bound.
 *
 *   npx tsx evals/staff-invite/run.ts
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  isInvitableStaffRole,
  staffInviteExistingDecision,
  staffInviteInputAllowed,
} from "../../lib/auth/staff-invite.ts";
import { isAdminOnlyPath } from "../../lib/auth/roles.ts";

const cases: Array<{ id: string; run: () => boolean }> = [
  {
    id: "admin-not-invitable-here",
    run: () => !isInvitableStaffRole("admin") && isInvitableStaffRole("team_member"),
  },
  {
    id: "staff-page-is-admin-only",
    run: () => isAdminOnlyPath("/admin/staff") && isAdminOnlyPath("/admin/staff/x"),
  },
  {
    id: "refuse-promoting-super-admin",
    run: () =>
      staffInviteExistingDecision({
        existingRole: "admin",
        requestedRole: "reviewer",
      }).action === "refuse_admin",
  },
  {
    id: "marketplace-user-can-be-promoted",
    run: () =>
      staffInviteExistingDecision({
        existingRole: "owner",
        requestedRole: "supervisor",
      }).action === "promote",
  },
  {
    id: "input-rejects-admin-role",
    run: () =>
      staffInviteInputAllowed({
        email: "x@y.z",
        fullName: "X Y",
        role: "admin",
        state: "Lagos",
        lga: "Ikeja",
      }).ok === false,
  },
  {
    id: "input-requires-state-and-lga",
    run: () => {
      const missing = staffInviteInputAllowed({
        email: "x@y.z",
        fullName: "X Y",
        role: "team_member",
      });
      const ok = staffInviteInputAllowed({
        email: "x@y.z",
        fullName: "X Y",
        role: "team_member",
        state: "Lagos",
        lga: "Ikeja",
        knownStateNames: ["Lagos"],
      });
      return missing.ok === false && ok.ok === true;
    },
  },
  {
    id: "api-uses-requireAdmin-and-compensate",
    run: () => {
      const route = readFileSync("app/api/admin/staff-invites/route.ts", "utf8");
      const invite = readFileSync("lib/auth/invite-staff.ts", "utf8");
      return (
        route.includes("requireAdmin") &&
        route.includes("state") &&
        route.includes("lga") &&
        invite.includes("createWithAuthDbCompensate") &&
        invite.includes("sendStaffInvitationEmail") &&
        invite.includes('action: "invite_staff"') &&
        invite.includes("ops_state") &&
        invite.includes("ops_lga") &&
        invite.includes("localStaffSetupLink") &&
        route.includes("setup_link")
      );
    },
  },
  {
    id: "local-setup-link-only-when-resend-skipped",
    run: () => {
      const source = readFileSync("lib/auth/staff-invite.ts", "utf8");
      return (
        source.includes("localStaffSetupLink") &&
        source.includes('resolveResendAction() !== "skip-local"')
      );
    },
  },
  {
    id: "invite-link-is-one-shot-after-password",
    run: () => {
      const setup = readFileSync("lib/auth/invite-setup.ts", "utf8");
      const page = readFileSync("app/(auth)/setup-password/SetupPasswordClient.tsx", "utf8");
      const invite = readFileSync("lib/auth/invite-staff.ts", "utf8");
      return (
        setup.includes("inviteSetupBlocked") &&
        setup.includes('"completed"') &&
        page.includes("inviteSetupCompletedPatch") &&
        page.includes("inviteSetupBlocked") &&
        invite.includes("markInviteSetupPending")
      );
    },
  },


  {
    id: "ops-location-is-column-backed",
    run: () => {
      const schema = readFileSync("prisma/schema.prisma", "utf8");
      const migration = readFileSync(
        "supabase/migrations/20261022050000_users_ops_location.sql",
        "utf8",
      );
      const ops = readFileSync("lib/trust/officer-ops.ts", "utf8");
      return (
        schema.includes("ops_state") &&
        schema.includes("ops_lga") &&
        migration.includes("ADD COLUMN IF NOT EXISTS ops_state") &&
        migration.includes("metadata->'field_ops'") &&
        ops.includes("ops_state") &&
        !ops.includes("field_ops")
      );
    },
  },
  {
    id: "invite-ui-collects-state-lga",
    run: () => {
      const form = readFileSync("components/admin/StaffInviteForm.tsx", "utf8");
      const modal = readFileSync("components/realest/validation/StaffInviteModal.tsx", "utf8");
      const fields = readFileSync("components/admin/StaffLocationFields.tsx", "utf8");
      return (
        form.includes("StaffLocationFields") &&
        modal.includes("StaffLocationFields") &&
        fields.includes("Operating state") &&
        fields.includes("Operating LGA")
      );
    },
  },

  {
    id: "email-template-is-role-aware",
    run: () => {
      const source = readFileSync("emails/templates/platform/StaffInvitationEmail.tsx", "utf8");
      return source.includes("STAFF_ROLE_CAPABILITIES") && source.includes("Set Your Password");
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

assert.equal(failed, 0, `${failed} staff-invite eval case(s) failed`);
console.log(`staff-invite eval: ${cases.length - failed}/${cases.length} passed`);
