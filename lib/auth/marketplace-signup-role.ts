/**
 * Public signup may only create marketplace roles.
 * Staff/admin roles are invite- or promote-only — never from client metadata.
 */
export const MARKETPLACE_SIGNUP_ROLES = ["user", "owner", "agent"] as const;

export type MarketplaceSignupRole = (typeof MARKETPLACE_SIGNUP_ROLES)[number];

export function isMarketplaceSignupRole(
  value: unknown,
): value is MarketplaceSignupRole {
  return (
    value === "user" || value === "owner" || value === "agent"
  );
}

/** Invalid or staff values collapse to seeker — never elevate. */
export function marketplaceSignupRole(raw: unknown): MarketplaceSignupRole {
  if (isMarketplaceSignupRole(raw)) return raw;
  return "user";
}
