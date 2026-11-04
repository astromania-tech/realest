/** Where a newly verified account goes. Same path for the modal and the timed redirect. */
export function verificationDestination(user?: {
  id?: string;
  app_metadata?: { role?: string };
  user_metadata?: { user_type?: string };
} | null): string {
  if (!user?.id) return "/login?verified=true";
  const userType = user.app_metadata?.role || user.user_metadata?.user_type;
  if (!userType) return "/login?verified=true";
  if (userType === "owner" || userType === "agent") return "/onboarding";
  if (userType === "admin") return "/admin";
  return "/profile";
}
