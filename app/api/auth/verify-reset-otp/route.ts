/**
 * POST /api/auth/verify-reset-otp
 *
 * Verifies the 6-digit password-reset OTP code.
 *
 * Security flow:
 *   1. The `/api/auth/forgot-password` endpoint stored the full `hashed_token`
 *      from Supabase's generateLink() inside a short-lived HttpOnly cookie
 *      named `reset_token`.
 *   2. This endpoint reads that cookie, derives the expected numeric OTP from
 *      the stored hash, validates the submitted 6-digit code against it, and
 *      then calls Supabase's verifyOtp() with the full token hash.
 *   3. On success, Supabase sets session cookies on the response so the browser
 *      is immediately signed in with a "recovery" session — ready for
 *      /reset-password to call updateUser({ password }).
 *   4. The `reset_token` cookie is cleared.
 *
 * Never exposes the full hashed_token to the browser.
 */

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { deriveNumericOtp } from "@/lib/utils/otp";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

const schema = z.object({
  code: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must be 6 digits"),
});

export const openApiPOST: OpenApiMetadata = {
  method: "post",
  summary: "Verify password reset OTP",
  description: "Validate the 6-digit reset code and exchange the stored token hash for a recovery session.",
  tags: ["Auth"],
  requestBody: {
    required: true,
    content: {
      "application/json": {
        schema: {
          type: "object",
          required: ["code"],
          properties: {
            code: { type: "string", minLength: 6, maxLength: 6 },
          },
        },
      },
    },
  },
  responses: {
    "200": { description: "OTP verified" },
    "400": { description: "Invalid or expired code" },
  },
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code } = schema.parse(body);

    // Read the stored token hash from the HttpOnly cookie
    const storedHash = request.cookies.get("reset_token")?.value;

    if (!storedHash) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Session or code expired. Request a new reset code to continue.",
        },
        { status: 400 },
      );
    }

    // Validate: code must match the derived numeric OTP from the stored hash
    const expectedCode = deriveNumericOtp(storedHash);
    if (code !== expectedCode) {
      return NextResponse.json(
        { success: false, error: "Invalid code. Please check and try again." },
        { status: 400 },
      );
    }

    // Build the response object first so the Supabase SSR client can attach
    // session cookies to it via the setAll callback.
    const response = NextResponse.json({ success: true });

    // Use the SSR Supabase client so session cookies are written to the response
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

    // Exchange the full token hash for a recovery session
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token: storedHash,
      email: "", // Supabase requires email for verifyOtp, but it's not actually used for token verification in this context
      type: "recovery",
    });

    if (verifyError) {
      const isExpired =
        verifyError.message.toLowerCase().includes("expired") ||
        verifyError.message.toLowerCase().includes("invalid");

      return NextResponse.json(
        {
          success: false,
          error: isExpired
            ? "This code has expired. Please request a new password reset."
            : verifyError.message,
        },
        { status: 400 },
      );
    }

    // Clear the one-time reset_token cookie
    response.cookies.set("reset_token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/api/auth",
      maxAge: 0,
    });

    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: err.errors[0].message },
        { status: 400 },
      );
    }

    console.error("[VerifyResetOTP] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 },
    );
  }
}
