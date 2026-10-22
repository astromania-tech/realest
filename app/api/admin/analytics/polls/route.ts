/**
 * GET /api/admin/analytics/polls
 *
 * Returns aggregated poll_responses data via SQL groupBy:
 *   - total votes per answer (across all campaigns)
 *   - breakdown by campaign ref tag
 *
 * Admin-only.
 */
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/require-admin';
import { prisma } from '@/lib/prisma';

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
  const admin = await requireAdmin();
  if (!admin.ok) return NextResponse.json({ error: admin.error }, { status: admin.status });

  const [grouped, total] = await Promise.all([
    prisma.poll_responses.groupBy({
      by: ['question_key', 'answer', 'ref'],
      _count: { _all: true },
    }),
    prisma.poll_responses.count(),
  ]);

  const byQuestion: Record<
    string,
    { answer: string; total: number; byRef: Record<string, number> }[]
  > = {};
  const refTagSet = new Set<string>();

  for (const row of grouped) {
    const qk = row.question_key || 'unknown';
    const ans = (row.answer || '').toLowerCase();
    const ref = row.ref || 'direct';
    const n = row._count._all;
    refTagSet.add(ref);

    if (!byQuestion[qk]) byQuestion[qk] = [];
    let entry = byQuestion[qk].find((e) => e.answer === ans);
    if (!entry) {
      entry = { answer: ans, total: 0, byRef: {} };
      byQuestion[qk].push(entry);
    }
    entry.total += n;
    entry.byRef[ref] = (entry.byRef[ref] ?? 0) + n;
  }

  for (const qk of Object.keys(byQuestion)) {
    byQuestion[qk].sort((a, b) => b.total - a.total);
  }

  return NextResponse.json({
    total,
    questions: byQuestion,
    refTags: [...refTagSet].sort(),
  });
}
