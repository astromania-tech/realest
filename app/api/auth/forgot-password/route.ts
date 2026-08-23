/**
 * POST /api/auth/forgot-password — send the password reset email
 *
 * Server-side password reset handler.
 * - Uses service role to look up the profile (avoids anon RLS block)
 * - Uses Supabase Admin generateLink for a real, signed recovery URL
 * - Always returns a generic success response to prevent account enumeration
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServiceClient } from "@/lib/supabase/service";
import { deriveNumericOtp } from "@/lib/utils/otp";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const schema = z.object({
  email: z.string().email("Invalid email address"),
});

export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Request password reset email",
  description: "Send a password reset email with a recovery link and OTP. Returns a generic success response to prevent account enumeration.",
  tags: ["Auth"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["email"],
          properties: {
            email: { type: "string", format: "email" },
          },
        },
      },
    },
  },
  responses: {
    "200": {
      description: "Reset request accepted",
      content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" } } } } },
    },
    "400": { description: "Invalid email" },
    "500": { description: "Failed to generate reset link" },
    "502": { description: "Failed to send reset email" },
    "503": { description: "Email service is at capacity" },
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = schema.parse(body);

    const supabase = createServiceClient();

    // Look up profile for personalisation — service role bypasses RLS
    const { data: profile } = await supabase
      .from("profiles")
      .select("full_name")
      .eq("email", email)
      .single();

    // If no profile exists, return success anyway (no user enumeration)
    if (!profile) {
      return NextResponse.json({ success: true });
    }

    const firstName = profile.full_name?.split(" ")[0] || "there";

    // Generate a real signed recovery link via the admin API
    const { data: linkData, error: linkError } =
      await supabase.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/reset-password`,
        },
      });

    if (linkError || !linkData?.properties?.action_link) {
      console.error("[ForgotPassword] generateLink error:", linkError);
      return NextResponse.json(
        { success: false, error: "Failed to generate reset link" },
        { status: 500 },
      );
    }

    const resetLink = linkData.properties.action_link;

    // Derive a 6-digit numeric OTP from the hashed token (deterministic, digits-only)
    const hashed = linkData.properties.hashed_token;

    if (!hashed) {
      console.error("[ForgotPassword] Missing hashed_token in generateLink response");
      return NextResponse.json(
        { success: false, error: "Failed to generate reset code" },
        { status: 500 },
      );
    }
    const otpCode = deriveNumericOtp(hashed);

    // Build a click-to-fill URL so the user can click the code in the email
    // and have it auto-filled into the OTP form
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const otpFillUrl = `${siteUrl}/otp?email=${encodeURIComponent(email)}&type=reset&code=${otpCode}`;

    // Send the branded password reset email
    const { sendHybridPasswordResetEmail } = await import("@/lib/emailService");
    const emailResult = await sendHybridPasswordResetEmail({
      email,
      firstName,
      otpCode,
      resetLink,
      otpFillUrl,
      expiryMinutes: 15,
    });

    if (!emailResult.success) {
      console.error("[ForgotPassword] Email send error:", emailResult.error);

      if (emailResult.quotaExceeded) {
        return NextResponse.json(
          { success: false, error: "Our email service is temporarily at capacity. Please try again in a few hours." },
          { status: 503 },
        );
      }

      return NextResponse.json(
        { success: false, error: "Failed to send reset email" },
        { status: 502 },
      );
    }

    console.log("[ForgotPassword] Reset email sent to", email, "— id:", emailResult.messageId);

    // Store the hashed token in a short-lived HttpOnly cookie so the
    // /api/auth/verify-reset-otp endpoint can verify the 6-digit code
    // without ever exposing the full token hash to the browser.
    const successResponse = NextResponse.json({ success: true });
    successResponse.cookies.set("reset_token", hashed, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 900, // 15 minutes — OWASP recommended OTP expiry
    });
    return successResponse;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0].message },
        { status: 400 },
      );
    }
    console.error("[ForgotPassword] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
