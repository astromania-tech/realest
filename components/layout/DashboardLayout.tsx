"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardMobileNav } from "./DashboardMobileNav";
import { useUser } from "@/lib/hooks/useUser";
import {
  DASHBOARD_PAGE_PAD,
  dashboardMainOffset,
} from "@/lib/layout/dashboard-shell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { role: userRole, isLoading } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <DashboardHeader userRole={userRole} />

      <div className="flex">
        <DashboardSidebar
          userRole={userRole}
          currentPath={pathname}
          isCollapsed={isCollapsed}
          onToggleCollapsed={() => setIsCollapsed((value) => !value)}
        />

        <main className={dashboardMainOffset(isCollapsed)}>
          <div className={`min-h-screen ${DASHBOARD_PAGE_PAD}`} data-dashboard-main>
            {children}
          </div>
          <div className="hidden md:block">
            <DashboardFooter />
          </div>
        </main>
      </div>

      <DashboardMobileNav userRole={userRole} />
    </div>
  );
}
