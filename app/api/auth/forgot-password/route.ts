/**
 * POST /api/auth/forgot-password — send the password reset email
 *
 * Server-side password reset handler.
 * - Uses service role to look up the profile (avoids anon RLS block)
 * - Uses Supabase Admin generateLink for a real, signed recovery URL
 * - Always returns a generic success response to prevent account enumeration
 * - Coalesces in-flight + cooldown to prevent duplicate emails on double-submit
 */
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import {
  coalesceForgotPasswordSend,
  isForgotPasswordSendOnCooldown,
  markForgotPasswordSent,
} from "@/lib/auth/forgot-password-send-gate";
import { normalizeResetEmail } from "@/lib/auth/password-reset-otp";
import { createServiceClient } from "@/lib/supabase/service";
import { prisma } from "@/lib/prisma";
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

type SendOutcome =
  | { ok: true; hashed: string | null; skippedSend?: boolean }
  | { ok: false; status: number; error: string };

async function sendResetForEmail(email: string): Promise<SendOutcome> {
  if (isForgotPasswordSendOnCooldown(email)) {
    // Prior send still valid — do not rotate the token or send again.
    return { ok: true, hashed: null, skippedSend: true };
  }

  const supabase = createServiceClient();

  const profile = await prisma.profiles.findFirst({
    where: { email },
    select: { full_name: true },
  });

  // If no profile exists, return success anyway (no user enumeration)
  if (!profile) {
    markForgotPasswordSent(email);
    return { ok: true, hashed: null };
  }

  const firstName = profile.full_name?.split(" ")[0] || "there";

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
    return { ok: false, status: 500, error: "Failed to generate reset link" };
  }

  const resetLink = linkData.properties.action_link;
  const hashed = linkData.properties.hashed_token;

  if (!hashed) {
    console.error("[ForgotPassword] Missing hashed_token in generateLink response");
    return { ok: false, status: 500, error: "Failed to generate reset code" };
  }

  const otpCode = deriveNumericOtp(hashed);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const otpFillUrl = `${siteUrl}/otp?email=${encodeURIComponent(email)}&type=reset&code=${otpCode}`;

  const { sendHybridPasswordResetEmail } = await import("@/lib/emailService");
  const emailResult = await sendHybridPasswordResetEmail({
    email,
    firstName,
    otpCode,
    resetLink,
    otpFillUrl,
    expiryMinutes: 15,
    verificationType: "reset",
  });

  if (!emailResult.success) {
    console.error("[ForgotPassword] Email send error:", emailResult.error);

    if (emailResult.quotaExceeded) {
      return {
        ok: false,
        status: 503,
        error:
          "Our email service is temporarily at capacity. Please try again in a few hours.",
      };
    }

    return { ok: false, status: 502, error: "Failed to send reset email" };
  }

  markForgotPasswordSent(email);
  console.log(
    "[ForgotPassword] Reset email sent to",
    email,
    "— id:",
    emailResult.messageId,
  );

  return { ok: true, hashed };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email: rawEmail } = schema.parse(body);
    const email = normalizeResetEmail(rawEmail);

    const outcome = await coalesceForgotPasswordSend(email, () =>
      sendResetForEmail(email),
    );

    if (!outcome.ok) {
      return NextResponse.json(
        { success: false, error: outcome.error },
        { status: outcome.status },
      );
    }

    const successResponse = NextResponse.json({ success: true });

    // Only set / refresh the cookie when we generated a new hash.
    // Cooldown skips keep the existing reset_token cookie from the first send.
    if (outcome.hashed) {
      successResponse.cookies.set("reset_token", outcome.hashed, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth",
        maxAge: 900,
      });
    }

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
