import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  canReadFieldTeam,
  caseDetailAccess,
  caseQueueScope,
  fieldOpsQueueScope,
  redactCaseDetailForVisit,
} from "@/lib/trust/case-access";
import type { CaseDetailView } from "@/lib/trust/case-view";

const team = {
  teamLeaderId: "leader",
  memberIds: ["leader", "member"],
  checkInOfficerId: "member",
};

test("desk staff read every case; leaders read their teams; members do not get the queue", () => {
  assert.equal(caseQueueScope("admin"), "all");
  assert.equal(caseQueueScope("reviewer"), "all");
  assert.equal(caseQueueScope("supervisor"), "all");
  assert.equal(caseQueueScope("team_leader"), "led");
  assert.equal(caseQueueScope("team_member"), "none");
  assert.equal(fieldOpsQueueScope("team_leader"), "led");
  assert.equal(fieldOpsQueueScope("team_member"), "none");
});

test("case detail follows desk, assigned leader, and visit membership", () => {
  assert.equal(
    caseDetailAccess({ role: "reviewer", userId: "r", ...team }),
    "full",
  );
  assert.equal(
    caseDetailAccess({ role: "team_leader", userId: "leader", ...team }),
    "full",
  );
  assert.equal(
    caseDetailAccess({ role: "team_leader", userId: "other", ...team }),
    "none",
  );
  assert.equal(
    caseDetailAccess({ role: "team_member", userId: "member", ...team }),
    "visit",
  );
  assert.equal(
    caseDetailAccess({ role: "team_member", userId: "stranger", ...team }),
    "none",
  );
});

test("an unassigned property roster is desk-only", () => {
  assert.equal(
    canReadFieldTeam({
      role: "supervisor",
      userId: "s",
      teamLeaderId: null,
      memberIds: [],
      checkInOfficerId: null,
    }),
    true,
  );
  assert.equal(
    canReadFieldTeam({
      role: "team_member",
      userId: "member",
      teamLeaderId: null,
      memberIds: [],
      checkInOfficerId: null,
    }),
    false,
  );
  assert.equal(
    canReadFieldTeam({ role: "team_member", userId: "member", ...team }),
    true,
  );
});

test("visit access drops listing documents and the owner name", () => {
  const detail = {
    documents: [{ id: "d", document_type: "title", file_name: "t.pdf", document_url: "https://x" }],
    description: "private",
    ownerName: "Ada",
    findings: [{ id: "f" }],
    audit: [{ id: "a" }],
    media: [{ id: "m" }],
    fieldBrief: "Gate code 12",
  } as unknown as CaseDetailView;
  const visit = redactCaseDetailForVisit(detail);
  assert.deepEqual(visit.documents, []);
  assert.equal(visit.description, null);
  assert.equal(visit.ownerName, null);
  assert.deepEqual(visit.findings, []);
  assert.deepEqual(visit.audit, []);
  assert.equal(visit.media.length, 1);
  assert.equal(visit.fieldBrief, "Gate code 12");
});

test("case pages do not load every staff user, and assign stays closed", () => {
  const page = readFileSync("app/(dashboard)/admin/validation/cases/[id]/page.tsx", "utf8");
  assert.doesNotMatch(page, /findMany/);
  const route = readFileSync("app/api/admin/validation/vetting/[id]/route.ts", "utf8");
  assert.match(route, /Single-officer assignment is closed/);
  const suspend = readFileSync("app/api/admin/users/[id]/suspend/route.ts", "utf8");
  assert.match(suspend, /releaseOpenVisitsForUser/);
  assert.match(suspend, /deleted_at/);
});
