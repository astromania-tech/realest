/**
 * (legal) route group layout
 *
 * Section-level metadata for legal and policy pages.
 * These pages are indexed but marked as low-priority content.
 *
 * Pages: /privacy, /terms, /cookies
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | RealEST",
    default: "Legal | RealEST",
  },
  description:
    "RealEST legal documents — Privacy Policy, Terms of Service, and Cookie Policy for Nigeria's verified property marketplace.",
  openGraph: {
    siteName: "RealEST",
    locale: "en_NG",
    type: "website",
  },
  robots: {
    index: true,
    follow: false, // No need to crawl outbound links from legal pages
  },
};

export default function LegalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
