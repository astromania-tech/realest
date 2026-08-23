import { Metadata } from "next";
import { AnalyticsLayout } from "@/components/layout/AnalyticsLayout";

export const metadata: Metadata = {
  title: "Analytics | RealEST",
  description: "RealEST system analytics for platform performance, monetization, engagement, validation, and team metrics.",
};

export default function AnalyticsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AnalyticsLayout>{children}</AnalyticsLayout>;
}
