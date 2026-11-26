/**
 * Waitlist candidate_role is read on the server. Public GET /api/waitlist must
 * not expose it. An explicit owner or agent click is kept. A waitlist supply
 * role can still promote a seeker click. Neither path can mint staff.
 */
import {
  marketplaceSignupRole,
  type MarketplaceSignupRole,
} from "@/lib/auth/marketplace-signup-role";
import { prisma } from "@/lib/prisma";

export function signupRoleFromChoices(
  clientUserType: unknown,
  waitlistCandidateRole: string | null | undefined,
): MarketplaceSignupRole {
  const fromClient = marketplaceSignupRole(clientUserType);
  if (fromClient === "owner" || fromClient === "agent") return fromClient;
  if (!waitlistCandidateRole) return fromClient;
  const fromWaitlist = marketplaceSignupRole(waitlistCandidateRole);
  if (fromWaitlist === "owner" || fromWaitlist === "agent") return fromWaitlist;
  return "user";
}

export async function resolveSignupRoleFromWaitlist(
  email: string,
  clientUserType: unknown,
): Promise<MarketplaceSignupRole> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return signupRoleFromChoices(clientUserType, null);

  const entry = await prisma.waitlist.findUnique({
    where: { email: normalized },
    select: { candidate_role: true },
  });

  return signupRoleFromChoices(clientUserType, entry?.candidate_role);
}

/** Resolve the trusted role before running any Auth account creation callback. */
export async function resolveRoleThenCreate<T>(
  resolveRole: () => Promise<MarketplaceSignupRole>,
  createAccount: (role: MarketplaceSignupRole) => Promise<T>,
): Promise<{ signupRole: MarketplaceSignupRole; account: T }> {
  const signupRole = await resolveRole();
  const account = await createAccount(signupRole);
  return { signupRole, account };
}
