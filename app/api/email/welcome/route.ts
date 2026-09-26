/**
 * POST /api/email/welcome
 *
 * Sends a welcome email after onboarding completion.
 * Requires an authenticated session — the email and firstName are derived
 * from the authenticated user's profile to prevent spoofing.
 */
import { getAuthUser } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { sendWelcomeEmail } from "@/lib/emailService";

const schema = z.object({
  userType: z.enum(["agent", "owner", "user"]),
  dashboardUrl: z.string().url("Invalid dashboard URL"),
});

export async function POST(request: NextRequest) {
  try {
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 },
      );
    }

    const body = await request.json();
    const { userType, dashboardUrl } = schema.parse(body);

    const profile = await prisma.profiles.findUnique({
      where: { id: user.id },
      select: { full_name: true, email: true },
    });

    const firstName = profile?.full_name?.split(" ")[0] || "there";
    const email = profile?.email || user.email || "";

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Could not determine user email" },
        { status: 400 },
      );
    }

    const result = await sendWelcomeEmail({
      email,
      firstName,
      userType,
      dashboardUrl,
    });

    if (!result.success) {
      console.error("[WelcomeEmail] Send failed:", result.error);
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 502 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: error.issues[0]?.message ?? "Invalid request" },
        { status: 400 },
      );
    }
    console.error("[WelcomeEmail] Unexpected error:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
