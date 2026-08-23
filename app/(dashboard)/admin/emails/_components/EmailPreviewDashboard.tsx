"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Monitor,
  Smartphone,
  Copy,
  Check,
  ExternalLink,
  Mail,
  Search,
  ChevronRight,
  Loader2,
  AlertCircle,
  Sun,
  Moon,
  Send,
  X,
} from "lucide-react";
import type { CategoryMeta, TemplateMeta, CategoryKey } from "@/emails/preview-registry";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  templates: TemplateMeta[];
  categories: CategoryMeta[];
  adminEmail: string;
}

type Viewport = "desktop" | "mobile";
type PreviewTheme = "light" | "dark";

type SendResult = { ok: boolean; msg: string };

// ─── Component ─────────────────────────────────────────────────────────────────

export function EmailPreviewDashboard({ templates, categories, adminEmail }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>(
    categories[0]?.key ?? "platform"
  );
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [html, setHtml] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [previewTheme, setPreviewTheme] = useState<PreviewTheme>("light");
  const [query, setQuery] = useState("");
  const [copied, setCopied] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // ── Send-test state ──────────────────────────────────────────────────────────
  const [sendOpen, setSendOpen] = useState(false);
  const [sendTo, setSendTo] = useState(adminEmail);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<SendResult | null>(null);
  const sendPanelRef = useRef<HTMLDivElement>(null);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const countByCategory = categories.reduce<Record<string, number>>(
    (acc, cat) => {
      acc[cat.key] = templates.filter((t) => t.category === cat.key).length;
      return acc;
    },
    {}
  );

  const filteredTemplates = templates.filter(
    (t) =>
      t.category === selectedCategory &&
      (query.trim() === "" ||
        t.label.toLowerCase().includes(query.toLowerCase()) ||
        t.subject.toLowerCase().includes(query.toLowerCase()))
  );

  const currentTemplate = templates.find((t) => t.name === selectedTemplate) ?? null;

  // ── Fetch rendered HTML from API ─────────────────────────────────────────────
  const loadTemplate = useCallback(async (name: string, theme: PreviewTheme = previewTheme) => {
    // Cancel any in-flight request
    if (abortRef.current) {
      abortRef.current.abort();
    }
    const controller = new AbortController();
    abortRef.current = controller;

    setSelectedTemplate(name);
    setLoading(true);
    setError(null);
    setHtml("");

    try {
      const res = await fetch(
        `/api/admin/emails/render?template=${encodeURIComponent(name)}&theme=${theme}`,
        { signal: controller.signal }
      );
      if (!res.ok) {
        const json = await res.json().catch(() => ({ error: "Render failed" }));
        throw new Error(json.error ?? `HTTP ${res.status}`);
      }
      const rendered = await res.text();
      setHtml(rendered);
    } catch (err: unknown) {
      if (err instanceof Error && err.name === "AbortError") return;
      setError(err instanceof Error ? err.message : "Failed to render template");
    } finally {
      setLoading(false);
    }
  }, [previewTheme]);

  // ── Auto-select first template when category changes ─────────────────────────
  useEffect(() => {
    const first = templates.find((t) => t.category === selectedCategory);
    if (first) {
      loadTemplate(first.name);
    } else {
      setSelectedTemplate(null);
      setHtml("");
    }
    setQuery("");
  }, [selectedCategory]);

  // ── Copy subject to clipboard ────────────────────────────────────────────────
  async function copySubject() {
    if (!currentTemplate) return;
    await navigator.clipboard.writeText(currentTemplate.subject);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  // ── Open in new tab ──────────────────────────────────────────────────────────
  function openInTab() {
    if (!selectedTemplate) return;
    window.open(
      `/api/admin/emails/render?template=${encodeURIComponent(selectedTemplate)}&theme=${previewTheme}`,
      "_blank",
      "noopener,noreferrer"
    );
  }

  // ── Preview theme toggle ─────────────────────────────────────────────────────
  function togglePreviewTheme() {
    const next: PreviewTheme = previewTheme === "light" ? "dark" : "light";
    setPreviewTheme(next);
    if (selectedTemplate) loadTemplate(selectedTemplate, next);
  }

  async function sendTest() {
    if (!selectedTemplate || !sendTo.trim()) return;
    setSending(true);
    setSendResult(null);
    try {
      const res = await fetch("/api/admin/emails/send-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selectedTemplate, to: sendTo.trim() }),
      });
      const json = await res.json().catch(() => ({ error: "Unexpected response" }));
      if (res.ok) {
        setSendResult({ ok: true, msg: `Sent! ID: ${json.messageId ?? "unknown"}` });
      } else {
        setSendResult({ ok: false, msg: json.error ?? `HTTP ${res.status}` });
      }
    } catch {
      setSendResult({ ok: false, msg: "Network error — check your connection" });
    } finally {
      setSending(false);
    }
  }

  // ─────────────────────────────────────────────────────────────────────────────
  // Layout: category panel | template list | preview
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-[calc(100vh-120px)] min-h-150 overflow-hidden rounded-xl border border-border bg-background">

      {/* ── Panel 1: Category selector ────────────────────────────────────────── */}
      <aside className="flex w-48 shrink-0 flex-col border-r border-border bg-muted/30">
        {/* Header */}
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Categories
            </span>
          </div>
        </div>

        {/* Category pills */}
        <nav className="flex flex-col gap-0.5 p-2">
          {categories.map((cat) => {
            const isActive = cat.key === selectedCategory;
            return (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition-colors ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <span className="text-sm font-medium">{cat.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.5 text-xs font-semibold tabular-nums ${
                    isActive ? "bg-primary/20 text-primary" : cat.color + " " + cat.textColor
                  }`}
                >
                  {countByCategory[cat.key] ?? 0}
                </span>
              </button>
            );
          })}
        </nav>

        {/* Total count footer */}
        <div className="mt-auto border-t border-border px-4 py-3">
          <p className="text-xs text-muted-foreground">
            {templates.length} templates total
          </p>
        </div>
      </aside>

      {/* ── Panel 2: Template list ────────────────────────────────────────────── */}
      <aside className="flex w-64 shrink-0 flex-col border-r border-border bg-background">
        {/* Search */}
        <div className="border-b border-border p-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search templates…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full rounded-md border border-border bg-muted/30 py-1.5 pl-8 pr-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
          </div>
        </div>

        {/* Template buttons */}
        <div className="flex-1 overflow-y-auto py-1">
          {filteredTemplates.length === 0 ? (
            <p className="px-4 py-6 text-center text-xs text-muted-foreground">
              No templates match "{query}"
            </p>
          ) : (
            filteredTemplates.map((t) => {
              const isActive = t.name === selectedTemplate;
              return (
                <button
                  key={t.name}
                  onClick={() => loadTemplate(t.name)}
                  className={`flex w-full items-start gap-2 px-3 py-2.5 text-left transition-colors ${
                    isActive
                      ? "border-l-2 border-primary bg-primary/5"
                      : "border-l-2 border-transparent hover:bg-muted/50"
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <p
                      className={`truncate text-sm font-medium ${
                        isActive ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {t.label}
                    </p>
                    <p className="mt-0.5 truncate text-[11px] text-muted-foreground">
                      {t.subject}
                    </p>
                  </div>
                  {isActive && (
                    <ChevronRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Panel 3: Email preview ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
        <div className="flex shrink-0 items-center justify-between border-b border-border bg-background px-4 py-2.5">
          {/* Template info */}
          <div className="min-w-0 flex-1">
            {currentTemplate ? (
              <>
                <div className="flex items-center gap-2">
                  <h2 className="truncate text-sm font-semibold text-foreground">
                    {currentTemplate.label}
                  </h2>
                  {/* Category badge */}
                  {(() => {
                    const cat = categories.find(
                      (c) => c.key === currentTemplate.category
                    );
                    return cat ? (
                      <span
                        className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${cat.color} ${cat.textColor}`}
                      >
                        {cat.label}
                      </span>
                    ) : null;
                  })()}
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  <span className="font-medium text-foreground/60">Subject:</span>{" "}
                  {currentTemplate.subject}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                Select a template to preview
              </p>
            )}
          </div>

          {/* Controls */}
          <div className="ml-4 flex shrink-0 items-center gap-2">
            {/* Send Test */}
            <div className="relative" ref={sendPanelRef}>
              <button
                onClick={() => {
                  setSendOpen((o) => !o);
                  setSendResult(null);
                }}
                disabled={!currentTemplate}
                title="Send test email to an inbox"
                className={`flex h-8 items-center gap-1.5 rounded-md border px-2.5 text-xs transition-colors disabled:pointer-events-none disabled:opacity-40 ${
                  sendOpen
                    ? "border-primary/60 bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Send className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Send Test</span>
              </button>

              {/* Inline popover panel */}
              {sendOpen && (
                <div className="absolute right-0 top-10 z-50 w-72 rounded-lg border border-border bg-background p-3 shadow-lg ring-1 ring-black/5">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-foreground">Send test email</p>
                    <button
                      onClick={() => setSendOpen(false)}
                      className="rounded p-0.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  <p className="mb-2 text-[11px] text-muted-foreground">
                    Sends <span className="font-medium text-foreground">{currentTemplate?.label}</span> using preview data to the address below.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={sendTo}
                      onChange={(e) => {
                        setSendTo(e.target.value);
                        setSendResult(null);
                      }}
                      placeholder="recipient@example.com"
                      className="flex-1 rounded-md border border-border bg-muted/30 px-2.5 py-1.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                    <button
                      onClick={sendTest}
                      disabled={sending || !sendTo.trim()}
                      className="flex h-8 items-center gap-1.5 rounded-md bg-primary px-3 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-50"
                    >
                      {sending ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Send className="h-3.5 w-3.5" />
                      )}
                      {sending ? "Sending…" : "Send"}
                    </button>
                  </div>

                  {/* Result feedback */}
                  {sendResult && (
                    <p
                      className={`mt-2 text-[11px] ${
                        sendResult.ok ? "text-green-600 dark:text-green-400" : "text-destructive"
                      }`}
                    >
                      {sendResult.msg}
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Copy subject */}
            <button
              onClick={copySubject}
              disabled={!currentTemplate}
              title="Copy subject line"
              className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-600" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied" : "Copy subject"}
            </button>

            {/* Open in new tab */}
            <button
              onClick={openInTab}
              disabled={!currentTemplate}
              title="Open full HTML in new tab"
              className="flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Open
            </button>

            {/* Preview theme toggle */}
            <button
              onClick={togglePreviewTheme}
              title={previewTheme === "light" ? "Switch to dark canvas" : "Switch to light canvas"}
              className={`flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs transition-colors ${
                previewTheme === "dark"
                  ? "bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {previewTheme === "dark" ? (
                <Sun className="h-3.5 w-3.5" />
              ) : (
                <Moon className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {previewTheme === "dark" ? "Light" : "Dark"}
              </span>
            </button>

            {/* Viewport toggle */}
            <div className="flex overflow-hidden rounded-md border border-border">
              <button
                onClick={() => setViewport("desktop")}
                title="Desktop view (600px)"
                className={`flex h-8 items-center gap-1.5 px-2.5 text-xs transition-colors ${
                  viewport === "desktop"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Monitor className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                onClick={() => setViewport("mobile")}
                title="Mobile view (375px)"
                className={`flex h-8 items-center gap-1.5 border-l border-border px-2.5 text-xs transition-colors ${
                  viewport === "mobile"
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <Smartphone className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>
        </div>

        {/* ── Preview area ─────────────────────────────────────────────────────── */}
        <div
          className={`flex flex-1 items-start justify-center overflow-auto p-6 transition-colors duration-200 ${
            previewTheme === "dark" ? "bg-[#1c1c1c]" : "bg-muted/40"
          }`}
        >
          {/* Loading state */}
          {loading && (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <Loader2 className="h-6 w-6 animate-spin" />
              <p className="text-sm">Rendering template…</p>
            </div>
          )}

          {/* Error state */}
          {!loading && error && (
            <div className="flex flex-col items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-8 py-10 text-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
              <p className="text-sm font-medium text-destructive">Render failed</p>
              <p className="max-w-xs text-xs text-destructive/70">{error}</p>
              <button
                onClick={() => selectedTemplate && loadTemplate(selectedTemplate)}
                className="mt-2 rounded-md border border-destructive/40 px-3 py-1.5 text-xs text-destructive transition-colors hover:bg-destructive/10"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && !html && (
            <div className="flex flex-col items-center gap-3 py-20 text-muted-foreground">
              <Mail className="h-8 w-8 opacity-30" />
              <p className="text-sm">No template selected</p>
            </div>
          )}

          {/* Email iframe */}
          {!loading && !error && html && (
            <div
              className="overflow-hidden rounded-lg shadow-lg ring-1 ring-border transition-all duration-200"
              style={{
                width: viewport === "desktop" ? "640px" : "375px",
                flexShrink: 0,
              }}
            >
              <iframe
                srcDoc={html}
                title={currentTemplate?.label ?? "Email preview"}
                className="block w-full"
                style={{ height: "800px", border: "none" }}
                sandbox="allow-same-origin"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
