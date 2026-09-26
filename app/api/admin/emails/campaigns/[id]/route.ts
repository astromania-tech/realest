/**
 * GET    /api/admin/emails/campaigns/[id]  — get single campaign
 * PATCH  /api/admin/emails/campaigns/[id]  — update draft campaign
 * DELETE /api/admin/emails/campaigns/[id]  — delete draft campaign
 *
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';

const campaignIdSchema = z.string().uuid('Invalid campaign ID');

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Get email campaign',
  description: 'Return a single admin email campaign with owner details.',
  tags: ['Admin', 'Emails'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    '200': { description: 'Campaign loaded successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
    '404': { description: 'Campaign not found' },
  },
};

export const openApiPATCH: OpenApiMetadata = {
  method: 'patch',
  summary: 'Update draft email campaign',
  description: 'Update a draft campaign before it is sent.',
  tags: ['Admin', 'Emails'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            template_name: { type: 'string' },
            subject: { type: 'string' },
            audience_type: { type: 'string', enum: ['resend_audience', 'db_segment'] },
            audience_id: { type: 'string' },
            audience_filter: { type: 'object' },
            send_mode: { type: 'string', enum: ['broadcast', 'batch'] },
            template_props: { type: 'object' },
            scheduled_at: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Campaign updated successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
    '404': { description: 'Campaign not found' },
    '409': { description: 'Campaign is not in draft status' },
  },
};

export const openApiDELETE: OpenApiMetadata = {
  method: 'delete',
  summary: 'Delete draft email campaign',
  description: 'Delete a campaign while it is still in draft status.',
  tags: ['Admin', 'Emails'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    '200': { description: 'Campaign deleted successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
    '404': { description: 'Campaign not found' },
    '409': { description: 'Campaign is not in draft status' },
  },
};



// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  const campaignIdResult = campaignIdSchema.safeParse(id);
  if (!campaignIdResult.success) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const campaignId = campaignIdResult.data;

  const campaign = await prisma.email_campaigns.findUnique({
    where: { id: campaignId },
    include: { profiles: { select: { full_name: true, email: true } } },
  });

  if (!campaign) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  return NextResponse.json({ campaign });
}

// ── PATCH ─────────────────────────────────────────────────────────────────────
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  const campaignIdResult = campaignIdSchema.safeParse(id);
  if (!campaignIdResult.success) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const campaignId = campaignIdResult.data;

  const existing = await prisma.email_campaigns.findUnique({ where: { id: campaignId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (existing.status !== 'draft') {
    return NextResponse.json({ error: 'Only draft campaigns can be updated' }, { status: 409 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const allowedFields = [
    'name', 'template_name', 'subject', 'audience_type',
    'audience_id', 'audience_filter', 'send_mode',
    'template_props', 'scheduled_at',
  ];

  const updateData: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updateData[field] = body[field];
    }
  }

  if (updateData.scheduled_at) {
    updateData.scheduled_at = new Date(updateData.scheduled_at as string);
  }

  const updated = await prisma.email_campaigns.update({
    where: { id: campaignId },
    data: { ...updateData, updated_at: new Date() },
  });

  return NextResponse.json({ campaign: updated });
}

// ── DELETE ────────────────────────────────────────────────────────────────────
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;
  const campaignIdResult = campaignIdSchema.safeParse(id);
  if (!campaignIdResult.success) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const campaignId = campaignIdResult.data;

  const existing = await prisma.email_campaigns.findUnique({ where: { id: campaignId } });
  if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (existing.status !== 'draft') {
    return NextResponse.json(
      { error: 'Only draft campaigns can be deleted' },
      { status: 409 },
    );
  }

  await prisma.email_campaigns.delete({ where: { id: campaignId } });

  return NextResponse.json({ success: true });
}
