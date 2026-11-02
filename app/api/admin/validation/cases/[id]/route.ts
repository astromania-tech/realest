import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import { authDeniedResponse } from "@/lib/auth/staff-api";
import { loadCaseDetail } from "@/lib/trust/load-case-view";
import { caseDetailAccess, redactCaseDetailForVisit } from "@/lib/trust/case-access";
import { readFieldTeam } from "@/lib/trust/field-team-store";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff();
  const denied = authDeniedResponse(staff);
  if (denied) return denied;
  if (!staff.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;
  const team = await readFieldTeam(id);
  const access = caseDetailAccess({
    role: staff.role,
    userId: staff.userId,
    teamLeaderId: team?.teamLeaderId ?? null,
    memberIds: team?.memberIds ?? [],
    checkInOfficerId: team?.checkInOfficerId ?? null,
  });
  if (access === "none") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const detail = await loadCaseDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  return NextResponse.json({
    success: true,
    data: access === "visit" ? redactCaseDetailForVisit(detail) : detail,
  });
}
