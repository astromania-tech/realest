/**
 * GET  /api/admin/emails/campaigns  — list campaigns (paginated)
 * POST /api/admin/emails/campaigns  — create a draft campaign
 *
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from "@/lib/supabase/server";
import prisma from '@/lib/prisma';
import { Prisma } from '@/lib/prisma/client';
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'List email campaigns',
  description: 'Return paginated admin email campaigns with optional status filtering.',
  tags: ['Admin', 'Emails'],
  security: [{ bearerAuth: [] }],
  parameters: [
    { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
    { name: 'limit', in: 'query', schema: { type: 'integer', default: 20 } },
    { name: 'status', in: 'query', schema: { type: 'string' } },
  ],
  responses: {
    '200': { description: 'Campaigns loaded successfully' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
  },
};

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Create email campaign',
  description: 'Create a draft email campaign for a Resend audience or database segment.',
  tags: ['Admin', 'Emails'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['name', 'template_name', 'subject', 'audience_type', 'send_mode'],
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
    '201': { description: 'Draft campaign created successfully' },
    '400': { description: 'Invalid campaign payload' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Admin access required' },
  },
};

// ── Auth helper ───────────────────────────────────────────────────────────────
async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) return { user: null, profileId: null, error: 'Unauthorized', status: 401 };

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRow?.role !== 'admin') return { user: null, profileId: null, error: 'Forbidden', status: 403 };

  return { user, profileId: user.id, error: null, status: 200 };
}

// ── GET ───────────────────────────────────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { error, status, profileId } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { searchParams } = new URL(request.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') ?? '20', 10)));
  const statusFilter = searchParams.get('status');

  const where = statusFilter ? { status: statusFilter } : undefined;

  const [campaigns, total] = await Promise.all([
    prisma.email_campaigns.findMany({
      where,
      orderBy: { created_at: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        profiles: { select: { full_name: true, email: true } },
      },
    }),
    prisma.email_campaigns.count({ where }),
  ]);

  void profileId; // used for auth only

  return NextResponse.json({ campaigns, total, page, limit });
}

// ── POST ──────────────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  const { error, status, profileId } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { name, template_name, subject, audience_type, audience_id, audience_filter, send_mode, template_props, scheduled_at } = body;

  // Basic validation
  if (!name || !template_name || !subject || !audience_type || !send_mode) {
    return NextResponse.json(
      { error: 'Missing required fields: name, template_name, subject, audience_type, send_mode' },
      { status: 400 },
    );
  }

  const validAudienceTypes = ['resend_audience', 'db_segment'];
  const validSendModes = ['broadcast', 'batch'];

  if (!validAudienceTypes.includes(audience_type as string)) {
    return NextResponse.json({ error: 'audience_type must be resend_audience or db_segment' }, { status: 400 });
  }
  if (!validSendModes.includes(send_mode as string)) {
    return NextResponse.json({ error: 'send_mode must be broadcast or batch' }, { status: 400 });
  }
  if (audience_type === 'resend_audience' && !audience_id) {
    return NextResponse.json({ error: 'audience_id required for resend_audience type' }, { status: 400 });
  }

  const campaign = await prisma.email_campaigns.create({
    data: {
      name: name as string,
      template_name: template_name as string,
      subject: subject as string,
      audience_type: audience_type as string,
      audience_id: (audience_id as string | undefined) ?? null,
      audience_filter: audience_filter ?? Prisma.JsonNull,
      send_mode: send_mode as string,
      template_props: template_props ?? Prisma.JsonNull,
      status: 'draft',
      scheduled_at: scheduled_at ? new Date(scheduled_at as string) : null,
      created_by: profileId!,
    },
  });

  return NextResponse.json({ campaign }, { status: 201 });
}
