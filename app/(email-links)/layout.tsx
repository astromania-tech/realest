import Link from "next/link";
import { LogoWithText, LoadingLogo, HeaderLogo, HeroLogo } from "@/components/ui/RealEstLogo";

export default function EmailLinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/40 bg-background/95 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" aria-label="RealEST Home">
            <HeaderLogo animated className="sm:hidden animate-fade-in" />
            <LoadingLogo size="md" className="hidden sm:block md:hidden" />
            <LoadingLogo size="2xl" className="hidden md:block" />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Back to site
          </Link>
        </div>
      </header>

      {/* Page content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-background/95 py-8">
        <div className="max-w-5xl mx-auto px-6 flex flex-col items-center gap-4">
          <Link href="/" aria-label="RealEST Home" className="opacity-70 hover:opacity-100 transition-opacity">
            <LogoWithText size="lg" />
          </Link>
          <p className="text-xs text-muted-foreground text-center">
            © {new Date().getFullYear()} RealEST Connect. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

