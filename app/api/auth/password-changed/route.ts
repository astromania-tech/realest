/**
 * POST /api/auth/password-changed
 *
 * Sends a branded security notification email confirming that the account
 * password was successfully changed.
 *
 * Requires: authenticated session (called from the reset-password page
 * immediately after a successful password update, before signOut).
 *
 * No request body needed — the user identity is read from the session cookie.
 */

import { getAuthUser } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
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
    const cookieStore = await cookies();

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          },
        },
      },
    );

    // Get the authenticated user from the session
    const {
      data: { user },
      error: authError,
    } = await getAuthUser();

    if (authError || !user) {
      // Not authenticated — skip silently (user may have already been signed out)
      return NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
    }

    // Resolve the user's first name from the profiles table
    const { data: profile } = await supabase
      .from("users")
      .select("full_name, first_name")
      .eq("id", user.id)
      .single();

    // Derive a sensible first name: dedicated column → split full_name → fallback
    const firstName =
      profile?.first_name ||
      profile?.full_name?.split(" ")[0] ||
      "there";

    const email = user.email!;

    const result = await sendPasswordChangedEmail({ email, firstName });

    if (!result.success) {
      console.error("[password-changed] Email failed:", result.error);
      // Return 200 so the client doesn't retry — this is best-effort
      return NextResponse.json({ success: false, error: result.error });
    }

    return NextResponse.json({ success: true, messageId: result.messageId });
  } catch (err) {
    console.error("[password-changed] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
