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

  const responses = await prisma.poll_responses.findMany({
    select: { question_key: true, answer: true, ref: true, created_at: true },
    orderBy: { created_at: 'desc' },
  });

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
