/**
 * (marketing) route group layout
 *
 * Section-level metadata for all marketing and informational pages.
 * Individual pages can override via their own `export const metadata`.
 *
 * Pages: /about, /how-it-works, /list-with-us, /verification,
 * /testimonials, /help, /contact, /blog, /careers, /press, /realest-status
 *
 * Note: Header and Footer are imported per-page — do NOT add them here.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | RealEST",
    default: "RealEST — Nigeria's Verified Property Marketplace",
  },
  description:
    "RealEST is Nigeria's first geo-verified property marketplace. Learn how we verify listings, list your property, and connect buyers with trusted sellers.",
  openGraph: {
    siteName: "RealEST",
    locale: "en_NG",
    type: "website",
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
