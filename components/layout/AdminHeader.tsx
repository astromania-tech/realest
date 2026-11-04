"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Avatar, Dropdown } from "@heroui/react";
import { Menu, X, Bell, Settings, LogOut, User, Shield } from "lucide-react";
import { HeaderLogo } from "@/components/ui/RealEstLogo";
import { ThemeToggleCompact } from "@/components/ui/theme-toggle-wrapper";
import { useUser } from "@/lib/hooks/useUser";
import { ProfileDropdown } from "@/components/realest";
import { useLogoutModal } from "@/components/providers/LogoutModalProvider";

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

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onPress={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
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
              {/* Admin Badge Mobile */}
              <div className="flex items-center gap-2 px-3 py-2 bg-danger/10 text-danger rounded-lg">
                <Shield className="w-4 h-4" />
                <span className="text-sm font-medium">Administrator</span>
              </div>

              {/* Mobile User Info */}
              <div className="flex items-center gap-3 p-3 border rounded-lg">
                <Avatar.Root size="sm">
                  <Avatar.Fallback>
                    {profile?.full_name?.charAt(0) ||
                      user?.email?.charAt(0) ||
                      "A"}
                  </Avatar.Fallback>
                </Avatar.Root>
                <div>
                  <div className="font-medium text-sm">
                    {profile?.full_name || "Admin"}
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
                  onPress={() => {
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
                  onPress={() => {
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
                  onPress={() => setIsMobileMenuOpen(false)}
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
                  onPress={() => {
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
