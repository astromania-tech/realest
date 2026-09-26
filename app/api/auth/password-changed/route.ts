/**
 * POST /api/auth/password-changed
 *
 * Sends a branded security notification email confirming that the account
 * password was successfully changed.
 */

import { getAuthUser } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendPasswordChangedEmail } from "@/lib/emailService";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Send password changed notification",
  description: "Send a confirmation email after the user successfully changes their password.",
  tags: ["Auth"],
  security: [{ bearerAuth: [] }],
  responses: {
    "200": {
      description: "Password change notification processed",
      content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } },
    },
    "401": { description: "Not authenticated" },
    "500": { description: "Internal server error" },
  },
}

export async function POST() {
  try {
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    const profile = await prisma.users.findUnique({
      where: { id: user.id },
      select: { full_name: true },
    });

    const firstName = profile?.full_name?.split(" ")[0] || "there";
    const email = user.email!;

    const result = await sendPasswordChangedEmail({ email, firstName });

    if (!result.success) {
      console.error("[password-changed] Email failed:", result.error);
      return NextResponse.json({ success: false, error: result.error });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[password-changed] Unexpected error:", error);
    return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
  }
}
