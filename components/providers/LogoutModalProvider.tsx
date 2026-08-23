/**
 * LogoutModalProvider
 *
 * Global context that any client component can call to open the LogoutModal
 * without needing to own the modal's state locally.
 *
 * Usage:
 *   // In any client component:
 *   const { openLogoutModal } = useLogoutModal();
 *   openLogoutModal();                             // manual confirmation
 *   openLogoutModal({ isAuto: true });             // immediate auto-logout
 *   openLogoutModal({ redirectTo: "/login" });     // custom post-logout destination
 */
"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { LogoutModal } from "@/components/shared/LogoutModal";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface LogoutModalConfig {
  /** Where to navigate after a successful sign-out. Defaults to "/" */
  redirectTo?: string;
  /** When true the modal fires signOut immediately without showing the confirmation screen */
  isAuto?: boolean;
}

interface LogoutModalContextType {
  openLogoutModal: (config?: LogoutModalConfig) => void;
}

// ─── Context ──────────────────────────────────────────────────────────────────

const LogoutModalContext = createContext<LogoutModalContextType | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function LogoutModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<LogoutModalConfig>({});

  const openLogoutModal = useCallback((cfg?: LogoutModalConfig) => {
    setConfig(cfg ?? {});
    setIsOpen(true);
  }, []);

  const closeLogoutModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const value = useMemo(() => ({ openLogoutModal }), [openLogoutModal]);

  return (
    <LogoutModalContext.Provider value={value}>
      {children}
      <LogoutModal
        isOpen={isOpen}
        onClose={closeLogoutModal}
        redirectTo={config.redirectTo ?? "/"}
        isAuto={config.isAuto ?? false}
      />
    </LogoutModalContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useLogoutModal(): LogoutModalContextType {
  const ctx = useContext(LogoutModalContext);
  if (!ctx) {
    throw new Error(
      "useLogoutModal must be used within a <LogoutModalProvider>. " +
        "Add <LogoutModalProvider> to your root layout.",
    );
  }
  return ctx;
}
