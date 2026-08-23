"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  ChevronRight,
  Loader2,
  Mail,
  MapPin,
  RotateCcw,
  Search,
  Sparkles,
} from "lucide-react";
import { formatLocationName, useLocationSearch } from "@/lib/hooks/useLocationSearch";

type PollOption = { value: string; label: string };

type PollQuestion = {
  key: string;
  prompt: string;
  type: "single_choice" | "multi_choice" | "text" | "number" | "boolean";
  required: boolean;
  options: PollOption[];
  order: number;
};

type PollSegment = {
  key: string;
  label: string;
  description: string;
  questions: PollQuestion[];
};

type PollCatalogResponse = {
  ok: boolean;
  form: { slug: string; title: string; description: string };
  segments: PollSegment[];
  error?: string;
};

// Maps segment key → emoji icon shown on role-selector cards
const SEGMENT_ICONS: Record<string, string> = {
  buyer_renter: "🏠",
  owner_landlord: "🔑",
  agent: "🤝",
  investor: "📈",
  developer_agency: "🏗️",
  bank_mortgage: "🏦",
};

// ─── Step tracker ─────────────────────────────────────────────────────────────
// step === -1  → role selector
// step === 0…N-1 → question index into selectedSegment.questions
// step === N   → overview / review screen
type ModalState = "hidden" | "ask" | "collect";


// More precise city/location detection (avoid false positives)
const isCityOrLocationQuestion = (question: PollQuestion) => {
  const key = question.key.toLowerCase();
  const prompt = question.prompt.toLowerCase();
  // Only match if the question is about a city, state, or location in the context of place, not e.g. 'location of CAC'
  return (
    ((key.includes("city") || prompt.includes("city")) && !key.includes("cac") && !prompt.includes("cac")) ||
    ((key.includes("state") || prompt.includes("state")) && !key.includes("cac") && !prompt.includes("cac")) ||
    ((key.includes("location") || prompt.includes("location")) && !key.includes("cac") && !prompt.includes("cac"))
  );
};

// Detect agent license number question
const isAgentLicenseQuestion = (question: PollQuestion) => {
  const key = question.key.toLowerCase();
  const prompt = question.prompt.toLowerCase();
  return (
    key.includes("agent") && (key.includes("license") || key.includes("esvarbon"))
  ) || (
    prompt.includes("agent license") || prompt.includes("esvarbon")
  );
};

// Detect CAC number question
const isCACNumberQuestion = (question: PollQuestion) => {
  const key = question.key.toLowerCase();
  const prompt = question.prompt.toLowerCase();
  return (
    (key.includes("cac") && key.includes("number")) ||
    prompt.includes("cac number") ||
    prompt.includes("corporate affairs commission")
  );
};

interface PollPageClientProps {
  initialSegments: PollSegment[];
  initialFormSlug: string;
  initialError: string | null;
}

