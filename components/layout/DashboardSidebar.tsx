"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@heroui/react";
import {
  Home,
  Heart,
  MessageSquare,
  Building,
  BarChart3,
  Shield,
  Settings,
  Bell,
  User,
  Plus,
  Wallet,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface DashboardSidebarProps {
  userRole: string | null;
  currentPath: string;
}

type NavigationItem = {
  href: string;
  label: string;
  description: string;
  icon: typeof Home;
};

type NavigationSection = {
  title: string;
  items: NavigationItem[];
};

type RoleNavigation = {
  title: string;
  subtitle: string;
  sections: NavigationSection[];
};

const ROLE_NAVIGATION: Record<string, RoleNavigation> = {
  user: {
    title: "User Workspace",
    subtitle: "Search, save, and manage your activity",
    sections: [
      {
        title: "Overview",
        items: [
          {
            href: "/profile",
            label: "Dashboard",
            description: "Your activity snapshot",
            icon: Home,
          },
          {
            href: "/profile/favorites",
            label: "Saved Properties",
            description: "Properties you bookmarked",
            icon: Heart,
          },
          {
            href: "/profile/my-inquiries",
            label: "My Inquiries",
            description: "Messages sent to owners",
            icon: MessageSquare,
          },
        ],
      },
      {
        title: "Account",
        items: [
          {
            href: "/profile/edit",
            label: "Edit Profile",
            description: "Personal details and bio",
            icon: User,
          },
          {
            href: "/profile/notifications",
            label: "Notifications",
            description: "Delivery and alert settings",
            icon: Bell,
          },
          {
            href: "/profile/change-password",
            label: "Security",
            description: "Password and login protection",
            icon: Shield,
          },
          {
            href: "/setting",
            label: "Account Settings",
            description: "Profile, security, and preferences",
            icon: Settings,
          },
        ],
      },
    ],
  },
  owner: {
    title: "Owner Workspace",
    subtitle: "List properties and track performance",
    sections: [
      {
        title: "Overview",
        items: [
          {
            href: "/owner",
            label: "Dashboard",
            description: "Listings and inquiry summary",
            icon: Home,
          },
          {
            href: "/owner/listings",
            label: "My Listings",
            description: "All of your properties",
            icon: Building,
          },
          {
            href: "/owner/listings/new",
            label: "Add Property",
            description: "Start a new listing flow",
            icon: Plus,
          },
        ],
      },
      {
        title: "Business",
        items: [
          {
            href: "/owner/inquiries",
            label: "Inquiries",
            description: "Buyer and renter messages",
            icon: MessageSquare,
          },
          {
            href: "/owner/analytics",
            label: "Analytics",
            description: "Performance and revenue insights",
            icon: BarChart3,
          },
          {
            href: "/owner/premium",
            label: "Premium",
            description: "Upgrade and feature access",
            icon: Wallet,
          },
          {
            href: "/setting",
            label: "Account Settings",
            description: "Profile, security, and preferences",
            icon: Settings,
          },
        ],
      },
    ],
  },
  agent: {
    title: "Agent Workspace",
    subtitle: "Manage listings and property activity",
    sections: [
      {
        title: "Overview",
        items: [
          {
            href: "/agent",
            label: "Dashboard",
            description: "Listings and inquiry overview",
            icon: Home,
          },
          {
            href: "/agent/properties",
            label: "My Listings",
            description: "Properties under your agency",
            icon: Building,
          },
          {
            href: "/agent/properties/new",
            label: "Add Property",
            description: "Create a new agent listing",
            icon: Plus,
          },
        ],
      },
      {
        title: "Account",
        items: [
          {
            href: "/setting",
            label: "Account Settings",
            description: "Profile, security, and preferences",
            icon: Settings,
          },
          {
            href: "/setting/security",
            label: "Security",
            description: "Password and session controls",
            icon: Shield,
          },
        ],
      },
    ],
  },
};

const DEFAULT_NAVIGATION = ROLE_NAVIGATION.user;

export function DashboardSidebar({
  userRole,
  currentPath,
}: DashboardSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const navigation = ROLE_NAVIGATION[userRole || "user"] || DEFAULT_NAVIGATION;

  const isActive = (href: string) => {
    if (href === "/") {
      return currentPath === "/";
    }

    return currentPath === href || currentPath.startsWith(`${href}/`);
  };

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background/95 backdrop-blur border-r border-border/70 transition-all duration-300 z-40 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex flex-col h-full">
        <div className="p-4 border-b border-border/70">
          <div className="flex items-start justify-between gap-3">
            {!isCollapsed && (
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  {navigation.title}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-foreground">
                  RealEST
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  {navigation.subtitle}
                </p>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onPress={() => setIsCollapsed(!isCollapsed)}
              className="ml-auto flex items-center justify-center"
            >
              {isCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-5">
          {navigation.sections.map((section) => (
            <div key={section.title} className="space-y-2">
              {!isCollapsed && (
                <div className="px-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {section.title}
                  </p>
                </div>
              )}

              <div className="space-y-1.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant={active ? "primary" : "ghost"}
                        className={`w-full h-auto min-h-11 justify-start gap-3 rounded-md px-3 py-2 text-left transition-all ${
                          active
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "hover:bg-muted/70"
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 ${active ? "text-primary-foreground" : ""}`} />
                        {!isCollapsed && (
                          <div className="flex min-w-0 flex-1 flex-col items-start">
                            <span className="truncate text-sm font-medium">
                              {item.label}
                            </span>
                            <span className={`truncate text-xs ${active ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                              {item.description}
                            </span>
                          </div>
                        )}
                      </Button>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <div className="border-t border-border/70 p-4">
          <Link href="/setting">
            <Button
              variant="ghost"
              className={`w-full justify-start gap-3 h-11 rounded-md px-3 ${
                isCollapsed ? "justify-center px-2" : ""
              }`}
            >
              <Settings className="w-4 h-4 shrink-0" />
              {!isCollapsed && <span>Account Settings</span>}
            </Button>
          </Link>
        </div>
      </div>
    </aside>
  );
}
