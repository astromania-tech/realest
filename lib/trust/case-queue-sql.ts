import { Prisma } from "@/lib/prisma/client";
import type { CaseQueueFilter } from "@/lib/trust/case-view";

/** Statuses included in the admin case queue (matches prior load-case-view query). */
export const CASE_QUEUE_BASE_STATUSES = [
  "pending_ml_validation",
  "pending_vetting",
  "pending_duplicate_review",
  "pending_correction",
  "live",
  "rejected",
] as const;

export type CaseQueueFilterParts = {
  listingStatuses: readonly string[];
  caseStates: readonly string[];
};

/**
 * Structured filter parts that mirror `matchesCaseQueueFilter`.
 * Used to build SQL and to prove parity in gate tests.
 */
export function caseQueueFilterParts(
  filter: CaseQueueFilter,
): CaseQueueFilterParts | "all" {
  switch (filter) {
    case "all":
      return "all";
    case "review":
      return {
        listingStatuses: ["pending_ml_validation"],
        caseStates: ["human_review", "desk_review", "reconciliation"],
      };
    case "field":
      return {
        listingStatuses: ["pending_vetting"],
        caseStates: ["field_assigned", "field_in_progress", "field_complete"],
      };
    case "verified":
      return {
        listingStatuses: ["live"],
        caseStates: ["verified"],
      };
    case "duplicates":
      return {
        listingStatuses: ["pending_duplicate_review"],
        caseStates: [],
      };
  }
}

/** SQL AND fragment for a queue filter. Empty for "all". */
export function caseQueueFilterSql(filter: CaseQueueFilter): Prisma.Sql {
  const parts = caseQueueFilterParts(filter);
  if (parts === "all") return Prisma.empty;

  const statusList = parts.listingStatuses;
  const stateList = parts.caseStates;

  if (statusList.length > 0 && stateList.length > 0) {
    return Prisma.sql`and (
      p.status in (${Prisma.join(statusList.map((s) => Prisma.sql`${s}`))})
      or k.state in (${Prisma.join(stateList.map((s) => Prisma.sql`${s}`))})
    )`;
  }
  if (statusList.length > 0) {
    return Prisma.sql`and p.status in (${Prisma.join(
      statusList.map((s) => Prisma.sql`${s}`),
    )})`;
  }
  if (stateList.length > 0) {
    return Prisma.sql`and k.state in (${Prisma.join(
      stateList.map((s) => Prisma.sql`${s}`),
    )})`;
  }
  return Prisma.empty;
}

/** Case-insensitive search across id/title/address/city/state. Empty when blank. */
export function caseQueueSearchSql(search: string): Prisma.Sql {
  const needle = search.trim();
  if (!needle) return Prisma.empty;
  const pattern = `%${needle}%`;
  return Prisma.sql`and (
    p.id::text ilike ${pattern}
    or p.title ilike ${pattern}
    or p.address ilike ${pattern}
    or p.city ilike ${pattern}
    or coalesce(p.state, '') ilike ${pattern}
  )`;
}

export function caseQueueBaseStatusSql(): Prisma.Sql {
  return Prisma.sql`p.status in (${Prisma.join(
    CASE_QUEUE_BASE_STATUSES.map((s) => Prisma.sql`${s}`),
  )})`;
}
