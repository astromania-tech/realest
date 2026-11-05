import { addressesMatch, haversineMeters } from "@/lib/trust/compare";
import { listingRejectNoteAllowed } from "@/lib/trust/listing-reject-note";
import { DUPLICATE_CANDIDATE_STATUSES, DUPLICATE_RADIUS_METERS } from "@/lib/trust/types";

export type DuplicateMatchReason = "duplicate_address" | "duplicate_pin";

export type DuplicateCandidate = {
  id: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
};

export type DuplicateMatch = {
  id: string;
  reason: DuplicateMatchReason;
  meters: number | null;
};

const candidateStatuses = new Set<string>(DUPLICATE_CANDIDATE_STATUSES);

export function selectDuplicateMatches(input: {
  address: string;
  latitude: number | null;
  longitude: number | null;
  candidates: DuplicateCandidate[];
}): DuplicateMatch[] {
  const matches: DuplicateMatch[] = [];
  for (const candidate of input.candidates) {
    if (!candidateStatuses.has(candidate.status)) continue;
    const addressHit = addressesMatch(input.address, candidate.address);
    let meters: number | null = null;
    let pinHit = false;
    if (
      input.latitude !== null &&
      input.longitude !== null &&
      candidate.latitude !== null &&
      candidate.longitude !== null
    ) {
      meters = haversineMeters(input.latitude, input.longitude, candidate.latitude, candidate.longitude);
      pinHit = meters <= DUPLICATE_RADIUS_METERS;
    }
    if (!addressHit && !pinHit) continue;
    matches.push({
      id: candidate.id,
      reason: addressHit ? "duplicate_address" : "duplicate_pin",
      meters,
    });
  }
  return matches;
}

export function matchedPropertyIdsFromResult(result: unknown): string[] {
  if (!result || typeof result !== "object") return [];
  const record = result as {
    matchedPropertyIds?: unknown;
    duplicateResult?: { matchedPropertyIds?: unknown };
  };
  const raw = record.duplicateResult?.matchedPropertyIds ?? record.matchedPropertyIds;
  if (!Array.isArray(raw)) return [];
  return raw.filter((id): id is string => typeof id === "string" && id.length > 0);
}

export function duplicateRejectAllowed(notes: string | undefined): { ok: true } | { ok: false; error: string } {
  const gate = listingRejectNoteAllowed(notes, {
    label: "reject a listing as a duplicate",
  });
  if (!gate.ok) return gate;
  return { ok: true };
}
