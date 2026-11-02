export const CASE_STATES = [
  "draft",
  "submitted",
  "ai_precheck",
  "desk_review",
  "field_assigned",
  "field_in_progress",
  "field_complete",
  "reconciliation",
  "human_review",
  "verified",
  "correction",
  "rejected",
] as const;

export type CaseState = (typeof CASE_STATES)[number];

export type CaseEvent =
  | "submit"
  | "precheck"
  | "desk"
  | "assign"
  | "start_field"
  | "check_in"
  | "reconcile"
  | "claims_clear"
  | "claims_blocked"
  | "approve"
  | "correct"
  | "reject";

const LATER = new Set<string>([
  "field_assigned",
  "field_in_progress",
  "field_complete",
  "reconciliation",
  "human_review",
  "verified",
  "correction",
  "rejected",
]);

function kept(current: string | null): CaseState {
  if (current && (CASE_STATES as readonly string[]).includes(current)) return current as CaseState;
  return "draft";
}

export function nextCaseState(current: string | null, event: CaseEvent): CaseState {
  if (event === "submit") {
    if (current === null || current === "draft") return "submitted";
    return kept(current);
  }
  if (event === "precheck") {
    if (current === null || current === "draft" || current === "submitted") return "ai_precheck";
    return kept(current);
  }
  if (event === "desk") {
    if (current === null || current === "draft" || current === "submitted" || current === "ai_precheck") return "desk_review";
    return kept(current);
  }
  if (event === "assign") {
    if (current === "desk_review" || current === null) return "field_assigned";
    return kept(current);
  }
  if (event === "start_field") {
    if (current === "field_assigned") return "field_in_progress";
    return kept(current);
  }
  if (event === "check_in") {
    if (current === "field_assigned" || current === "field_in_progress" || current === null) return "field_complete";
    return kept(current);
  }
  if (event === "reconcile") {
    if (current === "field_complete" || current === "field_assigned" || current === "field_in_progress") return "reconciliation";
    return kept(current);
  }
  if (event === "claims_clear") {
    if (current === "reconciliation") return "human_review";
    return kept(current);
  }
  if (event === "claims_blocked") {
    if (current === "verified" || current === "rejected" || current === "correction") return kept(current);
    return "reconciliation";
  }
  if (event === "approve") {
    if (current === "human_review") return "verified";
    return kept(current);
  }
  if (event === "correct") return "correction";
  if (event === "reject") return "rejected";
  return LATER.has(current ?? "") ? kept(current) : "draft";
}

const STATE_LABELS: Record<string, string> = {
  draft: "Draft",
  submitted: "Submitted",
  ai_precheck: "AI precheck",
  desk_review: "Desk review",
  field_assigned: "Field assigned",
  field_in_progress: "Field in progress",
  field_complete: "Field complete",
  reconciliation: "Reconciliation",
  human_review: "Human review",
  verified: "Verified",
  correction: "Correction",
  rejected: "Rejected",
};

export function caseStateLabel(state: string | null): string {
  if (!state) return "Not opened";
  return STATE_LABELS[state] ?? state;
}

const EVIDENCE_LABELS: Record<string, string> = {
  distanceMeters: "Distance from the pin",
  sawBuilding: "Building seen",
  addressMatches: "Address matches",
  documentMatches: "Document matches",
  checkedInAt: "Checked in",
  address: "Address",
  propertyType: "Property type",
  description: "Description",
  addressDocument: "Document address",
  holder: "Document holder",
  title: "Registry title",
  reference: "Registry file",
  matches: "Registry file matches",
};

function evidenceValue(key: string, value: unknown): string {
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (key === "checkedInAt" && typeof value === "string") {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) {
      return `${parsed.toLocaleString("en-NG", { timeZone: "Africa/Lagos" })} Lagos`;
    }
  }
  if (key === "distanceMeters" && typeof value === "number") return `${Math.round(value)} metres`;
  if (value === null || value === undefined || value === "") return "Not recorded";
  return String(value);
}

export function evidenceLines(layer: string, body: Record<string, unknown>): Array<{ label: string; value: string }> {
  return Object.entries(publicEvidenceBody(layer, body)).map(([key, value]) => ({
    label: EVIDENCE_LABELS[key] ?? key,
    value: evidenceValue(key, value),
  }));
}

export function publicEvidenceBody(layer: string, body: Record<string, unknown>): Record<string, unknown> {
  if (layer === "physical") {
    return {
      distanceMeters: body.distanceMeters ?? null,
      sawBuilding: body.sawBuilding ?? null,
      addressMatches: body.addressMatches ?? null,
      documentMatches: body.documentMatches ?? null,
      checkedInAt: body.checkedInAt ?? null,
    };
  }
  const next = { ...body };
  delete next.latitude;
  delete next.longitude;
  delete next.photoPath;
  delete next.holderName;
  return next;
}
