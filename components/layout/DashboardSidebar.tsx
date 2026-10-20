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
          {
            href: "/owner/identity",
            label: "Identity",
            description: "Youverify NIN or BVN before a draft",
            icon: Shield,
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
          {
            href: "/agent/identity",
            label: "Identity",
            description: "Youverify CAC before a draft",
            icon: Shield,
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

  const allHrefs = navigation.sections.flatMap((section) =>
    section.items.map((item) => item.href),
  );

  /**
   * Same rule as AdminSidebar: workspace roots are exact only.
   * Otherwise the longest matching nav href wins, so /agent/properties
   * does not stay lit on /agent/properties/new.
   */
  const isActive = (href: string) => {
    const matchesPath = (candidate: string) => {
      if (candidate === "/agent" || candidate === "/owner" || candidate === "/profile") {
        return currentPath === candidate;
      }
      return currentPath === candidate || currentPath.startsWith(`${candidate}/`);
    };
    const longest = allHrefs
      .filter(matchesPath)
      .sort((a, b) => b.length - a.length)[0];
    return longest === href;
  };

  return (
    <aside
      className={`fixed left-0 top-16 z-40 h-[calc(100vh-4rem)] overscroll-y-none border-r border-accent/20 bg-background transition-all duration-300 ${
        isCollapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col overscroll-y-none">
        <div className="p-4 -mb-2 border-b border-accent/20">
          <div className="flex items-center justify-between">
            {!isCollapsed && (
              <div className="min-w-0">
                <h2 className="text-lg font-semibold">
                  {userRole === "agent" ? "Agent Panel" : userRole === "owner" ? "Owner Panel" : "User Panel"}
                </h2>
                <p className="text-xs text-muted-foreground">
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

        <nav className="my-4 flex-1 space-y-4 overflow-y-auto overscroll-y-none px-2">
          {navigation.sections.map((section) => (
            <div key={section.title} className="space-y-2">
              {!isCollapsed && (
                <div className="px-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                    {section.title}
                  </p>
                </div>
              )}

              <div className="space-y-2">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`mt-0.5 flex w-full items-center gap-2 rounded-md p-2 text-left transition-colors hover:cursor-pointer hover:bg-popover-foreground/20 ${
                        isCollapsed ? "justify-center p-3" : "justify-start"
                      } ${
                        active
                          ? "bg-primary text-primary-foreground hover:bg-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 shrink-0 ${
                          active ? "text-primary-foreground" : ""
                        }`}
                      />
                      {!isCollapsed && (
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
            className={`flex h-11 w-full items-center gap-3 rounded-md px-3 text-muted-foreground transition-colors hover:bg-popover-foreground/20 hover:cursor-pointer ${
              isCollapsed ? "justify-center px-2" : "justify-start"
            } ${
              isActive("/setting")
                ? "bg-primary text-primary-foreground hover:bg-primary"
                : ""
            }`}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">Account Settings</span>}
          </Link>
        </div>
      </div>
    </aside>
  );
}
