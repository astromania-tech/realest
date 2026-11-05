export type RegistryConfirmation = {
  reference: string | null;
  matches: boolean | null;
};

export type RegistryMode = { mode: "manual"; url: null } | { mode: "remote"; url: string };

export function landRegistryMode(source: string | null | undefined = process.env.LAND_REGISTRY_URL): RegistryMode {
  const url = source?.trim() ?? "";
  if (!url) return { mode: "manual", url: null };
  return { mode: "remote", url };
}

export function registryConfirmationAllowed(reference: string): { ok: true; reference: string } | { ok: false; error: string } {
  const cleaned = reference.trim();
  if (cleaned.length < 3) {
    return { ok: false, error: "Enter the registry file number you checked." };
  }
  return { ok: true, reference: cleaned };
}

export function registryTitleFinding(input: {
  confirmation: RegistryConfirmation | null;
  mode: RegistryMode;
}): {
  point: "title";
  status: "supported" | "contradicted" | "insufficient";
  claim: string;
  evidence: string;
} {
  const later = input.mode.mode === "remote"
    ? "The registry URL is saved for a later connection and was not called."
    : "No registry URL is connected yet.";
  const claim = "A state land registry confirms this title.";
  const reference = input.confirmation?.reference?.trim() ?? "";
  if (!reference || input.confirmation?.matches === null || input.confirmation?.matches === undefined) {
    return {
      point: "title",
      status: "insufficient",
      claim,
      evidence: `A person has not confirmed this file against the registry. ${later}`,
    };
  }
  if (!input.confirmation.matches) {
    return {
      point: "title",
      status: "contradicted",
      claim,
      evidence: `The registry file ${reference} does not match this listing. ${later}`,
    };
  }
  return {
    point: "title",
    status: "supported",
    claim,
    evidence: `A person confirmed registry file ${reference}. ${later}`,
  };
}
