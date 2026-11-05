"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

/**
 * Shared RealEST branded modal shell (matches LogoutModal / WaitlistModal / ListingErrorDialog):
 * blurred backdrop, soft brand wash, floating orbs, rounded card, safe mobile padding.
 */
export function BrandModalShell({
  isOpen,
  onClose,
  titleId,
  descriptionId,
  children,
  maxWidthClass = "max-w-lg",
  closeDisabled = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  titleId: string;
  descriptionId?: string;
  children: React.ReactNode;
  maxWidthClass?: string;
  closeDisabled?: boolean;
}) {
  useEffect(() => {
    if (!isOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !closeDisabled) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [isOpen, closeDisabled, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 bg-background/20 backdrop-blur-xs animate-in fade-in duration-200"
        onClick={closeDisabled ? undefined : onClose}
      >
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
        <div className="absolute top-20 left-10 h-20 w-20 rounded-full bg-primary/10 blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 h-32 w-32 rounded-full bg-secondary/10 blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 h-24 w-24 rounded-full bg-primary/5 blur-xl animate-pulse delay-500" />
      </div>

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        className={`relative flex max-h-[92dvh] w-full ${maxWidthClass} flex-col overflow-hidden rounded-t-2xl border border-border/50 bg-background shadow-2xl animate-in fade-in zoom-in-95 duration-300 sm:max-h-[85vh] sm:rounded-2xl`}
      >
        {!closeDisabled ? (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3 right-3 z-20 flex h-10 w-10 items-center justify-center rounded-full border border-border/30 bg-surface/80 transition-colors duration-200 hover:bg-surface focus:outline-none focus:ring-2 focus:ring-primary/50 sm:top-4 sm:right-4"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        ) : null}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pt-14 sm:p-6 sm:pt-8">
          {children}
        </div>
      </div>
    </div>,
    document.body,
  );
}
