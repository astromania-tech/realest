/**
 * Paths that do not need session refresh / getUser in middleware.
 * Guest-only and protected page checks still run when those paths match.
 */
export function middlewareNeedsSession(pathname: string): boolean {
  const guestOnly = ["/login", "/register", "/forgot-password"];
  if (guestOnly.some((route) => pathname === route || pathname.startsWith(`${route}/`))) {
    return true;
  }

  const protectedRoots = [
    "/admin",
    "/agent",
    "/owner",
    "/profile",
    "/onboarding",
  ];
  if (protectedRoots.some((route) => pathname.startsWith(route))) {
    return true;
  }

  // Authenticated API surface — keep session refresh.
  if (pathname.startsWith("/api/admin")) return true;
  if (pathname.startsWith("/api/dashboard")) return true;
  if (pathname.startsWith("/api/auth")) return true;
  if (pathname.startsWith("/api/kyc")) return true;

  // Public APIs and marketing pages: skip Auth round-trip.
  return false;
}
