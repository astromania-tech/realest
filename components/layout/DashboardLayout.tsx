"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { DashboardHeader } from "./DashboardHeader";
import { DashboardFooter } from "./DashboardFooter";
import { DashboardSidebar } from "./DashboardSidebar";
import { useUser } from "@/lib/hooks/useUser";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const { role: userRole, isLoading } = useUser();

  // Don't render anything while loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Loading dashboard...</div>
      </div>
    );
  }

  // Check if this is an admin route
  const isAdminRoute = pathname.startsWith("/admin");

  // For admin routes, let AdminLayout handle everything
  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader userRole={userRole} />

      <div className="flex">
        <DashboardSidebar 
          userRole={userRole} 
          currentPath={pathname} 
        />

        {/* Main content */}
        <main className="flex-1 ml-64">
          <div className="min-h-screen px-4">{children}</div>
          <DashboardFooter />
        </main>
      </div>

    </div>
  );
}
