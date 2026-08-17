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
import { createServerClient } from "@supabase/ssr";
import { sendWelcomeEmail } from "@/lib/emailService";

const schema = z.object({
  userType: z.enum(["agent", "owner", "user"]),
  dashboardUrl: z.string().url("Invalid dashboard URL"),
});

export async function POST(request: NextRequest) {
  try {
    // Authenticate the caller
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: () => {}, // read-only here
        },
      },
    );

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

    // Parse + validate body
    const body = await request.json();
    const { userType, dashboardUrl } = schema.parse(body);

    // Fetch profile for personalisation (service role not needed — user fetches own profile)
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

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
      // Non-fatal — onboarding is complete regardless of email delivery
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 502 },
      );
    }

    console.log("[WelcomeEmail] Sent to", email, "— id:", result.messageId);
    return NextResponse.json({ success: true });
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0].message },
        { status: 400 },
      );
    }
    console.error("[WelcomeEmail] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
