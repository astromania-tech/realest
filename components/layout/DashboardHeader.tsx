"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar } from "@heroui/react";
import { Button } from "../ui";
import {
  Bell,
  Settings,
  LogOut,
  User,
  Home,
  Building,
  Users,
  Shield,
  Menu,
} from "lucide-react";
import { HeaderLogo } from "@/components/ui/RealEstLogo";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle-wrapper";
import { useUser } from "@/lib/hooks/useUser";
import { ProfileDropdown } from "@/components/realest";
import { useLogoutModal } from "@/components/providers/LogoutModalProvider";
import { MobileAccountOverlay } from "@/components/layout/MobileAccountOverlay";

interface DashboardHeaderProps {
  userRole: string | null;
}

function marketplaceHomePath(role: string | null): string {
  if (role === "owner") return "/owner";
  if (role === "agent") return "/agent";
  return "/profile";
}

export function DashboardHeader({ userRole }: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile } = useUser();
  const router = useRouter();
  const { openLogoutModal } = useLogoutModal();
  const homeHref = marketplaceHomePath(userRole);

  const getRoleDisplayName = (role: string | null) => {
    switch (role) {
      case "admin":
        return "Administrator";
      case "owner":
        return "Property Owner";
      case "agent":
        return "Real Estate Agent";
      case "user":
      default:
        return "User";
    }
  };

  const getRoleIcon = (role: string | null) => {
    switch (role) {
      case "admin":
        return Shield;
      case "owner":
        return Building;
      case "agent":
        return Users;
      case "user":
      default:
        return Home;
    }
  };

  const RoleIcon = getRoleIcon(userRole);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Role Badge */}
          <div className="flex items-center gap-4">
            <Link href={homeHref} prefetch className="flex items-center group">
              <HeaderLogo />
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">

            {/* Role Badge */}
            {user ? (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium">
                <RoleIcon className="w-4 h-4" />
                {getRoleDisplayName(userRole)}
              </div>
            ) : (
              <div className="hidden"></div>
            )}
            
            {/* Theme Toggle */}
            <ThemeToggleCompact />

            {/* Notifications */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full"></span>
            </Button>

            {/* User Menu */}
            {user ? (
              <ProfileDropdown />
            ) : (
              <Link href="/login">
                <Button
                  variant="dark"
                  size="sm"
                  className="hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  Log In
                </Button>
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggleCompact />
            <Button
              variant="ghost"
              size="sm"
              aria-label="Open menu"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-5 h-5" />
            </Button>
          </div>
        </div>

      </div>

      <MobileAccountOverlay
        open={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Account"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 rounded-lg bg-primary/10 px-3 py-2 text-primary">
            <RoleIcon className="h-4 w-4" />
            <span className="text-sm font-medium">
              {getRoleDisplayName(userRole)}
            </span>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Avatar.Root size="sm">
              <Avatar.Fallback>
                {profile?.full_name?.charAt(0) ||
                  user?.email?.charAt(0) ||
                  "U"}
              </Avatar.Fallback>
            </Avatar.Root>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {profile?.full_name || "User"}
              </div>
              <div className="truncate text-xs text-muted-foreground">
                {user?.email}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push(homeHref);
              }}
            >
              <User className="h-4 w-4" />
              My Profile
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onClick={() => {
                setIsMobileMenuOpen(false);
                router.push("/setting");
              }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-danger hover:bg-error/10 hover:text-danger"
              onClick={() => {
                setIsMobileMenuOpen(false);
                openLogoutModal();
              }}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </MobileAccountOverlay>
    </header>
  );
}
