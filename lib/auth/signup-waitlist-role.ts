/**
 * Waitlist candidate_role may override the signup UI choice, but only after a
 * server-side lookup. Public GET /api/waitlist must not expose candidateRole
 * (email probing).
 */
import {
  marketplaceSignupRole,
  type MarketplaceSignupRole,
} from "@/lib/auth/marketplace-signup-role";
import { prisma } from "@/lib/prisma";

export async function resolveSignupRoleFromWaitlist(
  email: string,
  clientUserType: unknown,
): Promise<MarketplaceSignupRole> {
  const fromClient = marketplaceSignupRole(clientUserType);
  const normalized = email.trim().toLowerCase();
  if (!normalized) return fromClient;

  const entry = await prisma.waitlist.findUnique({
    where: { email: normalized },
    select: { candidate_role: true },
  });

  if (!entry?.candidate_role) return fromClient;
  return marketplaceSignupRole(entry.candidate_role);
}
