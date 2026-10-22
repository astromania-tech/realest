"use client";

import type { ReactNode } from "react";
import { UserProvider } from "@/lib/hooks/useUser";

/**
 * Mounts the heavy UserProvider only under authenticated shells
 * (dashboard, analytics, onboarding). Public/marketing pages keep
 * AuthProvider alone so ProfileDropdown can fall back to session + role.
 */
export function UserSessionBoundary({ children }: { children: ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}
