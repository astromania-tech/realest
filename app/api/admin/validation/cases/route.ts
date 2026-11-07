import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import { authDeniedResponse } from "@/lib/auth/staff-api";
import { listCaseQueue } from "@/lib/trust/load-case-view";
import { caseQueueScope } from "@/lib/trust/case-access";
import type { CaseQueueFilter } from "@/lib/trust/case-view";

const FILTERS = new Set<CaseQueueFilter>(["all", "review", "field", "verified", "duplicates"]);

export async function GET(request: NextRequest) {
  const staff = await requireStaff();
  const denied = authDeniedResponse(staff);
  if (denied) return denied;
  if (!staff.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(request.url);
  const rawFilter = (searchParams.get("filter") ?? "all") as CaseQueueFilter;
  const filter = FILTERS.has(rawFilter) ? rawFilter : "all";
  const search = searchParams.get("search") ?? "";
  const scope = caseQueueScope(staff.role);
  if (scope === "none") {
    return NextResponse.json({
      success: true,
      data: { items: [], metrics: { total: 0, review: 0, field: 0, verified: 0, duplicates: 0 }, total: 0, page: 1 },
    });
  }

  const data = await listCaseQueue({
    filter,
    search,
    limit: 50,
    leaderId: scope === "led" ? staff.userId : undefined,
  });
  return NextResponse.json({ success: true, data });
}
