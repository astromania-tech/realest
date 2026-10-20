export const VISIT_PIN_RADIUS_METERS = 50;

export const VISIT_TITLE_STATEMENT =
  "RealEST Verified means an officer stood at the pin. It does not prove title.";

export type VisitGate = {
  officerId: string | null;
  visitDay: string | null;
  checkedInAt: string | null;
  voidedAt: string | null;
  photoPath: string | null;
  distanceMeters: number | null;
  sawBuilding: boolean | null;
  addressMatches: boolean | null;
  documentMatches: boolean | null;
  openIssue: string | null;
  caseState: string | null;
};

export type PublicVisitRecord = {
  visitedAt: string | null;
  checked: string[];
  statement: string;
};

export function observationConflicts(input: {
  sawBuilding: boolean;
  addressMatches: boolean;
  documentMatches: boolean;
  distanceMeters: number;
}): string[] {
  const conflicts: string[] = [];
  if (!input.sawBuilding) conflicts.push("The officer did not see the building.");
  if (!input.addressMatches) conflicts.push("The address at the gate does not match the listing.");
  if (!input.documentMatches) conflicts.push("The document does not match what is at the pin.");
  if (input.distanceMeters > VISIT_PIN_RADIUS_METERS) {
    conflicts.push("The check-in is more than 50 metres from the pin.");
  }
  return conflicts;
}

export function badgeWriteAllowed(input: VisitGate): { ok: true } | { ok: false; error: string } {
  if (!input.officerId || !input.visitDay) {
    return { ok: false, error: "Assign one officer and a visit day before approving the visit." };
  }
  if (input.voidedAt || !input.checkedInAt || !input.photoPath) {
    return { ok: false, error: "Check in at the pin with a photo before approving the visit." };
  }
  if (input.distanceMeters === null || input.distanceMeters > VISIT_PIN_RADIUS_METERS) {
    return { ok: false, error: "The check-in is more than 50 metres from the pin." };
  }
  if (input.sawBuilding !== true || input.addressMatches !== true || input.documentMatches !== true) {
    return { ok: false, error: "The observation does not match the listing, the document, and the pin." };
  }
  if (input.openIssue?.trim()) {
    return { ok: false, error: "An open issue blocks the badge until the file is replaced." };
  }
  if (input.caseState !== "human_review") {
    return { ok: false, error: "Human review stays closed until reconciliation has no contradicted point." };
  }
  return { ok: true };
}

export function deviceCheckInAllowed(input: {
  locationSource: string | null;
  accuracyMeters: number | null;
}): { ok: true } | { ok: false; error: string } {
  if (input.locationSource !== "device") {
    return { ok: false, error: "Check in from the officer's phone. Typed coordinates are refused." };
  }
  if (input.accuracyMeters === null || !Number.isFinite(input.accuracyMeters) || input.accuracyMeters < 0 || input.accuracyMeters > VISIT_PIN_RADIUS_METERS) {
    return { ok: false, error: "The phone GPS is not accurate enough. Stand at the pin and try again." };
  }
  return { ok: true };
}

export function checkInDistanceAllowed(distanceMeters: number): boolean {
  return Number.isFinite(distanceMeters) && distanceMeters >= 0 && distanceMeters <= VISIT_PIN_RADIUS_METERS;
}

export function correctionReplacementAllowed(input: {
  status: string;
  correctionDocumentType: string | null;
  uploadedType: string;
}): { ok: true } | { ok: false; error: string } {
  if (input.status !== "pending_correction") return { ok: true };
  if (!input.correctionDocumentType) {
    return { ok: false, error: "This listing is not waiting on a file." };
  }
  if (input.uploadedType !== input.correctionDocumentType) {
    return { ok: false, error: "Replace the file that was sent back. The other files stay." };
  }
  return { ok: true };
}

export function publicVisitRecord(input: {
  verified: boolean;
  checkedInAt: string | null;
  voidedAt: string | null;
  photoPath: string | null;
  distanceMeters: number | null;
}): PublicVisitRecord | null {
  if (!input.verified) return null;
  const checkedIn =
    Boolean(input.checkedInAt) &&
    !input.voidedAt &&
    Boolean(input.photoPath) &&
    input.distanceMeters !== null &&
    input.distanceMeters <= VISIT_PIN_RADIUS_METERS;
  return {
    visitedAt: checkedIn ? input.checkedInAt : null,
    checked: checkedIn ? ["document gate", "officer at the pin", "photo at the gate"] : [],
    statement: VISIT_TITLE_STATEMENT,
  };
}
