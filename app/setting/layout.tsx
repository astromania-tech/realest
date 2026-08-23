/**
 * Settings layout
 *
 * Provides metadata for all /setting/* pages.
 * Marked noindex — account settings are private and should not appear
 * in search engine results.
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    template: "%s | RealEST",
    default: "Settings | RealEST",
  },
  description: "Manage your RealEST account settings, security and preferences.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SettingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
