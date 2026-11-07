import { Metadata } from "next";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { UserSessionBoundary } from "@/components/providers/UserSessionBoundary";

export const metadata: Metadata = {
  title: "Dashboard | RealEST",
  description: "Manage your RealEST account, properties, and activities.",
};

export default function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <UserSessionBoundary>
      <DashboardLayout>{children}</DashboardLayout>
    </UserSessionBoundary>
  );
}
