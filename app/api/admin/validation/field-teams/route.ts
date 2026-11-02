import { NextResponse } from "next/server";
import { requireStaff } from "@/lib/auth/require-staff";
import { listFieldOpsQueue } from "@/lib/trust/field-team-store";
import { fieldOpsQueueScope } from "@/lib/trust/case-access";

export async function GET() {
  const staff = await requireStaff();
  if (!staff.ok) {
    return NextResponse.json({ error: staff.error }, { status: staff.status });
  }

  const scope = fieldOpsQueueScope(staff.role);
  if (scope === "none") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const items = await listFieldOpsQueue({
    leaderId: scope === "led" ? staff.userId : undefined,
  });
  return NextResponse.json({ items });
}
