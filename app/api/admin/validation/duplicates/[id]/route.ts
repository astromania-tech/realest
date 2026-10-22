import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireStaff } from "@/lib/auth/require-staff";
import { authDeniedResponse } from "@/lib/auth/staff-api";
import { duplicateRejectAllowed } from "@/lib/trust/matches";

const duplicateResolutionSchema = z.object({
  action: z.literal("reject"),
  admin_notes: z.string().optional(),
});

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const staff = await requireStaff();
    if (!staff.ok) {
      return NextResponse.json({ error: staff.error }, { status: staff.status });
    }

    const { id: propertyId } = await params;
    const parsed = duplicateResolutionSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid request body", details: parsed.error.issues }, { status: 400 });
    }

    const gate = duplicateRejectAllowed(parsed.data.admin_notes);
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: 409 });
    }

    const property = await prisma.properties.findFirst({
      where: { id: propertyId, status: "pending_duplicate_review" },
      select: { id: true },
    });
    if (!property) {
      return NextResponse.json({ error: "Property not found or not in duplicate review" }, { status: 404 });
    }

    const updated = await prisma.properties.update({
      where: { id: propertyId },
      data: {
        status: "rejected",
        verification_status: "rejected",
        updated_at: new Date(),
      },
      select: { id: true, status: true, verification_status: true },
    });

    await prisma.admin_audit_log.create({
      data: {
        actor_id: staff.userId,
        action: "duplicate_resolution_reject",
        target_id: propertyId,
        metadata: {
          previous_status: "pending_duplicate_review",
          new_status: "rejected",
          admin_notes: parsed.data.admin_notes?.trim(),
        },
      },
    });

    return NextResponse.json({ success: true, property: updated });
  } catch (error) {
    console.error("[validation] Duplicate resolution error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
