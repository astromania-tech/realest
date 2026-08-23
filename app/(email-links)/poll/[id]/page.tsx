"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, ChevronLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

const SEGMENT_LABELS: Record<string, string> = {
  buyer_renter: "Buyers & Renters",
  owner_landlord: "Property Owners & Landlords",
  agent: "Real Estate Agents",
  investor: "Investors",
  developer_agency: "Developers & Agencies",
  bank_mortgage: "Banks & Mortgage Providers",
};

const SEGMENT_ICONS: Record<string, string> = {
  buyer_renter: "🏠",
  owner_landlord: "🔑",
  agent: "🤝",
  investor: "📈",
  developer_agency: "🏗️",
  bank_mortgage: "🏦",
};

interface AnswerItem {
  key: string;
  question: string;
  answer: string;
}

interface SubmissionData {
  id: string;
  segment: string;
  full_name: string;
  email: string;
  opt_in_email_results: boolean;
  created_at: string;
  form_title: string;
}

interface PollDetailsResponse {
  ok: boolean;
  submission: SubmissionData;
  answers: AnswerItem[];
  error?: string;
}

export default function PollDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [answers, setAnswers] = useState<AnswerItem[]>([]);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/poll/submission/${id}`);
        const json = (await res.json()) as PollDetailsResponse;
        if (!res.ok || !json.ok) {
          setError(json.error ?? "Could not load your poll results.");
          return;
        }
        setSubmission(json.submission);
        setAnswers(json.answers);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading your poll summary…
        </div>
      </div>
    );
  }

  if (error || !submission) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="mx-auto w-full max-w-md rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center space-y-3">
          <p className="text-sm font-medium text-danger">{error ?? "Submission not found."}</p>
          <p className="text-xs text-muted-foreground">
            Make sure the link is complete and hasn't expired.
          </p>
          <Link href="/poll">
            <Button variant="ghost" className="mt-2 text-sm">
              Take a new poll
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const segmentLabel = SEGMENT_LABELS[submission.segment] ?? submission.segment;
  const segmentIcon = SEGMENT_ICONS[submission.segment] ?? "🏘️";
  const formattedDate = new Intl.DateTimeFormat("en-NG", {
    dateStyle: "long",
    timeStyle: "short",
  }).format(new Date(submission.created_at));

  return (
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="mx-auto w-full max-w-2xl space-y-6">

        {/* ── back link ── */}
        <Link
          href="/poll"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="h-3.5 w-3.5" /> Back to poll
        </Link>

        {/* ── hero card ── */}
        <div
          className="rounded-2xl p-6 md:p-8 space-y-3"
          style={{ backgroundColor: "#07402F" }}
        >
          <Badge
            className="uppercase tracking-widest text-xs border-none"
            style={{ backgroundColor: "#ADF43425", color: "#ADF434" }}
          >
            Poll Summary
          </Badge>
          <div className="flex items-center gap-3">
            <span className="text-3xl">{segmentIcon}</span>
            <div>
              <p className="text-xs" style={{ color: "#ADF43480" }}>Your role</p>
              <h1 className="text-lg font-bold" style={{ color: "#F8F9F7" }}>
                {segmentLabel}
              </h1>
            </div>
          </div>
          {submission.opt_in_email_results && (
            <div className="flex items-center gap-2 pt-1">
              <CheckCircle className="h-4 w-4" style={{ color: "#ADF434" }} />
              <span className="text-xs" style={{ color: "#ADF43480" }}>
                A copy was sent to <strong style={{ color: "#ADF434" }}>{submission.email}</strong>
              </span>
            </div>
          )}
          <p className="text-xs" style={{ color: "#ADF43450" }}>
            Submitted {formattedDate}
          </p>
        </div>

        {/* ── answers list ── */}
        <div className="rounded-2xl border border-border bg-card overflow-hidden divide-y divide-border">
          <div className="px-5 py-4">
            <h2 className="text-sm font-semibold text-foreground">
              Your answers · {answers.length} question{answers.length !== 1 ? "s" : ""}
            </h2>
          </div>

          {answers.length === 0 ? (
            <div className="px-5 py-6 text-sm text-muted-foreground text-center">
              No recorded answers found for this submission.
            </div>
          ) : (
            answers.map((item, idx) => (
              <div key={item.key} className="flex items-start gap-4 px-5 py-4">
                <div
                  className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                  style={{ backgroundColor: "#ADF43420", color: "#07402F" }}
                >
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.question}</p>
                  <p className="mt-1 text-sm font-medium text-foreground break-words">
                    {item.answer}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ── footer meta ── */}
        <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-1">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Name:</span> {submission.full_name}
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Poll:</span> {submission.form_title}
          </p>
          <p className="text-xs font-mono text-muted-foreground break-all">
            <span className="font-sans font-medium text-foreground">Ref:</span> {submission.id}
          </p>
        </div>

        <div className="text-center pb-4">
          <Link href="/poll">
            <Button
              className="font-semibold"
              style={{ backgroundColor: "#ADF434", color: "#07402F" }}
            >
              Take another poll
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
