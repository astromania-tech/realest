import { NextRequest, NextResponse } from "next/server";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { Resend } from "resend";
import { templateRegistry } from "@/emails/preview-registry";
import { renderEmailFull } from "@/emails/utils/renderEmail";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Send a test email',
  description: 'Render an email template and send it to a single recipient for admin validation.',
  tags: ['Admin', 'Emails'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['template', 'to'],
          properties: {
            template: { type: 'string' },
            to: { type: 'string', format: 'email' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Test email sent successfully' },
    '400': { description: 'Invalid template or recipient' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
    '404': { description: 'Unknown template' },
    '500': { description: 'Failed to render or send email' },
    '502': { description: 'Resend rejected the request' },
  },
};

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL =
  process.env.FROM_EMAIL || "RealEST Connect <info@connect.realest.ng>";

// Basic RFC 5322 email check — sufficient for admin-only internal tooling
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(request: NextRequest) {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // ── Parse + validate body ───────────────────────────────────────────────────
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { template, to } =
    body as { template?: unknown; to?: unknown };

  if (typeof template !== "string" || !template.trim()) {
    return NextResponse.json(
      { error: "Missing required field: template" },
      { status: 400 }
    );
  }

  if (typeof to !== "string" || !EMAIL_RE.test(to.trim())) {
    return NextResponse.json(
      { error: "Invalid or missing recipient email address" },
      { status: 400 }
    );
  }

  const recipientEmail = to.trim().toLowerCase();

  // ── Lookup template in registry ─────────────────────────────────────────────
  const entry = templateRegistry.find((t) => t.name === template);
  if (!entry) {
    return NextResponse.json(
      { error: `Unknown template: ${template}` },
      { status: 404 }
    );
  }

  // ── Render + send ───────────────────────────────────────────────────────────
  try {
    const { html, text } = await renderEmailFull(entry.element);

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [recipientEmail],
      subject: `[TEST] ${entry.subject}`,
      html,
      text,
    });

    if (error) {
      console.error("[send-test] Resend error:", error);
      return NextResponse.json(
        { error: error.message ?? "Resend rejected the request" },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      subject: `[TEST] ${entry.subject}`,
      to: recipientEmail,
    });
  } catch (err) {
    console.error("[send-test] Unexpected error:", err);
    return NextResponse.json(
      { error: "Failed to render or send email" },
      { status: 500 }
    );
  }
}
