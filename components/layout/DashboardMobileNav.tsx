"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MoreHorizontal, X } from "lucide-react";
import {
  flattenRoleItems,
  isDashboardNavActive,
  mobileMoreItems,
  mobilePrimaryItems,
} from "@/lib/layout/dashboard-nav";

export function DashboardMobileNav({ userRole }: { userRole: string | null }) {
  const pathname = usePathname();
  const [moreOpen, setMoreOpen] = useState(false);
  const primary = mobilePrimaryItems(userRole);
  const more = mobileMoreItems(userRole);
  const allHrefs = (userRole === "admin"
    ? [...primary, ...more]
    : flattenRoleItems(userRole)
  ).map((item) => item.href);

  useEffect(() => {
    setMoreOpen(false);
  }, [pathname]);

  const moreActive = more.some((item) => isDashboardNavActive(pathname, item.href, allHrefs));

  return (
    <>
      {moreOpen ? (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Close more destinations"
            className="absolute inset-0 bg-[#07402F]/45 backdrop-blur-md"
            onClick={() => setMoreOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-16 max-h-[70vh] overflow-y-auto overscroll-y-none rounded-t-2xl border border-border/50 bg-background/95 p-4 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-200">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-heading text-lg text-[#07402F] dark:text-foreground">More</h2>
              <button
                type="button"
                aria-label="Close"
                className="rounded-full border border-border/40 p-2 text-muted-foreground"
                onClick={() => setMoreOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="space-y-2 pb-2">
              {more.map((item) => {
                const Icon = item.icon;
                const active = isDashboardNavActive(pathname, item.href, allHrefs);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setMoreOpen(false)}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 ${
                        active
                          ? "bg-brand-accent text-[#07402F]"
                          : "bg-muted/40 text-foreground hover:bg-muted"
                      }`}
                    >
                      <Icon className="h-5 w-5 shrink-0" />
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">{item.label}</span>
                        <span className="block truncate text-xs opacity-80">{item.description}</span>
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      ) : null}

      <nav
        aria-label="Workspace"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        <ul className={`grid gap-1 px-2 pt-2 ${primary.length >= 4 ? "grid-cols-5" : "grid-cols-4"}`}>
          {primary.slice(0, 4).map((item) => {
            const Icon = item.icon;
            const active = isDashboardNavActive(pathname, item.href, allHrefs);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium ${
                    active ? "text-[#07402F] dark:text-brand-accent" : "text-muted-foreground"
                  }`}
                >
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full ${
                      active ? "bg-brand-accent text-[#07402F]" : "bg-transparent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="max-w-full truncate">{item.label.split(" ")[0]}</span>
                </Link>
              </li>
            );
          })}
          <li>
            <button
              type="button"
              onClick={() => setMoreOpen((open) => !open)}
              className={`flex w-full flex-col items-center gap-1 rounded-lg px-1 py-2 text-[10px] font-medium ${
                moreOpen || moreActive ? "text-[#07402F] dark:text-brand-accent" : "text-muted-foreground"
              }`}
            >
              <span
                className={`flex h-9 w-9 items-center justify-center rounded-full ${
                  moreOpen || moreActive ? "bg-brand-accent text-[#07402F]" : "bg-transparent"
                }`}
              >
                <MoreHorizontal className="h-5 w-5" />
              </span>
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>
    </>
  );
}
