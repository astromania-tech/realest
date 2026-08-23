/**
 * GET /api/admin/emails/campaigns/[id]/preview  — render the campaign template to HTML
 *
 * Returns the fully-rendered HTML email so it can be displayed in an iframe on the
 * campaign detail page.
 *
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import * as React from 'react';
import { createClient, getAuthUser } from "@/lib/supabase/server";
import prisma from '@/lib/prisma';
import { renderEmail } from '@/emails';
import { z } from 'zod';
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';

const campaignIdSchema = z.string().uuid('Invalid campaign ID');

export const openApiGET: OpenApiMetadata = {
  method: 'get',
  summary: 'Preview email campaign',
  description: 'Render a campaign template to HTML for preview in the admin UI.',
  tags: ['Admin', 'Emails'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
  responses: {
    '200': { description: 'Campaign preview rendered successfully' },
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
  if (!user) return { error: 'Unauthorized', status: 401 as const };

  const { data: userRow } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();

  if (userRow?.role !== 'admin') return { error: 'Forbidden', status: 403 as const };
  return { error: null, status: 200 as const };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { error, status } = await requireAdmin();
  if (error) {
    return new Response(JSON.stringify({ error }), {
      status,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { id } = await params;
  const campaignIdResult = campaignIdSchema.safeParse(id);
  if (!campaignIdResult.success) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  const campaignId = campaignIdResult.data;

  const campaign = await prisma.email_campaigns.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Load template component dynamically
  const emailModule = await import('@/emails');
  const Component = (emailModule as Record<string, unknown>)[campaign.template_name] as
    | React.ComponentType<Record<string, unknown>>
    | undefined;

  if (!Component) {
    return new Response(
      `<html><body style="font-family:sans-serif;padding:2rem;color:#666">
        <p>Template <strong>${campaign.template_name}</strong> could not be found.</p>
      </body></html>`,
      { status: 200, headers: { 'Content-Type': 'text/html' } },
    );
  }

  const templateProps = (campaign.template_props as Record<string, unknown>) ?? {};

  // Use preview-friendly placeholder data to fill any required props
  const previewProps: Record<string, unknown> = {
    email: 'preview@example.com',
    firstName: 'Preview',
    fullName: 'Preview User',
    position: 42,
    dashboardUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'https://realest.ng',
    ...templateProps,
  };

  const html = await renderEmail(React.createElement(Component, previewProps));

  return new Response(html, {
    status: 200,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
