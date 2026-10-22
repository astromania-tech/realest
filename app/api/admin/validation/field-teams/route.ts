import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import { listFieldOpsQueue } from "@/lib/trust/field-team-store";

export async function GET() {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  if (
    staff.role !== "admin" &&
    staff.role !== "supervisor" &&
    staff.role !== "reviewer" &&
    staff.role !== "team_leader"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await listFieldOpsQueue();
  return NextResponse.json({ items });
}
