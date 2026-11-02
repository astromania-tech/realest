/**
 * Field officer ops location + load.
 * Hard gate: officer state must match property state (admin may override).
 * Soft: prefer same LGA / city and lowest unfinished visit count.
 */

export const MAX_OPEN_VISITS_SOFT = 3;

export type StaffOpsLocation = {
  state: string;
  stateCode: string | null;
  lga: string;
};

export type OfficerCandidate = {
  id: string;
  full_name: string | null;
  role: string;
  state: string | null;
  lga: string | null;
  openVisits: number;
  geoMatch: "state_lga" | "state" | "none" | "unknown";
  recommended: boolean;
  overload: boolean;
};

export function normalizePlace(value: string | null | undefined): string {
  return (value ?? "").trim().toLowerCase().replace(/\s+/g, " ");
}

export function placesEqual(a: string | null | undefined, b: string | null | undefined): boolean {
  const left = normalizePlace(a);
  const right = normalizePlace(b);
  return Boolean(left) && left === right;
}

/** Read operating territory from users.ops_* columns (source of truth). */
export function readStaffOpsLocation(user: {
  ops_state?: string | null;
  ops_lga?: string | null;
  ops_state_code?: string | null;
} | null | undefined): StaffOpsLocation | null {
  if (!user) return null;
  const state = typeof user.ops_state === "string" ? user.ops_state.trim() : "";
  const lga = typeof user.ops_lga === "string" ? user.ops_lga.trim() : "";
  if (!state || !lga) return null;
  const stateCode =
    typeof user.ops_state_code === "string" && user.ops_state_code.trim()
      ? user.ops_state_code.trim().toUpperCase()
      : null;
  return { state, stateCode, lga };
}

export function staffOpsLocationInputAllowed(input: {
  state: string;
  lga: string;
  knownStateNames: string[];
}): { ok: true; state: string; lga: string } | { ok: false; error: string } {
  const state = input.state.trim();
  const lga = input.lga.trim();
  if (!state) return { ok: false, error: "Choose the officer's operating state." };
  const known = input.knownStateNames.some((name) => placesEqual(name, state));
  if (!known) return { ok: false, error: "Choose a valid Nigerian state." };
  if (lga.length < 2) return { ok: false, error: "Enter the officer's LGA." };
  return { ok: true, state, lga };
}

/** Soft geo score: higher is better. */
export function officerGeoMatch(input: {
  propertyState: string | null;
  propertyCity: string | null;
  officerState: string | null;
  officerLga: string | null;
}): OfficerCandidate["geoMatch"] {
  if (!input.officerState) return "unknown";
  if (!input.propertyState) return "unknown";
  if (!placesEqual(input.propertyState, input.officerState)) return "none";
  if (
    input.officerLga &&
    (placesEqual(input.officerLga, input.propertyCity) ||
      normalizePlace(input.propertyCity).includes(normalizePlace(input.officerLga)))
  ) {
    return "state_lga";
  }
  return "state";
}

export function officerGeoAllowed(input: {
  propertyState: string | null;
  officerState: string | null;
  actorRole: string;
  forceOverride: boolean;
}): { ok: true } | { ok: false; error: string; status: 400 | 403 } {
  if (!input.propertyState?.trim()) {
    return { ok: false, error: "This listing has no state. Fix the property location first.", status: 400 };
  }
  if (!input.officerState?.trim()) {
    return {
      ok: false,
      error: "That officer has no operating state/LGA. Re-invite or update their staff location.",
      status: 400,
    };
  }
  if (placesEqual(input.propertyState, input.officerState)) {
    return { ok: true };
  }
  if (input.forceOverride && input.actorRole === "admin") {
    return { ok: true };
  }
  return {
    ok: false,
    error: `That officer works in ${input.officerState}, not ${input.propertyState}. Pick someone in ${input.propertyState}, or an admin must override.`,
    status: 400,
  };
}

export function rankOfficersForProperty(input: {
  propertyState: string | null;
  propertyCity: string | null;
  officers: Array<{
    id: string;
    full_name: string | null;
    role: string;
    state: string | null;
    lga: string | null;
    openVisits: number;
  }>;
  maxOpenSoft?: number;
}): OfficerCandidate[] {
  const maxOpen = input.maxOpenSoft ?? MAX_OPEN_VISITS_SOFT;
  const ranked = input.officers.map((officer) => {
    const geoMatch = officerGeoMatch({
      propertyState: input.propertyState,
      propertyCity: input.propertyCity,
      officerState: officer.state,
      officerLga: officer.lga,
    });
    const overload = officer.openVisits >= maxOpen;
    const recommended =
      (geoMatch === "state" || geoMatch === "state_lga") && !overload;
    return {
      id: officer.id,
      full_name: officer.full_name,
      role: officer.role,
      state: officer.state,
      lga: officer.lga,
      openVisits: officer.openVisits,
      geoMatch,
      recommended,
      overload,
    };
  });

  const geoRank: Record<OfficerCandidate["geoMatch"], number> = {
    state_lga: 0,
    state: 1,
    unknown: 2,
    none: 3,
  };

  return ranked.sort((a, b) => {
    if (a.recommended !== b.recommended) return a.recommended ? -1 : 1;
    if (geoRank[a.geoMatch] !== geoRank[b.geoMatch]) {
      return geoRank[a.geoMatch] - geoRank[b.geoMatch];
    }
    if (a.openVisits !== b.openVisits) return a.openVisits - b.openVisits;
    return (a.full_name || "").localeCompare(b.full_name || "");
  });
}

export function pickAutoRecommendedOfficerIds(
  candidates: OfficerCandidate[],
  limit = 3,
): string[] {
  return candidates.filter((c) => c.recommended).slice(0, limit).map((c) => c.id);
}
