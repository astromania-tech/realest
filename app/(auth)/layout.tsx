import { Metadata } from "next";
import { AuthHeader, AuthFooter } from "@/components/layout/AuthHeader";

export const metadata: Metadata = {
  title: {
    template: "%s | RealEST",
    default: "Account | RealEST",
  },
  description:
    "Sign in or create your RealEST account to access verified property listings and manage your real estate portfolio.",
  robots: { index: true, follow: false },
};

/**
 * AUTH LAYOUT — Single source of truth for auth page UI configuration.
 *
 * Route guard logic lives in lib/supabase/middleware.ts:
 *   - Unauthenticated users accessing protected routes → /login
 *   - Unconfirmed users accessing protected routes → /success (email gate)
 *   - Confirmed+authenticated users accessing guest-only pages → dashboard
 *
 * This layout provides the consistent header + footer shell for all /(auth) pages.
 * Pages: /login, /register, /forgot-password, /success, /verify, /otp, /reset-password
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="bg-background">
      <AuthHeader />
      {children}
      <AuthFooter />
    </div>
  );
}
