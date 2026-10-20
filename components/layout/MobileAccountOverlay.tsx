"use client";

import { createPortal } from "react-dom";
import { X } from "lucide-react";

type MobileAccountOverlayProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
};

export function MobileAccountOverlay({
  open,
  onClose,
  title,
  children,
}: MobileAccountOverlayProps) {
  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] md:hidden">
      <button
        type="button"
        aria-label="Close account menu"
        className="absolute inset-0 bg-[#07402F]/45 backdrop-blur-md"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="mobile-account-title"
        className="absolute inset-x-4 top-20 max-h-[min(32rem,calc(100vh-7rem))] overflow-y-auto overscroll-y-none rounded-2xl border border-border/50 bg-background/95 p-5 shadow-2xl backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
      >
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 id="mobile-account-title" className="font-heading text-lg text-[#07402F] dark:text-foreground">
            {title}
          </h2>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-border/40 bg-surface/80 text-muted-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>,
    document.body,
  );
}
