import { NextResponse } from "next/server";
import type { RequireStaffResult } from "@/lib/auth/require-staff";
import type { RequireAdminResult } from "@/lib/auth/require-admin";

export function authDeniedResponse(
  result: RequireStaffResult | RequireAdminResult,
): NextResponse | null {
  if (result.ok) return null;
  return NextResponse.json({ error: result.error }, { status: result.status });
}
