"use client";

import Link from "next/link";
import { Separator } from "@heroui/react";
import { FooterLogo } from "@/components/ui/RealEstLogo";
import { Shield, Clock } from "lucide-react";

export function AdminFooter() {
  const currentYear = new Date().getFullYear();
  const lastUpdated = new Date().toLocaleString();

  return (
    <footer className="border-t border-accent/20 bg-muted/30 mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Logo and Admin Info */}
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center">
              <FooterLogo />
            </Link>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Administrator Panel</span>
            </div>
          </div>

          {/* System Info */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>Last updated: {lastUpdated}</span>
            </div>
          </div>

          {/* Admin Links */}
          <div className="flex items-center gap-6 text-sm">
            <Link
              href="/admin/docs"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Admin Docs
            </Link>
            <Link
              href="/admin/support"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              Support
            </Link>
            <Link
              href="/admin/logs"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              System Logs
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-accent/20 mt-4 pt-4 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} RealEST Admin Panel. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
