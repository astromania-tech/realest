"use client";

import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import { DashboardSidebar } from "./DashboardSidebar";
import { DashboardMobileNav } from "./DashboardMobileNav";
import { useUser } from "@/lib/hooks/useUser";
import {
  DASHBOARD_PAGE_PAD,
  dashboardMainOffset,
  shellBlocksOnUserLoad,
} from "@/lib/layout/dashboard-shell";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { role: userRole, isLoading } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const stickyRole = useRef<string | null>(null);

  if (pathname.startsWith("/admin")) {
    return <>{children}</>;
  }

  if (userRole) stickyRole.current = userRole;
  const displayRole = userRole ?? stickyRole.current;

  // Once marketplace chrome has hydrated, never tear it down on tab clicks
  const blockShell = shellBlocksOnUserLoad({
    isLoading,
    hasRole: Boolean(displayRole),
  });

  if (blockShell) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <DashboardHeader userRole={displayRole} />

      <div className="flex">
        <DashboardSidebar
          userRole={displayRole}
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

      <DashboardMobileNav userRole={displayRole} />
    </div>
  );
}
