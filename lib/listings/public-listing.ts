export const publicListingWhere = {
  status: "live",
  verification_status: "verified",
} as const;

export function publicListingPath(id: string, listingSource: string | null | undefined): string {
  return listingSource === "agent" ? `/listing/${id}` : `/property/${id}`;
}

export function isPublicListing(row: {
  status?: string | null;
  verification_status?: string | null;
}): boolean {
  return row.status === "live" && row.verification_status === "verified";
}

export function publicPersonCard(person: {
  id: string;
  full_name: string | null;
  avatar_url?: string | null;
} | null): { id: string; full_name: string | null; avatar_url: string | null } | null {
  if (!person) return null;
  return {
    id: person.id,
    full_name: person.full_name,
    avatar_url: person.avatar_url ?? null,
  };
}

type ProfileShape = { phone?: unknown; email?: unknown; [key: string]: unknown };

function stripProfile<T extends { profiles?: ProfileShape | null }>(party: T | null | undefined): T | null | undefined {
  if (!party?.profiles) return party;
  const { phone: _phone, email: _email, ...rest } = party.profiles;
  return { ...party, profiles: rest };
}

export function propertyForViewer<T extends {
  property_documents?: unknown;
  inquiries?: unknown;
  owners?: { profiles?: ProfileShape | null } | null;
  agents?: { profiles?: ProfileShape | null } | null;
}>(property: T, viewer: "public" | "private"): T {
  if (viewer === "private") return property;
  const next = { ...property };
  delete next.property_documents;
  delete next.inquiries;
  next.owners = stripProfile(property.owners) ?? null;
  if ("agents" in property) {
    next.agents = stripProfile(property.agents) ?? null;
  }
  return next;
}
