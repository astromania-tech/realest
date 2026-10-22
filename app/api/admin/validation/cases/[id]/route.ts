import { NextRequest, NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import { authDeniedResponse } from "@/lib/auth/staff-api";
import { loadCaseDetail } from "@/lib/trust/load-case-view";

type RouteParams = { params: Promise<{ id: string }> };

export async function GET(_request: NextRequest, { params }: RouteParams) {
  const staff = await requireStaff();
  const denied = authDeniedResponse(staff);
  if (denied) return denied;

  const { id } = await params;
  const detail = await loadCaseDetail(id);
  if (!detail) {
    return NextResponse.json({ error: "Case not found" }, { status: 404 });
  }
  return NextResponse.json({ success: true, data: detail });
}
