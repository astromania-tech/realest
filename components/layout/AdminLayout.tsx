"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { AdminHeader } from "./AdminHeader";
import { AdminSidebar } from "./AdminSidebar";
import { AdminFooter } from "./AdminFooter";
import { Card, Button } from "@heroui/react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Users,
  Building,
  BarChart3,
  Shield,
  Settings,
} from "lucide-react";
import { useUser } from "@/lib/hooks/useUser";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { role: userRole, isLoading } = useUser();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [systemStats] = useState({
    totalUsers: 1250,
    pendingVerifications: 23,
    activeProperties: 456,
    systemHealth: "healthy" as "healthy" | "warning" | "critical",
  });

  // Generate breadcrumbs based on current path
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split("/").filter(Boolean);
    const breadcrumbs = [{ label: "Admin Dashboard", href: "/admin" }];

    if (pathSegments.length > 1) {
      const currentPath = `/${pathSegments.join("/")}`;

      // Map paths to breadcrumb labels
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
        // For unknown paths, create a generic breadcrumb
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
          <div className="text-muted-foreground">Loading admin panel...</div>
        </div>
      </div>
    );
  }

  if (!isLoading && userRole !== "admin") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center max-w-md">
          <Shield className="w-16 h-16 text-danger mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-muted-foreground mb-4">
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
    <div className="min-h-screen bg-background">
      <AdminHeader />

      <div className="flex">
        <AdminSidebar
          currentPath={pathname}
          isCollapsed={isCollapsed}
          onToggle={setIsCollapsed}
        />

        {/* Main content */}
        <main
          className={`flex-1 transition-all duration-300 ease-out ${
            isCollapsed ? "ml-15" : "ml-65"
          }`}
        >
          <div className="min-h-screen">
            {/* Breadcrumbs */}
            <div className="bg-background border-b border-accent/20 px-6 py-3">
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
            {/* Page Content */}
            <div className="p-6">{children}</div>
          </div>
          <AdminFooter />
        </main>
      </div>
    </div>
  );
}
