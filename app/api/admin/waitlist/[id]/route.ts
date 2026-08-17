/**
 * DELETE /api/admin/waitlist/[id]  — remove a waitlist subscriber
 *
 * Admin-only.
 */
import { NextRequest, NextResponse } from 'next/server';
import { createClient, getAuthUser } from "@/lib/supabase/server";
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

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { supabase, error, status } = await requireAdmin();
  if (error) return NextResponse.json({ error }, { status });

  const { id } = await params;

  const { error: deleteError } = await supabase
    .from('waitlist')
    .delete()
    .eq('id', id);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
