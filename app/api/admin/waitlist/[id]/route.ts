/**
 * DELETE /api/admin/waitlist/[id]  — remove a waitlist subscriber
 *
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { prisma } from '@/lib/prisma';
import type { OpenApiMetadata } from '@/lib/openapi/route-metadata';

export const openApiDELETE: OpenApiMetadata = {
  method: 'delete',
  summary: 'Remove waitlist subscriber',
  description: 'Delete a waitlist subscriber by ID. Admin only.',
  tags: ['Admin'],
  security: [{ bearerAuth: [] }],
  parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' }, description: 'Waitlist subscriber ID' }],
  responses: {
    '200': { description: 'Waitlist subscriber removed' },
    '401': { description: 'Unauthorized' },
    '403': { description: 'Forbidden' },
    '500': { description: 'Internal server error' },
  },
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const { id } = await params;

  try {
    await prisma.waitlist.delete({ where: { id } });
  } catch (err) {
    return NextResponse.json({ error: (err as Error).message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
