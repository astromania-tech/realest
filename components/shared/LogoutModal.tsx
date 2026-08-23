/**
 * LogoutModal Component
 *
 * A branded, animated modal for signing out, replacing the dedicated /logout page.
 * Supports three states:
 *   - Manual confirmation: icon + gradient title + Cancel / Sign Out buttons
 *   - Auto-logout (isAuto=true): fires signOut immediately on open, shows spinner
 *   - Success: CheckCircle + "Redirecting…" spinner, then redirects
 *   - Error: inline error with retry
 *
 * Design mirrors WaitlistModal (backdrop blur, floating orbs, brand gradient heading,
 * border-border/50 card, translucent surface background).
 *
 * Usage via LogoutModalProvider's useLogoutModal() hook — never import and mount directly.
 */
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  LogOut,
  CheckCircle,
  RefreshCw,
  AlertCircle,
  X,
} from "lucide-react";
import { signOut } from "@/lib/auth";
import { Button } from "@/components/ui/button";

export interface LogoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Where to navigate after a successful sign-out. Defaults to "/" */
  redirectTo?: string;
  /** When true the modal fires signOut immediately on open without showing confirmation */
  isAuto?: boolean;
}

export function LogoutModal({
  isOpen,
  onClose,
  redirectTo = "/",
  isAuto = false,
}: LogoutModalProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");
  const hasAutoTriggered = useRef(false);

  // Reset transient state every time the modal is opened
  useEffect(() => {
    if (isOpen) {
      setIsLoading(false);
      setIsSuccess(false);
      setError("");
      hasAutoTriggered.current = false;
    }
  }, [isOpen]);

  const handleLogout = async () => {
    if (isLoading) return;
    setIsLoading(true);
    setError("");

    try {
      const result = await signOut();

      if (!result.success) {
        setError(result.error || "Failed to sign out. Please try again.");
        return;
      }

      setIsSuccess(true);
      // replace() so the back button cannot return to a protected page
      setTimeout(() => {
        router.replace(redirectTo);
        onClose();
      }, 1800);
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-logout: fire once when the modal opens with isAuto=true
  useEffect(() => {
    if (isOpen && isAuto && !hasAutoTriggered.current) {
      hasAutoTriggered.current = true;
      handleLogout();
    }
  }, [isOpen]); // intentionally omit handleLogout — stable on mount

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* ── Backdrop ── */}
      <div
        className="absolute inset-0 bg-background/20 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={!isLoading && !isSuccess ? onClose : undefined}
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating blur orbs — matches WaitlistModal aesthetic */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse delay-500" />
      </div>

      {/* ── Modal card ── */}
      <div className="relative w-full max-w-md backdrop-blur-3xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        {/* Close button — hidden while loading or on success */}
        {!isLoading && !isSuccess && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-10 h-10 rounded-full bg-surface/80 hover:bg-surface border border-border/30 flex items-center justify-center transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        )}

        <div className="p-6 sm:p-8">

          {/* ── Success state ── */}
          {isSuccess && (
            <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-400">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl">
                <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">Signed Out</h2>
                <p className="text-sm text-muted-foreground">
                  Redirecting you now…
                </p>
              </div>
              <div className="flex justify-center pt-1">
                <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
              </div>
            </div>
          )}

          {/* ── Auto-logout: spinner state ── */}
          {!isSuccess && isAuto && (
            <div className="text-center space-y-5 animate-in fade-in duration-300">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-linear-to-br from-primary/20 to-accent/20 rounded-2xl">
                <RefreshCw className="w-8 h-8 text-accent/80 animate-spin" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-bold text-foreground">
                  Signing You Out
                </h2>
                <p className="text-sm text-muted-foreground">Please wait…</p>
              </div>

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {error && (
                <Button
                  onClick={handleLogout}
                  disabled={isLoading}
                  variant="default"
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Retrying…
                    </>
                  ) : (
                    "Try Again"
                  )}
                </Button>
              )}
            </div>
          )}

          {/* ── Manual confirmation state ── */}
          {!isSuccess && !isAuto && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              {/* Icon + heading */}
              <div className="text-center space-y-3 pt-2">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-linear-to-tl from-primary/20 to-accent/20 rounded-md">
                  <LogOut className="w-7 h-7 text-accent/80" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold bg-linear-to-l from-primary to-accent bg-clip-text text-transparent">
                    Sign Out?
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1.5">
                    Are you sure you want to leave? Your session will be ended
                    securely.
                  </p>
                </div>
              </div>

              {/* Inline error */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              {/* Action buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={onClose}
                  disabled={isLoading}
                  className="w-full focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  Cancel
                </Button>

                <Button
                  variant="destructive"
                  size="lg"
                  onClick={handleLogout}
                  disabled={isLoading}
                  className="w-full focus:outline-none focus:ring-2 focus:ring-destructive/50"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Signing Out…
                    </>
                  ) : (
                    <>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default LogoutModal;
