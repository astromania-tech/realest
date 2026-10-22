"use client";

import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import { useUser } from "@/lib/hooks/useUser";
import { shellBlocksOnUserLoad } from "@/lib/layout/dashboard-shell";

interface AnalyticsLayoutProps {
  children: React.ReactNode;
}

export function AnalyticsLayout({ children }: AnalyticsLayoutProps) {
  const { role: userRole, isLoading } = useUser();

  // Cold boot only — keep chrome mounted after role is known
  if (shellBlocksOnUserLoad({ isLoading, hasRole: Boolean(userRole) })) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userRole={userRole} />

      {/* Main content - full width */}
      <main className="flex-1">
        <div className="min-h-screen p-6">{children}</div>
      </main>

      <DashboardFooter />
    </div>
  );
}
