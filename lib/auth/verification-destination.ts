function metadataString(metadata: object | null | undefined, key: string): string | undefined {
  if (!metadata) return undefined;
  const value = (metadata as Record<string, unknown>)[key];
  return typeof value === "string" ? value : undefined;
}

/** Where a newly verified account goes. Same path for the modal and the timed redirect. */
export function verificationDestination(user?: {
  id?: string;
  app_metadata?: object | null;
  user_metadata?: object | null;
} | null): string {
  if (!user?.id) return "/login?verified=true";
  const userType = metadataString(user.app_metadata, "role") || metadataString(user.user_metadata, "user_type");
  if (!userType) return "/login?verified=true";
  if (userType === "owner" || userType === "agent") return "/onboarding";
  if (userType === "admin") return "/admin";
  return "/profile";
}
