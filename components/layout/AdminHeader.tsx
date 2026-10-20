"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Avatar, Dropdown } from "@heroui/react";
import { Bell, Settings, LogOut, User, Shield, Menu } from "lucide-react";
import { HeaderLogo } from "@/components/ui/RealEstLogo";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle-wrapper";
import { useUser } from "@/lib/hooks/useUser";
import { ProfileDropdown } from "@/components/realest";
import { useLogoutModal } from "@/components/providers/LogoutModalProvider";
import { MobileAccountOverlay } from "@/components/layout/MobileAccountOverlay";

export function AdminHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, profile } = useUser();
  const router = useRouter();
  const { openLogoutModal } = useLogoutModal();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-accent/20 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Admin Badge */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center group">
              <HeaderLogo />
            </Link>
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-3">
            {/* Admin Badge */}
            <div className="flex items-center gap-2 px-3 py-1 bg-error/10 text-error border border-error/20 shadow-sm rounded-full text-sm font-medium">
              <Shield className="w-4 h-4" />
              Administrator
            </div>
            
            <ThemeToggleCompact />

            {/* System Alerts */}
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-danger rounded-full"></span>
            </Button>

            {/* User Menu */}
            <ProfileDropdown />
          </div>

          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggleCompact />
            <Button
              variant="ghost"
              size="sm"
              aria-label="Open menu"
              onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
          <div className="flex items-center gap-2 rounded-lg bg-danger/10 px-3 py-2 text-danger">
            <Shield className="h-4 w-4" />
            <span className="text-sm font-medium">Administrator</span>
          </div>

          <div className="flex items-center gap-3 rounded-lg border p-3">
            <Avatar.Root size="sm">
              <Avatar.Fallback>
                {profile?.full_name?.charAt(0) ||
                  user?.email?.charAt(0) ||
                  "A"}
              </Avatar.Fallback>
            </Avatar.Root>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">
                {profile?.full_name || "Admin"}
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
              onPress={() => {
                setIsMobileMenuOpen(false);
                window.location.href = "/profile";
              }}
            >
              <User className="h-4 w-4" />
              My Profile
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3"
              onPress={() => {
                setIsMobileMenuOpen(false);
                window.location.href = "/settings";
              }}
            >
              <Settings className="h-4 w-4" />
              Settings
            </Button>

            <Button
              variant="ghost"
              className="relative w-full justify-start gap-3"
              onPress={() => setIsMobileMenuOpen(false)}
            >
              <Bell className="h-4 w-4" />
              Notifications
              <span className="absolute right-4 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-danger" />
            </Button>
          </div>

          <div className="space-y-2 border-t pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-muted-foreground">Theme</span>
              <ThemeToggleCompact />
            </div>

            <Button
              variant="ghost"
              className="w-full justify-start gap-3 text-danger hover:bg-error/10 hover:text-danger"
              onPress={() => {
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
