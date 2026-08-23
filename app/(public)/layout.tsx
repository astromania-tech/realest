/**
 * (public) route group layout
 *
 * Provides section-level fallback metadata for all public-facing property
 * and search pages. Individual pages override these defaults with
 * `generateMetadata` or their own `export const metadata`.
 *
 * Pages in this group: /property/[id], /listing/[id], /search,
 * /rent, /buy, /sell, /agents, /events, /safety
 *
 * Note: Header and Footer are imported per-page in this group —
 * do NOT add them here to avoid double-rendering.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | RealEST",
    default: "Verified Properties | RealEST",
  },
  description:
    "Search and explore geo-verified properties across Nigeria. Find houses, apartments, land and commercial property for rent, sale or lease on RealEST.",
  openGraph: {
    siteName: "RealEST",
    locale: "en_NG",
    type: "website",
  },
};

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
