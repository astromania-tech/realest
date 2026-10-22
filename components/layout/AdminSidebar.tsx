"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/react";
import {
  ChevronLeft,
  Lock,
  AlertTriangle,
  CheckCircle,
  MenuSquare,
  Settings,
} from "lucide-react";

import { isDashboardNavActive, staffNavItems } from "@/lib/layout/dashboard-nav";
import { staffRolePanelSubtitle, staffRolePanelTitle } from "@/lib/auth/roles";

interface AdminSidebarProps {
  currentPath: string;
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
  userRole?: "admin" | "reviewer" | "supervisor" | "team_leader" | "team_member";
}

export function AdminSidebar({
  currentPath,
  isCollapsed,
  onToggle,
  userRole = "admin",
}: AdminSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, []);

  const navigationItems = staffNavItems(userRole);
  const navigationHrefs = navigationItems.map((item) => item.href);
  const panelTitle = staffRolePanelTitle(userRole);
  const panelSubtitle = staffRolePanelSubtitle(userRole);

  const isActive = (href: string) =>
    isDashboardNavActive(currentPath, href, navigationHrefs);

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150);
  };

  const shouldCollapse = isCollapsed && !isHovered;

  useEffect(() => {
    setIsAnimating(true);
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 500);
  }, [shouldCollapse]);

  return (
    <aside
      className={`fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] overscroll-y-none border-r border-accent/20 bg-background md:block ${
        shouldCollapse ? "w-15" : "w-65"
      } ${isAnimating ? (shouldCollapse ? "animate-sidebar-collapse" : "animate-sidebar-expand") : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex h-full flex-col overscroll-y-none">
        <div className="p-4 -mb-2 border-b border-accent/20">
          <div className="flex px-0 items-center justify-between">
            {!shouldCollapse && (
              <div>
                <h2 className="text-lg font-semibold">{panelTitle}</h2>
                <p className="text-xs text-muted-foreground">{panelSubtitle}</p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onPress={() => onToggle(!isCollapsed)}
              onMouseEnter={() => setIsButtonHovered(true)}
              onMouseLeave={() => setIsButtonHovered(false)}
              className="flex items-center justify-center ml-auto"
            >
              {isCollapsed && !isHovered ? (
                <MenuSquare className="w-5 h-5" />
              ) : isButtonHovered ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/*
          Plain <Link> only — never nest HeroUI <Button> inside <Link>.
          Nested <a><button> breaks Next soft navigation and remounts the whole admin shell.
        */}
        <nav className="sidebar-nav my-4 flex-1 space-y-2 overflow-y-auto overscroll-y-none px-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch
                className={`mt-0.5 flex w-full items-center gap-2 p-2 transition-colors hover:bg-popover-foreground/20 ${
                  shouldCollapse ? "justify-center rounded-sm p-3" : "justify-start rounded-md"
                } ${
                  active
                    ? "bg-primary text-primary-foreground hover:bg-primary"
                    : "text-foreground"
                }`}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {!shouldCollapse ? (
                  <span className="flex min-w-0 flex-col items-start">
                    <span className="truncate font-medium">{item.label}</span>
                    <span
                      className={`truncate text-xs ${
                        active ? "text-primary-foreground/80" : "text-muted-foreground/70"
                      }`}
                    >
                      {item.description}
                    </span>
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        {!shouldCollapse && userRole === "admin" ? (
          <div className="space-y-2 border-t border-accent/20 p-4">
            <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Quick Actions
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-start gap-2 rounded-md px-2 py-1.5 text-sm text-warning hover:bg-warning/10"
            >
              <AlertTriangle className="h-4 w-4" />
              System Alerts
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-start gap-2 rounded-md px-2 py-1.5 text-sm text-success hover:bg-success/10"
            >
              <CheckCircle className="h-4 w-4" />
              Health Check
            </button>
          </div>
        ) : null}

        {userRole === "admin" ? (
          <div className="border-t border-accent/20 py-4">
            <Link
              href="/admin/settings"
              prefetch
              className={`flex h-10 w-full items-center gap-3 hover:bg-popover-foreground/20 ${
                shouldCollapse ? "justify-center p-3" : "justify-start px-3"
              }`}
            >
              <Settings className="h-4 w-4 shrink-0" />
              {!shouldCollapse ? <span>Settings</span> : null}
            </Link>
          </div>
        ) : null}
      </div>
      <style>{`
        .sidebar-nav::-webkit-scrollbar { display: none; }
        .sidebar-nav {
          scrollbar-width: none;
          overscroll-behavior-y: none;
        }
      `}</style>
    </aside>
  );
}
