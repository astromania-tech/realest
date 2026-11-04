"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { Button } from "@heroui/react";
import {
  Home,
  Building,
  Users,
  Shield,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Lock,
  AlertTriangle,
  CheckCircle,
  MenuSquare,
  FileText,
  SettingsIcon,
  Users2,
  UserCheck2,
  Layout,
  HelpCircle,
  Mail,
  Megaphone,
} from "lucide-react";

interface AdminSidebarProps {
  currentPath: string;
  isCollapsed: boolean;
  onToggle: (collapsed: boolean) => void;
}

export function AdminSidebar({
  currentPath,
  isCollapsed,
  onToggle,
}: AdminSidebarProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  const navigationItems = [
    {
      href: "/admin",
      label: "Dashboard",
      icon: Home,
      description: "System overview",
    },
    {
      href: "/admin/validation",
      label: "Property Verification",
      icon: Building,
      description: "Review property listings",
    },
    {
      href: "/admin/agents",
      label: "Agent Verification",
      icon: Users,
      description: "Verify real estate agents",
    },
    {
      href: "/admin/users",
      label: "User Management",
      icon: Shield,
      description: "Manage user accounts",
    },
    {
      href: "/admin/content",
      label: "Content Managemen",
      icon: FileText,
      description: "Manage platform content",
    },
    {
      href: "/admin/settings",
      label: "Admin Settings",
      icon: SettingsIcon,
      description: "System configurations",
    },
    {
      href: "/admin/subadmins",
      label: "Sub-Admins",
      icon: UserCheck2,
      description: "Manage sub-admin accounts",
    },
    {
      href: "/admin/cms",
      label: "CMS Dashboard",
      icon: Layout,
      description: "Content management overview",
    },
    {
      href: "/admin/support",
      label: "Support Center",
      icon: HelpCircle,
      description: "Support tickets and inquiries",
    },
    {
      href: "/admin/emails",
      label: "Email Templates",
      icon: Mail,
      description: "Preview all email templates",
    },
    {
      href: "/admin/emails/campaigns",
      label: "Email Campaigns",
      icon: Megaphone,
      description: "Create and send email campaigns",
    },
    {
      href: "/admin/analytics/polls",
      label: "Poll Results",
      icon: BarChart3,
      description: "View email poll vote results",
    },
    {
      href: "/admin/analytics/referrals",
      label: "Referrals",
      icon: Users2,
      description: "Referral tracking and attribution",
    },
  ];

  const isActive = (href: string) => {
    if (href === "/admin" && currentPath === "/admin") return true;
    if (href === "/admin") return false;
    // Exact match or starts with href followed by / (prevents /admin/emails matching /admin/emails/campaigns)
    return currentPath === href || currentPath.startsWith(href + "/");
  };

  // Handle mouse enter - expand immediately
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    setIsHovered(true);
  };

  // Handle mouse leave - collapse after delay if manually collapsed
  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 150); // 300ms delay to prevent flickering
  };

  // Determine if sidebar should be collapsed (manual collapse + not hovered)
  const shouldCollapse = isCollapsed && !isHovered;

  // Trigger animation when collapse state changes
  useEffect(() => {
    setIsAnimating(true);
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
    }
    animationTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Match animation duration
  }, [shouldCollapse]);

  return (
    <aside
      className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-background border-r border-accent/20 z-40 ${
        shouldCollapse ? "w-15" : "w-65"
      } ${isAnimating ? (shouldCollapse ? "animate-sidebar-collapse" : "animate-sidebar-expand") : ""}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div
          className={`p-4 -mb-2 border-b border-accent/20 ${!shouldCollapse ? "animate-content-fade-in" : ""}`}
        >
          <div className="flex px-0 items-center justify-between">
            {!shouldCollapse && (
              <div className="animate-text-slide-in">
                <h2 className="text-lg font-semibold">Admin Panel</h2>
                <p className="text-xs text-muted-foreground">
                  System Management
                </p>
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

        {/* Navigation */}
        <nav
          className={`flex-1 px-2 my-4 space-y-2 sidebar-nav overflow-y-auto ${!shouldCollapse ? "animate-content-stagger-1" : ""}`}
        >
          {navigationItems.map((item, index) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={active ? "primary" : "ghost"}
                  className={`w-full flex items-center hover:bg-popover-foreground/20 hover:cursor-pointer justify-start mt-0.5 gap-2 h-auto p-2 ${
                    shouldCollapse ? "p-3" : ""
                  } ${active ? "bg-primary hover:bg-primary text-primary-foreground" : ""} ${
                    shouldCollapse ? "rounded-sm" : "rounded-md"
                  } ${!shouldCollapse ? `animate-content-stagger-${Math.min(index + 2, 3)}` : ""}`}
                >
                  <Icon
                    className={`w-5 h-5 shrink-0 ${
                      active ? "text-primary-foreground" : ""
                    } ${!shouldCollapse ? "animate-icon-scale" : ""}`}
                  />
                  {!shouldCollapse && (
                    <div className="flex flex-col items-start">
                      <span
                        className={`font-medium animate-text-slide-in ${
                          active
                            ? "text-primary-foreground"
                            : "text-muted-foreground"
                        }
                        `}
                      >
                        {item.label}
                      </span>
                      <span
                        className={`text-xs ${
                          active
                            ? "text-primary-foreground"
                            : "text-muted-foreground/70"
                        } animate-text-slide-in`}
                        style={{ animationDelay: `${0.2 + index * 0.05}s` }}
                      >
                        {item.description}
                      </span>
                    </div>
                  )}
                </Button>
              </Link>
            );
          })}
        </nav>

        {/* Quick Actions */}
        {!shouldCollapse && (
          <div className="p-4 border-t border-accent/20 animate-content-stagger-3">
            <div className="flex flex-col justify-start space-y-2">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide animate-text-slide-in">
                Quick Actions
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-start gap-2 text-warning hover:text-warning hover:bg-warning/10 animate-content-stagger-3"
                style={{ animationDelay: "0.4s" }}
              >
                <AlertTriangle className="w-4 h-4 animate-icon-scale" />
                <span
                  className="animate-text-slide-in"
                  style={{ animationDelay: "0.45s" }}
                >
                  System Alerts
                </span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className="w-full flex items-center justify-start gap-2 text-success hover:text-success hover:bg-success/10 animate-content-stagger-3"
                style={{ animationDelay: "0.45s" }}
              >
                <CheckCircle className="w-4 h-4 animate-icon-scale" />
                <span
                  className="animate-text-slide-in"
                  style={{ animationDelay: "0.5s" }}
                >
                  Health Check
                </span>
              </Button>
            </div>
          </div>
        )}

        {/* Settings */}
        <div
          className={`py-4 border-t border-accent/20 ${!shouldCollapse ? "animate-content-stagger-3" : ""}`}
        >
          <Link href="/settings">
            <Button
              variant="ghost"
              className={`w-full flex items-center justify-start gap-3 h-10 ${
                shouldCollapse ? "p-6" : "px-3"
              } ${!shouldCollapse ? "animate-content-stagger-3" : ""}`}
              style={{ animationDelay: "0.5s" }}
            >
              <Settings
                className={`w-4 h-4 shrink-0 ${!shouldCollapse ? "animate-icon-scale" : ""}`}
              />
              {!shouldCollapse && (
                <span
                  className="animate-text-slide-in"
                  style={{ animationDelay: "0.55s" }}
                >
                  Settings
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
      <style>{`
        .sidebar-nav::-webkit-scrollbar {
          display: none;
        }
        .sidebar-nav {
          scrollbar-width: none;
        }
      `}</style>
    </aside>
  );
}
