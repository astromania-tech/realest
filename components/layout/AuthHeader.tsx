"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { HeaderLogo } from "@/components/ui/RealEstLogo";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle-wrapper";

export function AuthHeader() {
  return (
    <header className="w-full border-b border-border/40 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Back to home */}
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span className="hidden sm:inline">Back to home</span>
        </Link>

        {/* Centered logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Link href="/" aria-label="RealEST home">
            <HeaderLogo />
          </Link>
        </div>

        {/* Theme toggle */}
        <div className="flex items-center">
          <ThemeToggleCompact />
        </div>
      </div>
    </header>
  );
}

export function AuthFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full border-t border-border/40 bg-background py-6 mt-auto">
      <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>© {year} RealEST Connect. All rights reserved.</span>
        <div className="flex items-center gap-4">
          <Link href="/privacy" className="hover:text-foreground transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-foreground transition-colors">
            Terms of Service
          </Link>
          <Link href="/help" className="hover:text-foreground transition-colors">
            Help
          </Link>
        </div>
      </div>
    </footer>
  );
}
