import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

interface SubmissionRow {
  id: string;
  form_id: string;
  segment: string;
  full_name: string;
  email: string;
  opt_in_email_results: boolean;
  created_at: string;
}

interface AnswerRow {
  question_key: string;
  answer: { value: unknown };
}

interface QuestionRow {
  question_key: string;
  prompt: string;
  options: Array<{ value: string; label: string }> | null;
  display_order: number;
  segment: string;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  if (!id || !/^[0-9a-f-]{36}$/i.test(id)) {
    return NextResponse.json({ ok: false, error: "Invalid submission ID." }, { status: 400 });
  }


  // Fetch submission with form
  let sub: SubmissionRow & { form: { slug: string; title: string } | null };
  try {
    sub = await prisma.poll_submissions.findUnique({
      where: { id },
      select: {
        id: true,
        form_id: true,
        segment: true,
        full_name: true,
        email: true,
        opt_in_email_results: true,
        created_at: true,
        form: { select: { slug: true, title: true } },
      },
    }) as any;
    if (!sub) {
      return NextResponse.json({ ok: false, error: "Submission not found." }, { status: 404 });
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Submission not found." }, { status: 404 });
  }

  // Fetch answers
  let answerRows: AnswerRow[] = [];
  try {
    answerRows = await prisma.poll_submission_answers.findMany({
      where: { submission_id: id },
      select: { question_key: true, answer: true },
    }) as any;
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to load answers." }, { status: 500 });
  }

  // Fetch question prompts + options for this form and segment
  let questions: QuestionRow[] = [];
  try {
    questions = await prisma.poll_questions.findMany({
      where: { form_id: sub.form_id, segment: sub.segment },
      orderBy: { display_order: 'asc' },
      select: {
        question_key: true,
        prompt: true,
        options: true,
        display_order: true,
        segment: true,
      },
    }) as any;
  } catch {
    return NextResponse.json({ ok: false, error: "Failed to load questions." }, { status: 500 });
  }

  // Build enriched answer list
  const answerMap = new Map(
    (answerRows ?? []).map((r) => [r.question_key, r.answer?.value]),
  );

  const enrichedAnswers = (questions ?? [])
    .filter((q) => answerMap.has(q.question_key))
    .map((q) => {
      const raw = answerMap.get(q.question_key);
      const opts: Array<{ value: string; label: string }> = Array.isArray(q.options)
        ? q.options
        : [];
      let displayAnswer: string;
      if (Array.isArray(raw)) {
        displayAnswer = raw
          .map((v: string) => opts.find((o) => o.value === v)?.label ?? v)
          .join(", ");
      } else {
        displayAnswer = opts.find((o) => o.value === raw)?.label ?? String(raw ?? "");
      }
      return { question: q.prompt, answer: displayAnswer, key: q.question_key };
    });

  return NextResponse.json({
    ok: true,
    submission: {
      id: sub.id,
      segment: sub.segment,
      full_name: sub.full_name,
      email: sub.email,
      opt_in_email_results: sub.opt_in_email_results,
      created_at: sub.created_at,
      form_title: sub.form?.title ?? "RealEST Launch Intelligence Poll",
    },
    answers: enrichedAnswers,
  });
}
