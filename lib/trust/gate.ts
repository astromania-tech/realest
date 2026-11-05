import type { TrustDecision } from "@/lib/trust/types";

export function readTrustDecision(result: unknown): TrustDecision | null {
  if (!result || typeof result !== "object" || !("trust" in result)) return null;
  const trust = (result as { trust?: TrustDecision }).trust;
  if (!trust || !Array.isArray(trust.hardBlocks) || !Array.isArray(trust.flags) || typeof trust.allowsVetting !== "boolean") {
    return null;
  }
  return trust;
}

export function adminApproveAllowed(input: {
  trust: TrustDecision | null;
  adminNotes: string | undefined;
}): { ok: true } | { ok: false; error: string; hardBlocks: string[]; flags: string[] } {
  if (!input.trust) {
    return {
      ok: false,
      error: "The trust reader has not finished this listing.",
      hardBlocks: [],
      flags: [],
    };
  }
  if (!input.trust.allowsVetting) {
    return {
      ok: false,
      error: "This listing stays in review until the failed check is replaced.",
      hardBlocks: input.trust.hardBlocks,
      flags: input.trust.flags,
    };
  }
  if (input.trust.flags.length > 0 && !input.adminNotes?.trim()) {
    return {
      ok: false,
      error: "A note is required before physical vetting because the reader raised a flag.",
      hardBlocks: [],
      flags: input.trust.flags,
    };
  }
  return { ok: true };
}
