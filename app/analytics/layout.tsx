import { Metadata } from "next";
import { AnalyticsLayout } from "@/components/layout/AnalyticsLayout";
import { UserSessionBoundary } from "@/components/providers/UserSessionBoundary";
import { PrototypeHold } from "@/components/realest/PrototypeHold";
import { shouldShowDemoPages } from "@/lib/appMode";

export const metadata: Metadata = {
  title: "Analytics | RealEST",
  description: "RealEST system analytics for platform performance, monetization, engagement, validation, and team metrics.",
};

export default function AnalyticsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!shouldShowDemoPages()) {
    return <PrototypeHold />;
  }

  return (
    <UserSessionBoundary>
      <AnalyticsLayout>{children}</AnalyticsLayout>
    </UserSessionBoundary>
  );
}
