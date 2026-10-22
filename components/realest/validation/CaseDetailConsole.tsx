"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Bot, MapPin, Users2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CaseFindingsTable } from "@/components/realest/validation/CaseFindingsTable";
import { TrustReviewActions } from "@/components/realest/validation/TrustReviewActions";
import { VettingDecisionActions } from "@/components/realest/validation/VettingDecisionActions";
import { DuplicateResolutionActions } from "@/components/realest/validation/DuplicateResolutionActions";
import { FieldTeamPanel } from "@/components/realest/validation/FieldTeamPanel";
import { FieldTeamManageModal } from "@/components/realest/validation/FieldTeamManageModal";
import type { CaseDetailView } from "@/lib/trust/case-view";

type Officer = { id: string; full_name: string | null };

const CASE_TABS = ["Overview", "Claims", "Evidence", "Field visit", "Timeline", "Decision"] as const;

function initialCaseTab(requested: string | null | undefined): string {
  if (requested && (CASE_TABS as readonly string[]).includes(requested)) return requested;
  return "Overview";
}

export function CaseDetailConsole({
  detail,
  officers,
  canApprove,
  blockReason,
  conflicts,
  initialTab,
}: {
  detail: CaseDetailView;
  officers: Officer[];
  canApprove: boolean;
  blockReason: string | null;
  conflicts: string[];
  initialTab?: string | null;
}) {
  const [tab, setTab] = useState(() => initialCaseTab(initialTab));
  const [teamModalOpen, setTeamModalOpen] = useState(false);
  const tone =
    detail.listingStatus === "live" || detail.caseState === "verified"
      ? "success"
      : detail.listingStatus === "rejected" || detail.caseState === "rejected"
        ? "destructive"
        : detail.priority === "High"
          ? "warning"
          : "secondary";

  return (
    <div className="min-w-0">
      <Link
        href="/admin/validation"
        className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4 shrink-0" />
        All verification cases
      </Link>

      <section className="rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-6">
        <div className="flex flex-col justify-between gap-5 xl:flex-row">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={tone === "success" ? "default" : tone === "destructive" ? "destructive" : "secondary"}>
                {detail.caseStateLabel}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">{detail.id.slice(0, 8)}…</span>
              <Badge variant="outline">{detail.priority} priority</Badge>
            </div>
            <h1 className="mt-3 break-words font-heading text-2xl text-[#07402F] dark:text-foreground sm:text-3xl">
              {detail.title}
            </h1>
            <p className="mt-1 flex items-start gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              <span className="break-words">
                {detail.address}, {detail.city}
              </span>
            </p>
            {detail.ownerName ? (
              <p className="mt-1 text-sm text-muted-foreground">Owner: {detail.ownerName}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-xl border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">Risk</p>
              <p className="mt-1 font-semibold">{detail.risk}</p>
            </div>
            <div className="rounded-xl border border-border px-4 py-3">
              <p className="text-xs text-muted-foreground">Evidence coverage</p>
              <p className="mt-1 font-semibold">{detail.evidenceCoverage}%</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Field officer</p>
            <p className="mt-2 text-sm font-semibold">{detail.officerName ?? "Unassigned"}</p>
          </div>
          <div className="rounded-xl bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Listing status</p>
            <p className="mt-2 text-sm font-semibold">{detail.listingStatus}</p>
          </div>
          <div className="rounded-xl bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Evidence</p>
            <p className="mt-2 text-sm font-semibold">{detail.evidence.length} records</p>
            <Progress value={detail.evidenceCoverage} className="mt-2 h-1.5" />
          </div>
          <div className="rounded-xl bg-secondary p-4">
            <p className="text-xs text-muted-foreground">Price</p>
            <p className="mt-2 text-sm font-semibold">{detail.priceNaira}</p>
          </div>
        </div>

        {detail.fieldBrief ? (
          <div className="mt-5 rounded-xl border border-warning/25 bg-warning/10 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.1em] text-warning">Field brief</p>
            <p className="mt-2 text-sm leading-6">{detail.fieldBrief}</p>
          </div>
        ) : null}
      </section>

      <Tabs value={tab} onValueChange={setTab} className="mt-7">
        <div className="overflow-x-auto">
          <TabsList className="h-auto min-w-max gap-1 bg-transparent p-0">
            {CASE_TABS.map((label) => (
              <TabsTrigger
                key={label}
                value={label}
                className="rounded-lg border border-transparent px-3 py-2 text-xs data-[state=active]:border-border data-[state=active]:bg-card sm:text-sm"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value="Overview" className="mt-6">
          {detail.listingStatus === "pending_vetting" ? (
            <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
              <div className="flex items-start gap-3">
                <Users2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <p className="text-sm font-semibold">
                    {detail.officerName ? "Field team in progress" : "Needs a team leader"}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Assign a team leader on the Field visit tab (or from Field ops). The leader
                    confirms members and the check-in officer.
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant={detail.officerName ? "outline" : "default"}
                className="w-full sm:w-auto"
                onClick={() => {
                  setTab("Field visit");
                  if (!detail.officerName) setTeamModalOpen(true);
                }}
              >
                <Users2 className="mr-1.5 h-3.5 w-3.5" />
                {detail.officerName ? "Open Field visit" : "Assign team leader"}
              </Button>
            </div>
          ) : null}
          <div className="grid gap-6 xl:grid-cols-[1.6fr_0.8fr]">
            <section className="rounded-2xl border border-border bg-card p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Reconciliation
              </p>
              <h2 className="mt-1 text-lg font-semibold">Evidence-backed findings</h2>
              <div className="mt-5">
                <CaseFindingsTable findings={detail.findings} />
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-accent-foreground">
                  <Bot className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">AI / reader recommendation</p>
                  <p className="text-xs text-muted-foreground">Structured, not final</p>
                </div>
              </div>
              <div className="mt-5 rounded-xl border border-warning/25 bg-warning/10 p-4">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-warning">
                  Human decision required
                </p>
                <p className="mt-2 text-sm leading-5 text-muted-foreground">
                  AI and the trust reader cannot certify ownership or independently approve this case.
                  RealEST Verified is written only after a person stands at the pin.
                </p>
              </div>
              {detail.description ? (
                <p className="mt-4 text-sm text-muted-foreground">{detail.description}</p>
              ) : null}
            </section>
          </div>
        </TabsContent>

        <TabsContent value="Claims" className="mt-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Claims</h2>
            <div className="mt-5">
              <CaseFindingsTable findings={detail.findings} />
            </div>
          </section>
        </TabsContent>

        <TabsContent value="Evidence" className="mt-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Immutable evidence record</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {detail.evidence.map((item) => (
                <div key={item.id} className="rounded-xl border border-border p-4">
                  <p className="font-mono text-xs text-muted-foreground">
                    {item.id} · {item.kind}
                  </p>
                  <p className="mt-2 text-sm font-semibold">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.capturedAt}</p>
                  <p className="mt-3 text-xs text-muted-foreground">Supports: {item.supports}</p>
                </div>
              ))}
              {detail.documents.map((doc) => (
                <div key={doc.id} className="rounded-xl border border-border p-4">
                  <p className="font-mono text-xs text-muted-foreground">Document · {doc.document_type}</p>
                  <p className="mt-2 text-sm font-semibold">{doc.file_name}</p>
                  <a className="mt-3 inline-block text-xs text-primary underline" href={doc.document_url} target="_blank" rel="noopener noreferrer">
                    Open file
                  </a>
                </div>
              ))}
              {detail.evidence.length === 0 && detail.documents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No evidence recorded yet.</p>
              ) : null}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="Field visit" className="mt-6">
          <div className="grid gap-6 xl:grid-cols-2">
            <section className="space-y-3 rounded-2xl border border-border bg-card p-4 text-sm sm:p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-lg font-semibold">Visit record</h2>
                {detail.listingStatus === "pending_vetting" ? (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full sm:w-auto"
                    onClick={() => setTeamModalOpen(true)}
                  >
                    <Users2 className="mr-1.5 h-3.5 w-3.5" />
                    Manage field team
                  </Button>
                ) : null}
              </div>
              <p>Check-in officer: {detail.officerName ?? "Unassigned"}</p>
              <p>Visit day: {detail.visit.visitDay ?? "—"}</p>
              <p>Checked in: {detail.visit.checkedInAt ?? "—"}</p>
              <p>
                Distance:{" "}
                {detail.visit.distanceMeters === null
                  ? "—"
                  : `${Math.round(detail.visit.distanceMeters)} m`}
              </p>
              <p>Saw building: {detail.visit.sawBuilding === null ? "—" : detail.visit.sawBuilding ? "Yes" : "No"}</p>
              <p>
                Address matches:{" "}
                {detail.visit.addressMatches === null ? "—" : detail.visit.addressMatches ? "Yes" : "No"}
              </p>
              {detail.visit.openIssue ? <p className="text-destructive">Open issue: {detail.visit.openIssue}</p> : null}
              {detail.visit.officerId ? (
                <Link className="inline-flex text-primary underline" href={`/field/visit/${detail.id}`}>
                  Open phone check-in
                </Link>
              ) : null}
            </section>
            {detail.listingStatus === "pending_vetting" ? (
              <section className="hidden rounded-2xl border border-border bg-card p-5 xl:block">
                <FieldTeamPanel propertyId={detail.id} />
              </section>
            ) : null}
          </div>
        </TabsContent>

        <TabsContent value="Timeline" className="mt-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <h2 className="text-lg font-semibold">Audit trail</h2>
            <ol className="mt-5 space-y-4">
              {detail.audit.map((event) => (
                <li className="flex gap-3" key={event.id}>
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full bg-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">{event.time}</p>
                    <p className="text-sm font-semibold">{event.title}</p>
                    <p className="text-xs text-muted-foreground">{event.detail}</p>
                  </div>
                </li>
              ))}
              {detail.audit.length === 0 ? (
                <p className="text-sm text-muted-foreground">No staff actions logged yet.</p>
              ) : null}
            </ol>
          </section>
        </TabsContent>

        <TabsContent value="Decision" className="mt-6">
          <section className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
              Human checkpoint
            </p>
            <h2 className="mt-1 text-lg font-semibold">Final review</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              Verification requires complete evidence and resolved critical discrepancies. Decisions
              stay auditable and do not overwrite existing evidence.
            </p>
            <div className="mt-5">
              {detail.listingStatus === "pending_ml_validation" ? (
                <TrustReviewActions propertyId={detail.id} allowsVetting={detail.trustAllowsVetting} />
              ) : null}
              {detail.listingStatus === "pending_vetting" ? (
                <VettingDecisionActions
                  propertyId={detail.id}
                  officers={officers}
                  assignedOfficerId={detail.visit.officerId}
                  visitDay={detail.visit.visitDay}
                  documents={detail.documents}
                  canApprove={canApprove}
                  blockReason={blockReason}
                  conflicts={conflicts}
                  openIssue={detail.visit.openIssue}
                  registryReference={detail.visit.registryReference}
                  registryMatches={detail.visit.registryMatches}
                />
              ) : null}
              {detail.listingStatus === "pending_duplicate_review" ? (
                <DuplicateResolutionActions propertyId={detail.id} />
              ) : null}
              {detail.listingStatus === "live" || detail.listingStatus === "rejected" ? (
                <p className="text-sm text-muted-foreground">This case already has a terminal listing status.</p>
              ) : null}
            </div>
          </section>
        </TabsContent>
      </Tabs>

      <FieldTeamManageModal
        isOpen={teamModalOpen}
        onClose={() => setTeamModalOpen(false)}
        propertyId={detail.id}
        propertyTitle={detail.title}
      />
    </div>
  );
}
