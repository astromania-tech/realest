/**
 * POST /api/auth/complete-password-reset
 *
 * Applies the new password using the recovery session cookies set by
 * /api/auth/verify-reset-otp. Client-side updateUser is unreliable here:
 * the recovery session lives in cookies that the browser auth helpers may
 * not have hydrated yet after the OTP exchange.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { isPasswordValid } from "@/lib/auth/password-rules";
import { prisma } from "@/lib/prisma";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const schema = z.object({
  password: z.string().min(8, "Password is too short"),
});

export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Complete password reset",
  description:
    "Set a new password for the recovery session established by verify-reset-otp.",
  tags: ["Auth"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["password"],
          properties: {
            password: { type: "string", minLength: 8 },
          },
        },
      },
    },
  },
  responses: {
    "200": { description: "Password updated" },
    "400": { description: "Invalid password or update failed" },
    "401": { description: "Recovery session missing or expired" },
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = schema.parse(body);

    if (!isPasswordValid(password)) {
      return NextResponse.json(
        {
          success: false,
          error: "Password does not meet security requirements",
        },
        { status: 400 },
      );
    }

    const response = NextResponse.json({ success: true });

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => request.cookies.getAll(),
          setAll: (cookiesToSet) => {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options);
            });
          },
        },
      },
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          error: "Session expired. Please request a new password reset.",
        },
        { status: 401 },
      );
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      const msg = updateError.message || "Failed to update password";
      const samePassword =
        msg.toLowerCase().includes("same") ||
        msg.toLowerCase().includes("different from");
      return NextResponse.json(
        {
          success: false,
          error: samePassword
            ? "Password must be different from your current password."
            : msg,
        },
        { status: 400 },
      );
    }

    // Notify while the session is still valid, then sign out for security.
    try {
      const profile = await prisma.users.findUnique({
        where: { id: user.id },
        select: { full_name: true },
      });
      const firstName = profile?.full_name?.split(" ")[0] || "there";
      if (user.email) {
        const { sendPasswordChangedEmail } = await import("@/lib/emailService");
        await sendPasswordChangedEmail({
          email: user.email,
          firstName,
        });
      }
    } catch (notifyErr) {
      console.warn(
        "[complete-password-reset] Notification email failed:",
        notifyErr,
      );
    }

    await supabase.auth.signOut();

    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0].message },
        { status: 400 },
      );
    }
    console.error("[complete-password-reset] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
