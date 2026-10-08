/**
 * POST /api/admin/waitlist/[id]/email  — send a single email template to one waitlist subscriber
 *
 * Body: { template_name: string; template_props?: Record<string, unknown> }
 * Merges subscriber data (firstName, email, position) with template_props before rendering.
 *
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import * as React from 'react';
import { requireAdmin } from '@/lib/auth/require-admin';
import { prisma } from '@/lib/prisma';
import { renderEmailFull } from '@/emails';
import { Resend } from 'resend';
import { interpolateSubject } from '@/lib/utils/interpolateSubject';
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Send waitlist subscriber email',
  description: 'Send a single template email to one waitlist subscriber.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Waitlist subscriber ID' }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['template_name'],
          properties: {
            template_name: { type: 'string' },
            template_props: { type: 'object' },
            subject: { type: 'string' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Email sent successfully' },
    '400': { description: 'template_name is required' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden' },
    '404': { description: 'Subscriber not found' },
  },
}

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM_EMAIL_WAITLIST = process.env.FROM_EMAIL_WAITLIST ?? process.env.FROM_EMAIL ?? 'RealEST <hello@connect.realest.ng>';



export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;

  const subscriber = await prisma.waitlist.findUnique({
    where: { id },
    select: { id: true, email: true, first_name: true, last_name: true },
  });

  if (!subscriber) {
    return NextResponse.json({ error: 'Subscriber not found' }, { status: 404 });
  }

  const body = await request.json() as {
    template_name: string;
    template_props?: Record<string, unknown>;
    subject?: string;
  };

  const { template_name, template_props = {}, subject } = body;

  if (!template_name) {
    return NextResponse.json({ error: 'template_name is required' }, { status: 400 });
  }

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 });
  }

  // Dynamically load the template component
  const emailModule = await import('@/emails');
  const Component = (emailModule as Record<string, unknown>)[template_name] as
    | React.ComponentType<Record<string, unknown>>
    | undefined;

  if (!Component) {
    return NextResponse.json(
      { error: `Template "${template_name}" not found` },
      { status: 400 },
    );
  }

  // Merge subscriber data with provided template_props (subscriber data takes precedence for personalisation)
  const mergedProps: Record<string, unknown> = {
    ...template_props,
    email: subscriber.email,
    firstName: subscriber.first_name ?? 'there',
    fullName: [subscriber.first_name, subscriber.last_name].filter(Boolean).join(' ') || undefined,
  };

  const { html, text } = await renderEmailFull(React.createElement(Component, mergedProps));

  // Resolve subject: caller-provided > template .subject() > fallback.
  // Interpolate {{firstName}}/{{fullName}}/{{email}} tokens in all cases.
  const recipientData = {
    firstName: subscriber.first_name ?? 'there',
    fullName: mergedProps.fullName as string | undefined,
    email: subscriber.email as string,
  };

  let resolvedSubject: string;
  if (subject) {
    resolvedSubject = interpolateSubject(subject, recipientData);
  } else {
    const subjectFn = (Component as unknown as Record<string, unknown>).subject;
    if (typeof subjectFn === 'function') {
      resolvedSubject = interpolateSubject(
        (subjectFn as (d: Record<string, unknown>) => string)(mergedProps),
        recipientData,
      );
    } else {
      resolvedSubject = `A message from RealEST`;
    }
  }

  const { data, error: sendError } = await resend.emails.send({
    from: FROM_EMAIL_WAITLIST,
    to: [subscriber.email as string],
    subject: resolvedSubject,
    html,
    text,
  });

  if (sendError) {
    console.error('❌ Waitlist individual email send failed:', sendError);
    return NextResponse.json({ error: sendError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, messageId: data?.id });
}
