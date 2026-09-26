import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { logAdminAction } from "@/lib/audit";
import {
  nextIsActive,
  shouldUnlistNonLiveProperties,
} from "@/lib/admin/user-moderation";
import { z } from "zod";

const suspensionSchema = z.object({
  action: z.enum(["suspend", "unsuspend", "ban", "unban"]),
  reason: z.string().min(10, "Reason must be at least 10 characters"),
  duration_days: z.number().optional(),
  notes: z.string().optional(),
});

type RouteParams = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const {
      data: { user },
      error: authError,
    } = await getAuthUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const adminRow = await prisma.users.findUnique({
      where: { id: user.id },
      select: { role: true },
    });
    if (!adminRow || adminRow.role !== "admin") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }

    if (id === user.id) {
      return NextResponse.json(
        { error: "Cannot modify your own account" },
        { status: 400 },
      );
    }

    const body = await request.json();
    const validation = suspensionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 },
      );
    }

    const { action, reason, duration_days, notes } = validation.data;

    const targetUserRow = await prisma.users.findUnique({
      where: { id },
      include: { profiles: { select: { full_name: true, email: true } } },
    });

    if (!targetUserRow) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (targetUserRow.role === "admin") {
      console.warn(`Admin ${user.id} is modifying another admin account: ${id}`);
    }

    const isActive = nextIsActive(action, targetUserRow.is_active);
    let suspensionEndDate: string | null = null;
    if (action === "suspend" && duration_days) {
      suspensionEndDate = new Date(
        Date.now() + duration_days * 24 * 60 * 60 * 1000,
      ).toISOString();
    }

    const updatedUser = await prisma.users.update({
      where: { id },
      data: {
        is_active: isActive,
        updated_at: new Date(),
      },
    });

    if (shouldUnlistNonLiveProperties(action)) {
      // properties.owner_id → owners.id; owners.profile_id → users/profiles id
      await prisma.properties.updateMany({
        where: {
          owners: { profile_id: id },
          status: { not: "live" },
        },
        data: {
          status: "unlisted",
          updated_at: new Date(),
        },
      });
    }

    await logAdminAction({
      actor_id: user.id,
      action: "user_moderation",
      target_id: id,
      metadata: {
        action,
        reason,
        duration_days: duration_days ?? null,
        notes: notes ?? null,
        suspension_end_date: suspensionEndDate,
        previous_is_active: targetUserRow.is_active,
        next_is_active: isActive,
        previous_role: targetUserRow.role,
        target_user_email: targetUserRow.profiles?.email ?? null,
      },
    });

    return NextResponse.json({
      success: true,
      user: {
        id: updatedUser.id,
        is_active: updatedUser.is_active,
      },
    });
  } catch (err) {
    console.error("Suspend route error:", err);
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }
}
