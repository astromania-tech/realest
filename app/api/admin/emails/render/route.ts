import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from '@/lib/auth/require-admin';
import { prisma } from '@/lib/prisma';
import { templateRegistry } from "@/emails/preview-registry";
import { renderEmail } from "@/emails/utils/renderEmail";
import type { OpenApiMetadata } from "@/lib/openapi/route-metadata";

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Render email template',
  description: 'Render a selected email template to HTML for preview in the admin UI.',
  tags: ['Admin', 'Emails'],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'template', in: 'query', required: true, schema: { type: 'string' } },
    { name: 'theme', in: 'query', schema: { type: 'string', enum: ['light', 'dark'] } },
  ],
  responses: {
    '200': { description: 'Template rendered successfully' },
    '400': { description: 'Missing template parameter' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
    '404': { description: 'Template not found' },
  },
};

export async function GET(request: NextRequest) {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const admin = await requireAdmin();
  if (!admin.ok) {
    return NextResponse.json({ error: admin.error }, { status: admin.status });
  }

  // ── Template lookup ────────────────────────────────────────────────────────
  const templateName = request.nextUrl.searchParams.get("template");

  if (!templateName) {
    return NextResponse.json(
      { error: "Missing 'template' query parameter" },
      { status: 400 }
    );
  }

  const entry = templateRegistry.find((t) => t.name === templateName);

  if (!entry) {
    return NextResponse.json(
      { error: `Template '${templateName}' not found` },
      { status: 404 }
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const theme = request.nextUrl.searchParams.get("theme") === "dark" ? "dark" : "light";
  const rawHtml = await renderEmail(entry.element);

  // Inject a canvas background style to simulate light/dark inbox environment.
  // Email inline styles are preserved — only the outer page background changes.
  const canvasStyle =
    theme === "dark"
      ? `<style>html,body{background-color:#1c1c1c!important;padding:16px!important}</style>`
      : `<style>html,body{background-color:#f4f4f4!important}</style>`;
  const html = rawHtml.includes("</head>")
    ? rawHtml.replace("</head>", `${canvasStyle}</head>`)
    : rawHtml;

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Prevent the iframe from making network requests or running scripts
      "X-Frame-Options": "SAMEORIGIN",
    },
  });
}
