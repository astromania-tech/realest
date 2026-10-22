import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import { authDeniedResponse } from "@/lib/auth/staff-api";
import { listCaseQueue } from "@/lib/trust/load-case-view";
import type { CaseQueueFilter } from "@/lib/trust/case-view";

const FILTERS = new Set<CaseQueueFilter>(["all", "review", "field", "verified", "duplicates"]);

export async function GET(request: NextRequest) {
  const staff = await requireStaff();
  const denied = authDeniedResponse(staff);
  if (denied) return denied;

  const { searchParams } = new URL(request.url);
  const rawFilter = (searchParams.get("filter") ?? "all") as CaseQueueFilter;
  const filter = FILTERS.has(rawFilter) ? rawFilter : "all";
  const search = searchParams.get("search") ?? "";

  const data = await listCaseQueue({ filter, search, limit: 50 });
  return NextResponse.json({ success: true, data });
}
