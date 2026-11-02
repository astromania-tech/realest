"use client";

import Link from "next/link";
import { Button } from "@heroui/react";
import { ChevronLeft, ChevronRight, Settings } from "lucide-react";
import {
  isDashboardNavActive,
  roleNavigation,
} from "@/lib/layout/dashboard-nav";

interface DashboardSidebarProps {
  userRole: string | null;
  currentPath: string;
  isCollapsed: boolean;
  onToggleCollapsed: () => void;
}

export function DashboardSidebar({
  userRole,
  currentPath,
  isCollapsed,
  onToggleCollapsed,
}: DashboardSidebarProps) {
  const navigation = roleNavigation(userRole);
  const allHrefs = navigation.sections.flatMap((section) =>
    section.items.map((item) => item.href),
  );
  const showLabels = !isCollapsed;

  return (
    <aside
      className={`fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] overscroll-y-none border-r border-accent/20 bg-background transition-all duration-300 md:flex ${
        isCollapsed ? "md:w-16" : "md:w-64"
      }`}
    >
      <div className="flex h-full w-full flex-col overscroll-y-none">
        <div className="-mb-2 border-b border-accent/20 p-4">
          <div className="flex items-center justify-between">
            {showLabels && (
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">
                  {userRole === "agent"
                    ? "Agent Panel"
                    : userRole === "owner"
                      ? "Owner Panel"
                      : "User Panel"}
                </h2>
                <p className="text-xs text-muted-foreground">{navigation.subtitle}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onPress={onToggleCollapsed}
              className="ml-auto flex items-center justify-center"
            >
              {isCollapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        <nav className="my-4 flex-1 space-y-4 overflow-y-auto overscroll-y-none px-2">
          {navigation.sections.map((section) => (
            <div key={section.title} className="space-y-2">
              {showLabels && (
                <div className="px-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {section.title}
                  </p>
                </div>
              )}
              <div className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isDashboardNavActive(currentPath, item.href, allHrefs);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch
                      className={`mt-0.5 flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors hover:cursor-pointer hover:bg-popover-foreground/20 ${
                        showLabels ? "justify-start" : "justify-center p-3"
                      } ${
                        active
                          ? "bg-primary text-primary-foreground hover:bg-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon className={`h-5 w-5 shrink-0 ${active ? "text-primary-foreground" : ""}`} />
                      {showLabels && (
                        <div className="flex min-w-0 flex-1 flex-col items-start">
                          <span className={`truncate text-sm font-medium ${active ? "text-primary-foreground" : "text-muted-foreground"}`}>
                            {item.label}
                          </span>
                          <span className={`truncate text-xs ${active ? "text-primary-foreground/80" : "text-muted-foreground/80"}`}>
                            {item.description}
                          </span>
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-accent/20 p-4">
          <Link
            href="/setting"
            prefetch
            className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-muted-foreground transition-colors hover:cursor-pointer hover:bg-popover-foreground/20 ${
              showLabels ? "justify-start" : "justify-center px-2"
            } ${
              isDashboardNavActive(currentPath, "/setting", allHrefs)
                ? "bg-primary text-primary-foreground hover:bg-primary"
                : ""
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {showLabels && <span className="text-sm font-medium">Account Settings</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
