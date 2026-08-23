
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

const DEFAULT_FORM_SLUG = 'realest-launch-intelligence-2026';

const SEGMENT_META: Record<string, { label: string; description: string }> = {
  buyer_renter: {
    label: 'Buyers and Renters',
    description: 'Demand discovery: locations, budgets, and pain points.',
  },
  owner_landlord: {
    label: 'Property Owners and Landlords',
    description: 'Supply readiness: inventory, listing behavior, and conversion blockers.',
  },
  agent: {
    label: 'Real Estate Agents',
    description: 'Agent growth: lead quality, tooling needs, and monetization readiness.',
  },
  investor: {
    label: 'Property Investors',
    description: 'Capital intent: preferred assets, ranges, and required confidence signals.',
  },
  developer_agency: {
    label: 'Developers and Agencies',
    description: 'Institutional supply: annual project volume, demand insight, and partnerships.',
  },
  bank_mortgage: {
    label: 'Financial Institutions',
    description: 'Mortgage ecosystem: financing offers and partnership interest.',
  },
};

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get('slug')?.trim() || DEFAULT_FORM_SLUG;

  try {
    // Find the poll form by slug
    const form = await prisma.poll_forms.findFirst({
      where: { slug, is_active: true },
      select: { id: true, slug: true, title: true, description: true },
    });
    if (!form) {
      return NextResponse.json({ ok: false, error: 'Poll form not found.' }, { status: 404 });
    }

    // Get all questions for the form, ordered by display_order
    const questions = await prisma.poll_questions.findMany({
      where: { form_id: form.id },
      orderBy: { display_order: 'asc' },
      select: {
        question_key: true,
        segment: true,
        prompt: true,
        question_type: true,
        options: true,
        is_required: true,
        display_order: true,
        show_if: true,
      },
    });

    // Group questions by segment
    const bySegment = new Map<string, any[]>();
    for (const row of questions) {
      const key = row.segment;
      if (!bySegment.has(key)) bySegment.set(key, []);
      bySegment.get(key)?.push({
        key: row.question_key,
        prompt: row.prompt,
        type: row.question_type,
        required: !!row.is_required,
        options: Array.isArray(row.options) ? row.options : [],
        order: row.display_order,
        show_if: row.show_if || null,
      });
    }

    const segments = [...bySegment.entries()].map(([key, segmentQuestions]) => ({
      key,
      label: SEGMENT_META[key]?.label ?? key,
      description: SEGMENT_META[key]?.description ?? 'Survey segment',
      questions: segmentQuestions,
    }));

    return NextResponse.json({
      ok: true,
      form: {
        slug: form.slug,
        title: form.title,
        description: form.description,
      },
      segments,
    });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Unexpected error' },
      { status: 500 },
    );
  }
}
