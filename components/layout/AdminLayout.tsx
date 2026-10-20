"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { AdminFooter } from "./AdminFooter";
import { DashboardMobileNav } from "./DashboardMobileNav";
import { Card, Button } from "@heroui/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Shield } from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";
import {
  ADMIN_PAGE_PAD,
  adminMainOffset,
} from "@/lib/layout/dashboard-shell";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { role: userRole, isLoading } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Admin Dashboard", href: "/admin" }];

    if (pathSegments.length > 1) {
      const currentPath = `/${pathSegments.join("/")}`;
      const pathMap: Record<string, string> = {
        "/admin/validation": "Property Verification",
        "/admin/agents": "Agent Verification",
        "/admin/users": "User Management",
        "/admin/cms": "CMS Dashboard",
        "/admin/cms/analytics": "System Analytics",
        "/admin/settings": "Settings",
        "/admin/subadmins": "Sub-Admin Management",
        "/admin/support": "Support Center",
        "/admin/content": "Content Management",
      };

      const label = pathMap[currentPath];
      if (label) {
        breadcrumbs.push({ label, href: currentPath });
      } else {
        const lastSegment = pathSegments[pathSegments.length - 1];
        breadcrumbs.push({
          label:
            lastSegment.charAt(0).toUpperCase() +
            lastSegment.slice(1).replace(/-/g, " "),
          href: currentPath,
        });
      }
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <Shield className="mx-auto mb-4 h-12 w-12 animate-pulse text-primary" />
          <div className="text-muted-foreground">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  if (!isLoading && userRole !== "admin") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="max-w-md p-8 text-center">
          <Shield className="mx-auto mb-4 h-16 w-16 text-danger" />
          <h2 className="mb-2 text-xl font-bold">Access Denied</h2>
          <p className="mb-4 text-muted-foreground">
            You don't have permission to access the admin panel.
          </p>
          <Button>
            <a href="/profile">Return to Dashboard</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-background">
      <AdminHeader />

      <div className="flex">
        <AdminSidebar
          currentPath={pathname}
          isCollapsed={isCollapsed}
          onToggle={setIsCollapsed}
        />

        <main className={adminMainOffset(isCollapsed)}>
          <div className="min-h-screen">
            <div className="border-b border-accent/20 bg-background px-4 py-3 sm:px-6">
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((item, index) => (
                    <div key={index} className="flex items-center">
                      {index > 0 && <BreadcrumbSeparator />}
                      <BreadcrumbItem>
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{item.label}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={item.href}>
                            {item.label}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </div>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className={ADMIN_PAGE_PAD} data-dashboard-main>
              {children}
            </div>
          </div>
          <div className="hidden md:block">
            <AdminFooter />
          </div>
        </main>
      </div>

      <DashboardMobileNav userRole="admin" />
    </div>
  );
}
