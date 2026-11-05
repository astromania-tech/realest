import { NextRequest, NextResponse } from 'next/server';
import { syncWaitlistContextToProfile } from '@/lib/reward-engine';
import { prisma } from '@/lib/prisma';
import { getAuthUser } from '@/lib/supabase/server';
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';

export const openApiPOST: OpenApiMetadata = {
  method: 'post',
  summary: 'Sync waitlist context to profile',
  description: 'Copy waitlist metadata and referral context to the signed-in profile inside the sync window.',
  tags: ['Auth'],
  security: [{ bearerAuth: [] }],
  requestBody: {
    required: true,
    content: {
      'application/json': {
        schema: {
          type: 'object',
          required: ['email'],
          properties: {
            email: { type: 'string', format: 'email' },
          },
        },
      },
    },
  },
  responses: {
    '200': { description: 'Waitlist context synced' },
    '400': { description: 'Invalid body or missing email' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Email does not match the session' },
    '404': { description: 'Profile not found or sync window expired' },
  },
}

export async function POST(request: NextRequest) {
  const {
    data: { user },
  } = await getAuthUser();
  if (!user?.email) {
    return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 });
  }

  let email = '';

  try {
    const body = await request.json();
    email = String(body.email ?? '').trim().toLowerCase();
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  if (!email) {
    return NextResponse.json({ ok: false, error: 'Email is required' }, { status: 400 });
  }

  const sessionEmail = user.email.trim().toLowerCase();
  if (email !== sessionEmail) {
    return NextResponse.json(
      { ok: false, error: 'Email does not match the signed-in account.' },
      { status: 403 },
    );
  }

  const cutoff = new Date(Date.now() - 15 * 60_000);
  const profile = await prisma.profiles.findFirst({
    where: {
      id: user.id,
      email,
      created_at: { gte: cutoff },
    },
    select: { id: true, email: true, created_at: true },
  });

  if (!profile) {
    return NextResponse.json(
      { ok: false, error: 'Profile not found or sync window expired' },
      { status: 404 },
    );
  }

  const context = await syncWaitlistContextToProfile(email, profile.id);

  return NextResponse.json({
    ok: true,
    context,
  });
}