export function PollPageClient({
  initialSegments,
  initialFormSlug,
  initialError,
}: PollPageClientProps) {
  const [catalogError] = useState<string | null>(initialError);
  const [formSlug] = useState(initialFormSlug);
  const [segments] = useState<PollSegment[]>(initialSegments);
  // ── catalog ─────────────────────────────────────────────────────────────────
  // const [loadingCatalog, setLoadingCatalog] = useState(true);
  // const [catalogError, setCatalogError] = useState<string | null>(null);
  // const [formSlug, setFormSlug] = useState("realest-launch-intelligence-2026");
  // const [segments, setSegments] = useState<PollSegment[]>([]);

  // ── flow state ───────────────────────────────────────────────────────────────
  const [segmentKey, setSegmentKey] = useState("");
  const [step, setStep] = useState(-1); // -1 = role picker
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});

  // ── modal / email capture ────────────────────────────────────────────────────
  const [modal, setModal] = useState<ModalState>("hidden");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [optInEmailResults, setOptInEmailResults] = useState(false);

  // ── submission ───────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const [isLocationDropdownOpen, setIsLocationDropdownOpen] = useState(false);

  const locationSearch = useLocationSearch({
    debounceMs: 150,
    maxResults: 12,
    includeStates: true,
    includePopularCities: true,
  });

  const topRef = useRef<HTMLDivElement>(null);

  // ── load catalog ─────────────────────────────────────────────────────────────
  // useEffect(() => {
  //   (async () => {
  //     setLoadingCatalog(true);
  //     setCatalogError(null);
  //     try {
  //       const res = await fetch("/api/poll/catalog");
  //       const json = (await res.json()) as PollCatalogResponse;
  //       if (!res.ok || !json.ok) { setCatalogError(json.error ?? "Unable to load poll."); return; }
  //       setFormSlug(json.form.slug);
  //       setSegments(json.segments);
  //     } catch { setCatalogError("Unable to load poll."); }
  //     finally { setLoadingCatalog(false); }
  //   })();
  // }, []);

  const selectedSegment = useMemo(
    () => segments.find((s) => s.key === segmentKey) ?? null,
    [segments, segmentKey],
  );


  // Safe expression parser for conditional question visibility
  function isQuestionVisible(q: any, answers: Record<string, any>) {
    if (!q.show_if) return true;
    try {
      // Support simple equality and logical operators: 'q21=="yes"', '&&', '||'
      let expr = q.show_if;
      // Replace each question key with its actual value from answers
      expr = expr.replace(/([a-zA-Z0-9_]+)(?===|!=)/g, (match: string) => {
        if (match.startsWith('q')) {
          const val = answers[match];
          return typeof val === 'string' ? `"${val}"` : JSON.stringify(val);
        }
        return match;
      });
      // Only allow safe operators and comparisons
      const allowedOps = /^["'\w\s=!&|()]+$/;
      if (!allowedOps.test(expr)) return false;
      // Validate basic structure: no function calls, no brackets
      if (/[{}\[\]().;,`]/.test(expr)) return false;
      // Use Function constructor in strict mode for safer evaluation
      const fn = new Function('return ' + expr);
      return !!fn.call(null);
    } catch {
      return false;
    }
  }

  const visibleQuestions = useMemo(() => {
    if (!selectedSegment) return [];
    const qs = selectedSegment.questions;
    // Only include questions whose show_if is satisfied
    return qs.filter((q) => isQuestionVisible(q, answers));
  }, [selectedSegment, answers, isQuestionVisible]);

  const totalSteps = visibleQuestions.length;
  const isOverview = step === totalSteps && totalSteps > 0;

  // ── answer helpers ────────────────────────────────────────────────────────────
  const setSingleAnswer = (key: string, value: string) =>
    setAnswers((prev) => ({ ...prev, [key]: value }));

  const toggleMulti = (key: string, value: string) =>
    setAnswers((prev) => {
      const existing = Array.isArray(prev[key]) ? (prev[key] as string[]) : [];
      const next = existing.includes(value)
        ? existing.filter((v) => v !== value)
        : [...existing, value];
      return { ...prev, [key]: next };
    });

  // ── navigation ────────────────────────────────────────────────────────────────
  const scrollTop = () => topRef.current?.scrollIntoView({ behavior: "smooth" });

  const canAdvance = () => {
    if (step < 0 || step >= totalSteps) return true;
    const q = visibleQuestions[step];
    if (!q.required) return true;
    const v = answers[q.key];
    if (Array.isArray(v)) return v.length > 0;
    return !!v && v.toString().trim().length > 0;
  };

  const goNext = () => {
    if (!canAdvance()) return;
    setStep((s) => s + 1);
    scrollTop();
  };

  const goBack = () => {
    setStep((s) => (s > 0 ? s - 1 : -1));
    scrollTop();
  };

  useEffect(() => {
    setIsLocationDropdownOpen(false);
    locationSearch.clearQuery();
  }, [step, segmentKey, locationSearch.clearQuery]);

  const selectSegment = (key: string) => {
    setSegmentKey(key);
    setAnswers({});
    setStep(0);
    scrollTop();
  };

  // ── submit ────────────────────────────────────────────────────────────────────
  const doSubmit = async (withEmail: boolean) => {
    if (!selectedSegment) return;
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await fetch("/api/poll/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          formSlug,
          segment: selectedSegment.key,
          fullName: withEmail ? fullName : "Anonymous",
          email: withEmail ? email : `anon-${Date.now()}@noreply.realest.ng`,
          optInEmailResults: withEmail,
          answers,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) { setSubmitError(json.error ?? "Submission failed."); return; }
      setSuccessId(json.submissionId ?? "submitted");
      setModal("hidden");
    } catch { setSubmitError("Network error. Please try again."); }
    finally { setSubmitting(false); }
  };

  const handleOverviewSubmit = () => setModal("ask");

  // helper: display label for an answer value
  const displayAnswer = (q: PollQuestion, raw: string | string[]): string => {
    if (Array.isArray(raw)) {
      return raw
        .map((v) => q.options.find((o) => o.value === v)?.label ?? v)
        .join(", ");
    }
    const opt = q.options.find((o) => o.value === raw);
    return opt ? opt.label : raw;
  };

  // ── progress ─────────────────────────────────────────────────────────────────
  const progressPct =
    step < 0
      ? 0
      : isOverview
      ? 100
      : Math.round(((step + 1) / (totalSteps + 1)) * 100);

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  // if (loadingCatalog) {
  //   return (
  //     <div className="flex min-h-screen items-center justify-center bg-background">
  //       <div className="flex items-center gap-3 text-muted-foreground">
  //         <Loader2 className="h-5 w-5 animate-spin" />
  //         <span className="text-sm">Loading poll…</span>
  //       </div>
  //     </div>
  //   );
  // }

  if (catalogError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-2xl border border-danger/30 bg-danger/10 p-6 text-center">
          <p className="text-sm text-danger">{catalogError}</p>
          <Button variant="ghost" className="mt-4" onClick={() => window.location.reload()}>
            <RotateCcw className="mr-2 h-4 w-4" /> Try again
          </Button>
        </div>
      </div>
    );
  }

  // ── SUCCESS SCREEN ───────────────────────────────────────────────────────────
  if (successId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="mx-auto w-full max-w-lg text-center space-y-4">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-full"
            style={{ backgroundColor: "#ADF43420" }}
          >
            <CheckCircle className="h-8 w-8" style={{ color: "#ADF434" }} />
          </div>
          <h1 className="text-2xl font-bold text-foreground">You're all set! 🎉</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Your responses are saved. Thanks for helping shape RealEST's launch priorities.
          </p>
          {optInEmailResults && (
            <p className="text-xs text-muted-foreground">
              A summary email is on its way to <strong>{email}</strong>.
            </p>
          )}
          <div className="pt-2">
            <a
              href={`/poll/${successId}`}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-[#07402F] transition hover:opacity-90"
              style={{ backgroundColor: "#ADF434" }}
            >
              View my poll summary <ChevronRight className="h-4 w-4" />
            </a>
          </div>
          <p className="text-xs text-muted-foreground pt-2">
            Reference ID:{" "}
            <span className="font-mono text-foreground">{successId}</span>
          </p>
        </div>
      </div>
    );
  }

  const currentQuestion = step >= 0 && step < totalSteps ? visibleQuestions[step] : null;
  const showLocationPicker = !!currentQuestion && isCityOrLocationQuestion(currentQuestion);
  const locationOptions =
    locationSearch.query.trim().length > 0
      ? locationSearch.results
      : locationSearch.defaultSuggestions;

  const selectLocationForCurrentQuestion = (label: string) => {
    if (!currentQuestion) return;
    setSingleAnswer(currentQuestion.key, label);
    locationSearch.setQuery(label);
    setIsLocationDropdownOpen(false);
  };

  return (
    <div ref={topRef} className="min-h-screen bg-background px-4 py-10">
      {/* ── MODAL OVERLAY ── */}
      {modal !== "hidden" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
          onClick={(e) => { if (e.target === e.currentTarget) setModal("hidden"); }}
        >
          {/* ── ASK MODAL ── */}
          {modal === "ask" && (
            <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 space-y-4 shadow-xl">
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: "#ADF43420" }}
              >
                <Mail className="h-5 w-5" style={{ color: "#07402F" }} />
              </div>
              <h2 className="text-lg font-bold text-foreground">Want a copy of your answers?</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                We can send you a personal summary of everything you just shared — straight to your
                inbox. No spam, just your responses.
              </p>
              {submitError && (
                <p className="text-xs text-danger rounded-lg bg-danger/10 px-3 py-2">{submitError}</p>
              )}
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  className="w-full font-semibold"
                  style={{ backgroundColor: "#ADF434", color: "#07402F" }}
                  onClick={() => { setOptInEmailResults(true); setModal("collect"); }}
                >
                  Yes, send me the summary
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-muted-foreground"
                  disabled={submitting}
                  onClick={() => doSubmit(false)}
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>
                  ) : (
                    "No thanks, just submit"
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* ── COLLECT EMAIL MODAL (flip-in) ── */}
          {modal === "collect" && (
            <div className="w-full max-w-md rounded-2xl bg-card border border-border p-6 space-y-4 shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-300">
              <button
                type="button"
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition"
                onClick={() => setModal("ask")}
              >
                <ArrowLeft className="h-3 w-3" /> Back
              </button>
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full"
                style={{ backgroundColor: "#07402F20" }}
              >
                <Sparkles className="h-5 w-5" style={{ color: "#ADF434" }} />
              </div>
              <h2 className="text-lg font-bold text-foreground">Where should we send it?</h2>
              <p className="text-xs text-muted-foreground">
                Your name will be used to personalise the email. That's it.
              </p>
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Full name *</label>
                  <Input
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Adaeze Okonkwo"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-foreground">Email address *</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="adaeze@example.com"
                  />
                </div>
              </div>
              {submitError && (
                <p className="text-xs text-danger rounded-lg bg-danger/10 px-3 py-2">{submitError}</p>
              )}
              <Button
                className="w-full font-semibold"
                style={{ backgroundColor: "#ADF434", color: "#07402F" }}
                disabled={submitting || !fullName.trim() || !email.trim()}
                onClick={() => doSubmit(true)}
              >
                {submitting ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Submitting…</>
                ) : (
                  "Submit & send my summary"
                )}
              </Button>
            </div>
          )}
        </div>
      )}

      <div className="mx-auto w-full max-w-2xl space-y-6">
        {/* ── HEADER ── */}
        <div className="space-y-2">
          <Badge className="uppercase tracking-widest text-xs bg-accent text-secondary" style={{ border: "none" }}>
            RealEST · Launch Intelligence
          </Badge>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {step < 0 ? "Who are you in the property market? 🏘️" : selectedSegment?.label ?? ""}
          </h1>
          <p className="text-sm text-muted-foreground">
            {step < 0
              ? "Choose the group that fits you best — we'll ask you the right questions."
              : step < totalSteps
              ? `Question ${step + 1} of ${totalSteps}`
              : "Here's what you shared — review before submitting."}
          </p>
        </div>

        {/* ── PROGRESS BAR (only during questions) ── */}
        {step >= 0 && (
          <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%`, backgroundColor: "#ADF434" }}
            />
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEP -1: ROLE SELECTOR                                              */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {step < 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {segments.map((seg) => (
              <button
                key={seg.key}
                type="button"
                onClick={() => selectSegment(seg.key)}
                className="group rounded-2xl border border-border bg-card p-5 text-left transition-all hover:border-accent hover:shadow-md active:scale-[0.98]"
              >
                <span className="text-3xl">{SEGMENT_ICONS[seg.key] ?? "🏠"}</span>
                <p className="mt-3 text-sm font-semibold text-foreground group-hover:text-primary">
                  {seg.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{seg.description}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  Start <ChevronRight className="h-3 w-3" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* STEPS 0…N-1: ONE QUESTION PER STEP                                 */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {currentQuestion && (
          <div className="rounded-2xl border border-border bg-card p-6 md:p-8 space-y-6">
            <div className="space-y-2">
              <span className="text-xs font-medium text-muted-foreground">
                {currentQuestion.required ? "Required" : "Optional"}
              </span>
              <h2 className="text-lg md:text-xl font-semibold text-foreground leading-snug">
                {currentQuestion.prompt}
              </h2>
            </div>

            {/* ── agent license number (only for follow-up) ── */}
            {currentQuestion.key === "q21b_agent_license_number" && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">Agent License Number (ESVARBON)</label>
                <Input
                  value={typeof answers[currentQuestion.key] === "string" ? (answers[currentQuestion.key] as string) : ""}
                  onChange={e => {
                    // Allow only numbers and uppercase letters, max 12 chars
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12);
                    setSingleAnswer(currentQuestion.key, val);
                  }}
                  placeholder="e.g. ESV123456"
                  maxLength={12}
                  required={currentQuestion.required}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">Find this on your ESVARBON certificate.</p>
              </div>
            )}

            {/* ── CAC number ── */}
            {isCACNumberQuestion(currentQuestion) && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">CAC Registration Number</label>
                <Input
                  value={typeof answers[currentQuestion.key] === "string" ? (answers[currentQuestion.key] as string) : ""}
                  onChange={e => {
                    // Allow only numbers and uppercase letters, max 14 chars
                    const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 14);
                    setSingleAnswer(currentQuestion.key, val);
                  }}
                  placeholder="e.g. RC1234567"
                  maxLength={14}
                  required={currentQuestion.required}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">Corporate Affairs Commission (CAC) number for your business.</p>
              </div>
            )}

            {/* ── single choice ── */}
            {currentQuestion.type === "single_choice" && !showLocationPicker && !isAgentLicenseQuestion(currentQuestion) && !isCACNumberQuestion(currentQuestion) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {currentQuestion.options.map((opt) => {
                  const selected = answers[currentQuestion.key] === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => { setSingleAnswer(currentQuestion.key, opt.value); }}
                      className={`rounded-xl border px-4 py-3 text-sm text-left transition-all ${
                        selected
                          ? "border-accent/70 bg-accent/20 text-primary font-medium"
                          : "border-border bg-background hover:border-accent/20 text-foreground"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}

            {showLocationPicker && (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Search or pick from popular cities and states
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Search className="h-4 w-4" />
                  </div>
                  <Input
                    value={
                      locationSearch.query ||
                      (typeof answers[currentQuestion.key] === "string"
                        ? (answers[currentQuestion.key] as string)
                        : "")
                    }
                    onFocus={() => setIsLocationDropdownOpen(true)}
                    onChange={(event) => {
                      locationSearch.setQuery(event.target.value);
                      setSingleAnswer(currentQuestion.key, event.target.value);
                      setIsLocationDropdownOpen(true);
                    }}
                    placeholder="Type a city or state"
                    className="pl-9 text-sm"
                  />
                </div>

                {isLocationDropdownOpen && (
                  <div className="max-h-64 overflow-auto rounded-xl border border-border bg-card">
                    {locationOptions.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-muted-foreground">No locations found.</p>
                    ) : (
                      locationOptions.map((loc) => (
                        <button
                          key={loc.id}
                          type="button"
                          onClick={() => selectLocationForCurrentQuestion(formatLocationName(loc))}
                          className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-muted/50"
                        >
                          <span className="text-foreground">{formatLocationName(loc)}</span>
                          <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {loc.type}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── multi choice ── */}
            {currentQuestion.type === "multi_choice" && (
              <>
                <p className="text-xs text-muted-foreground -mt-3">Select all that apply.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentQuestion.options.map((opt) => {
                    const arr = Array.isArray(answers[currentQuestion.key])
                      ? (answers[currentQuestion.key] as string[])
                      : [];
                    const selected = arr.includes(opt.value);
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => toggleMulti(currentQuestion.key, opt.value)}
                        className={`rounded-xl border px-4 py-3 text-sm text-left transition-all ${
                          selected
                            ? "border-[#ADF434] bg-[#ADF43418] text-[#07402F] font-medium"
                            : "border-border bg-background hover:border-[#ADF43480] text-foreground"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {/* ── text / boolean ── */}
            {(currentQuestion.type === "text" || currentQuestion.type === "boolean") && !isAgentLicenseQuestion(currentQuestion) && !isCACNumberQuestion(currentQuestion) && (
              <Input
                value={typeof answers[currentQuestion.key] === "string" ? (answers[currentQuestion.key] as string) : ""}
                onChange={(e) => setSingleAnswer(currentQuestion.key, e.target.value)}
                placeholder={currentQuestion.type === "boolean" ? "Yes or No" : "Type your answer…"}
                required={currentQuestion.required}
                className="text-sm"
              />
            )}

            {/* ── number ── */}
            {currentQuestion.type === "number" && (
              <Input
                type="number"
                value={typeof answers[currentQuestion.key] === "string" ? (answers[currentQuestion.key] as string) : ""}
                onChange={(e) => setSingleAnswer(currentQuestion.key, e.target.value)}
                placeholder="Enter a number"
                required={currentQuestion.required}
                className="text-sm"
              />
            )}

            {/* ── nav row ── */}
            <div className="flex items-center justify-between pt-2">
              <Button variant="ghost" size="sm" onClick={goBack}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Back
              </Button>
              <Button
                size="sm"
                onClick={goNext}
                disabled={!canAdvance()}
                style={canAdvance() ? { backgroundColor: "#ADF434", color: "#07402F" } : {}}
              >
                {step === totalSteps - 1 ? "Review answers" : "Next"}
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════ */}
        {/* OVERVIEW / REVIEW SCREEN                                            */}
        {/* ═══════════════════════════════════════════════════════════════════ */}
        {isOverview && selectedSegment && (
          <div className="space-y-4">
            <div className="rounded-2xl border border-border bg-card p-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{SEGMENT_ICONS[selectedSegment.key] ?? "🏠"}</span>
                <div>
                  <p className="text-xs text-muted-foreground">Your selected role</p>
                  <p className="text-sm font-semibold text-foreground">{selectedSegment.label}</p>
                </div>
                <button
                  type="button"
                  onClick={() => { setStep(-1); scrollTop(); }}
                  className="ml-auto text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground"
                >
                  Change role
                </button>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card divide-y divide-border overflow-hidden">
              {visibleQuestions.map((q, idx) => {
                const raw = answers[q.key];
                const answered = Array.isArray(raw) ? raw.length > 0 : !!raw?.toString().trim();
                return (
                  <div key={q.key} className="flex items-start gap-4 px-5 py-4">
                    <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold"
                      style={{ backgroundColor: answered ? "#ADF43425" : "#f3f4f6", color: answered ? "#07402F" : "#9ca3af" }}
                    >
                      {answered ? "✓" : idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground">{q.prompt}</p>
                      <p className={`text-sm font-medium mt-0.5 ${answered ? "text-foreground" : "text-muted-foreground italic"}`}>
                        {answered ? displayAnswer(q, raw!) : "Not answered"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => { setStep(idx); scrollTop(); }}
                      className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2 shrink-0"
                    >
                      Edit
                    </button>
                  </div>
                );
              })}
            </div>

            {submitError && (
              <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
                {submitError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <Button variant="ghost" size="sm" onClick={() => setStep(totalSteps - 1)}>
                <ArrowLeft className="mr-1.5 h-4 w-4" /> Last question
              </Button>
              <Button
                onClick={handleOverviewSubmit}
                className="font-semibold px-6"
                style={{ backgroundColor: "#ADF434", color: "#07402F" }}
              >
                Submit my responses <ChevronRight className="ml-1.5 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

