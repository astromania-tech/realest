import { NextRequest, NextResponse } from "next/server";
import { getAuthUser } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { isPasswordValid } from "@/lib/auth/password-rules";
import {
  completeInviteSetupAllowed,
  inviteSetupCompletedMetadata,
} from "@/lib/auth/complete-invite-setup";

/**
 * POST /api/auth/invite-setup-password
 * Session user sets password once for a pending staff invite.
 * Marks invite_setup completed with the service role so the client cannot skip it.
 */
export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
    } = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const password = typeof body?.password === "string" ? body.password : "";

    const gate = completeInviteSetupAllowed({
      password,
      passwordValid: isPasswordValid(password),
      userMetadata: user.user_metadata,
    });
    if (!gate.ok) {
      return NextResponse.json({ error: gate.error }, { status: gate.status });
    }

    const admin = createServiceClient();
    const existingMeta =
      user.user_metadata && typeof user.user_metadata === "object"
        ? (user.user_metadata as Record<string, unknown>)
        : {};

    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password,
      user_metadata: inviteSetupCompletedMetadata(existingMeta),
    });

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to set password." },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[invite-setup-password]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
