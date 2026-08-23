/**
 * GET /api/admin/emails/campaigns/[id]/recipients  — list the recipients for a campaign
 *
 * - db_segment:        re-runs the audience_filter query against the users table
 * - resend_audience:   returns audience metadata (contacts managed by Resend)
 *
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from "@/lib/supabase/server";
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

async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();
  if (!user) return { supabase, error: 'Unauthorized', status: 401 as const };

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRow?.role !== 'admin') return { supabase, error: 'Forbidden', status: 403 as const };
  return { supabase, error: null, status: 200 as const };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

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

  let query = supabase
    .from('users')
    .select('id, email, full_name')
    .is('deleted_at', null);

  if (audienceFilter.role) {
    query = query.eq('role', audienceFilter.role as string);
  } else if (Array.isArray(audienceFilter.roles) && audienceFilter.roles.length > 0) {
    query = query.in('role', audienceFilter.roles as string[]);
  }

  const { data, error: queryError } = await query;

  if (queryError) {
    return NextResponse.json({ error: queryError.message }, { status: 500 });
  }

  const recipients = (data ?? []).map((row) => ({
    email: row.email as string,
    fullName: (row.full_name as string | null) ?? undefined,
    firstName: (row.full_name as string | null)?.split(' ')[0] ?? undefined,
  }));

  return NextResponse.json({
    type: 'db_segment',
    filter: audienceFilter,
    total: recipients.length,
    recipients,
  });
}
