/// <reference types="node" />
import assert from "node:assert/strict";
import { test } from "node:test";
import { matchesCaseQueueFilter, type CaseQueueFilter } from "./case-view.ts";
import {
  CASE_QUEUE_BASE_STATUSES,
  caseQueueFilterParts,
  caseQueueFilterSql,
  caseQueueSearchSql,
} from "./case-queue-sql.ts";

const FILTERS: CaseQueueFilter[] = ["all", "review", "field", "verified", "duplicates"];

const SAMPLE_ROWS: Array<{ listingStatus: string; caseState: string | null }> = [
  { listingStatus: "pending_ml_validation", caseState: "ai_precheck" },
  { listingStatus: "pending_ml_validation", caseState: "human_review" },
  { listingStatus: "pending_vetting", caseState: "field_assigned" },
  { listingStatus: "pending_vetting", caseState: null },
  { listingStatus: "live", caseState: "verified" },
  { listingStatus: "live", caseState: null },
  { listingStatus: "pending_duplicate_review", caseState: null },
  { listingStatus: "pending_correction", caseState: "desk_review" },
  { listingStatus: "rejected", caseState: null },
  { listingStatus: "pending_vetting", caseState: "field_complete" },
];

function matchesSqlParts(
  row: { listingStatus: string; caseState: string | null },
  filter: CaseQueueFilter,
): boolean {
  const parts = caseQueueFilterParts(filter);
  if (parts === "all") return true;
  if (parts.listingStatuses.includes(row.listingStatus)) return true;
  if (row.caseState && parts.caseStates.includes(row.caseState)) return true;
  return false;
}

test("caseQueueFilterParts stays in lockstep with matchesCaseQueueFilter", () => {
  for (const filter of FILTERS) {
    for (const row of SAMPLE_ROWS) {
      assert.equal(
        matchesSqlParts(row, filter),
        matchesCaseQueueFilter(row, filter),
        `${filter} vs ${row.listingStatus}/${row.caseState}`,
      );
    }
  }
});

test("case queue base statuses cover Connect pipeline", () => {
  assert.ok(CASE_QUEUE_BASE_STATUSES.includes("pending_ml_validation"));
  assert.ok(CASE_QUEUE_BASE_STATUSES.includes("pending_vetting"));
  assert.ok(CASE_QUEUE_BASE_STATUSES.includes("pending_duplicate_review"));
  assert.ok(CASE_QUEUE_BASE_STATUSES.includes("live"));
});

test("filter and search SQL fragments are empty for all / blank search", () => {
  const allSql = caseQueueFilterSql("all");
  assert.equal(allSql.strings.join(""), "");
  const emptySearch = caseQueueSearchSql("   ");
  assert.equal(emptySearch.strings.join(""), "");
});

test("filter SQL embeds the listing statuses for each bucket", () => {
  const review = caseQueueFilterSql("review").strings.join(" ");
  assert.match(review, /p\.status in/);
  assert.match(review, /k\.state in/);

  const duplicates = caseQueueFilterSql("duplicates").strings.join(" ");
  assert.match(duplicates, /p\.status in/);
  assert.doesNotMatch(duplicates, /k\.state in/);

  const search = caseQueueSearchSql("Lekki").strings.join(" ");
  assert.match(search, /ilike/);
  assert.match(search, /p\.title/);
});
