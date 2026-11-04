"use client";

import Link from "next/link";
import { useState } from "react";
import { Avatar } from "@heroui/react";
import { Button } from "../ui";
import {
  Menu,
  X,
  Bell,
  Settings,
  LogOut,
  User,
  Home,
  Building,
  Users,
  Shield,
  BarChart3,
} from "lucide-react";
import { HeaderLogo } from "@/components/ui/RealEstLogo";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle-wrapper";
import { useUser } from "@/lib/hooks/useUser";
import { ProfileDropdown } from "@/components/realest";
import { useLogoutModal } from "@/components/providers/LogoutModalProvider";

interface DashboardHeaderProps {
  userRole: string | null;
}

export function DashboardHeader({ userRole }: DashboardHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile } = useUser();
  const { openLogoutModal } = useLogoutModal();

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
            <Link href="/" className="flex items-center group">
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

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
            <div className="px-4 py-6 space-y-4">
              {/* Role Badge Mobile */}
              <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary rounded-lg">
                <RoleIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  {getRoleDisplayName(userRole)}
                </span>
              </div>

              {/* Mobile User Info */}
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar.Root size="sm">
                  <Avatar.Fallback>
                    {profile?.full_name?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "U"}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div>
                  <div className="font-medium text-sm">
                    {profile?.full_name || "User"}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {user?.email}
                  </div>
                </div>
              </div>

              {/* Mobile Actions */}
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.href = "/profile";
                  }}
                >
                  <User className="w-4 h-4" />
                  My Profile
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    window.location.href = "/settings";
                  }}
                >
                  <Settings className="w-4 h-4" />
                  Settings
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 relative"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Bell className="w-4 h-4" />
                  Notifications
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-danger rounded-full"></span>
                </Button>
              </div>

              {/* Mobile Theme Toggle & Logout */}
              <div className="pt-4 border-t space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-muted-foreground">
                    Theme
                  </span>
                  <ThemeToggleCompact />
                </div>

                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 text-danger hover:text-danger hover:bg-error/10"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openLogoutModal();
                  }}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
