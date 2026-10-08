/**
 * GET /api/admin/emails/campaigns/[id]/recipients  — list the recipients for a campaign
 *
 * - db_segment:        re-runs the audience_filter query against the users table
 * - resend_audience:   returns audience metadata (contacts managed by Resend)
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
  summary: 'List campaign recipients',
  description: 'Return recipients for a Resend audience or database-backed campaign segment.',
  tags: ['Admin', 'Emails'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    '200': { description: 'Campaign recipients loaded successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
    '404': { description: 'Campaign not found' },
  },
};



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

  const campaignRecord = await prisma.email_campaigns.findUnique({ where: { id: campaignId } });
  if (!campaignRecord) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  if (campaignRecord.audience_type === 'resend_audience') {
    // Recipients are Resend-managed — return metadata only
    return NextResponse.json({
      type: 'resend_audience',
      audienceId: campaignRecord.audience_id,
      total: campaignRecord.total_recipients ?? null,
      recipients: [],
      note: 'Recipients are managed by Resend. View them in the Resend dashboard.',
    });
  }

  // db_segment — re-run the audience filter query
  const audienceFilter = (campaignRecord.audience_filter as Record<string, unknown>) ?? {};

  const where: Record<string, unknown> = { deleted_at: null };
  if (audienceFilter.role) {
    where.role = audienceFilter.role;
  } else if (Array.isArray(audienceFilter.roles) && audienceFilter.roles.length > 0) {
    where.role = { in: audienceFilter.roles };
  }

  const data = await prisma.users.findMany({
    where: where as any,
    select: { id: true, email: true, full_name: true },
  });

  const recipients = data.map((row) => ({
    email: row.email as string,
    fullName: row.full_name ?? undefined,
    firstName: row.full_name?.split(' ')[0] ?? undefined,
  }));

  return NextResponse.json({
    type: 'db_segment',
    filter: audienceFilter,
    total: recipients.length,
    recipients,
  });
}
