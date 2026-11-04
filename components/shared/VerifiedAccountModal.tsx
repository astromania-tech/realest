"use client";

import Link from "next/link";
import { CheckCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shown after a new account verifies. Same shell as LogoutModal: blurred backdrop,
 * floating orbs, and a centered card.
 */
export function VerifiedAccountModal({ continueHref }: { continueHref: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-background/20 backdrop-blur-xs animate-in fade-in duration-200">
        <div className="absolute inset-0 bg-linear-to-br from-primary/20 via-primary/10 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute top-40 right-20 w-32 h-32 bg-secondary/10 rounded-full blur-xl animate-pulse delay-1000" />
        <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-primary/5 rounded-full blur-xl animate-pulse delay-500" />
      </div>

      <div className="relative w-full max-w-md backdrop-blur-3xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-300">
        <div className="p-6 sm:p-8">
          <div className="text-center space-y-4 animate-in fade-in zoom-in-95 duration-400">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-2xl">
              <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">Account verified</h2>
              <p className="text-sm text-muted-foreground">Redirecting you now…</p>
            </div>
            <div className="flex justify-center pt-1">
              <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
            </div>
            <Button asChild variant="default" className="w-full">
              <Link href={continueHref}>Continue</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
