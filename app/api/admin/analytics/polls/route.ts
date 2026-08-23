/**
 * GET /api/admin/analytics/polls
 *
 * Returns aggregated poll_responses data:
 *   - total votes per answer (across all campaigns)
 *   - breakdown by campaign ref tag
 *
 * Admin-only.
 */
import { NextResponse } from 'next/server';
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { createServiceClient } from '@/lib/supabase/service';

async function requireAdminUser() {
  const supabase = await createClient();
  const { data: { user } } = await getAuthUser();
  if (!user) return { error: 'Unauthorized', status: 401 };
  const { data: row } = await supabase.from('users').select('role').eq('id', user.id).single();
  if (row?.role !== 'admin') return { error: 'Forbidden', status: 403 };
  return { error: null, status: 200 };
}

export const openApiGET = {
  method: 'get',
  summary: 'Admin poll responses overview',
  description: 'Aggregated poll responses with totals and breakdowns by campaign ref tag. Admin-only.',
  tags: ['admin', 'analytics'],
  responses: {
    200: {
      description: 'Aggregated poll responses',
      content: {
        'application/json': {
          schema: {
            type: 'object',
            properties: {
              total: { type: 'number' },
              questions: { type: 'object' },
              refTags: { type: 'array', items: { type: 'string' } },
            },
          },
        },
      },
    },
    401: { description: 'Unauthorized' },
    403: { description: 'Forbidden' },
  },
} as const;

export async function GET() {
  const { error, status } = await requireAdminUser();
  if (error) return NextResponse.json({ error }, { status });

  const svc = createServiceClient();

  // Fetch all poll responses
  const { data: rows, error: dbErr } = await svc
    .from('poll_responses')
    .select('question_key, answer, ref, created_at')
    .order('created_at', { ascending: false });

  if (dbErr) return NextResponse.json({ error: dbErr.message }, { status: 500 });

  const responses = rows ?? [];

  // Group by question_key then answer
  const byQuestion: Record<
    string,
    { answer: string; total: number; byRef: Record<string, number> }[]
  > = {};

  for (const row of responses) {
    const qk = row.question_key ?? 'unknown';
    const ans = (row.answer ?? '').toLowerCase();
    const ref = row.ref ?? 'direct';

    if (!byQuestion[qk]) byQuestion[qk] = [];

    let entry = byQuestion[qk].find((e) => e.answer === ans);
    if (!entry) {
      entry = { answer: ans, total: 0, byRef: {} };
      byQuestion[qk].push(entry);
    }
    entry.total += 1;
    entry.byRef[ref] = (entry.byRef[ref] ?? 0) + 1;
  }

  // Sort each question's answers by total votes descending
  for (const qk of Object.keys(byQuestion)) {
    byQuestion[qk].sort((a, b) => b.total - a.total);
  }

  // Collect unique ref tags
  const refTags = [...new Set(responses.map((r) => r.ref ?? 'direct'))].sort();

  return NextResponse.json({
    total: responses.length,
    questions: byQuestion,
    refTags,
  });
}
