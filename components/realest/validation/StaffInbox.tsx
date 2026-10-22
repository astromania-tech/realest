"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

type InboxItem = {
  id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean | null;
  created_at: string | null;
  data: unknown;
};

function readData(data: unknown): { href?: string | null; property_id?: string | null } {
  if (!data || typeof data !== "object" || Array.isArray(data)) return {};
  const row = data as Record<string, unknown>;
  return {
    href: typeof row.href === "string" ? row.href : null,
    property_id: typeof row.property_id === "string" ? row.property_id : null,
  };
}

function hrefFor(item: InboxItem): string | null {
  const data = readData(item.data);
  if (data.href) return data.href;
  if (data.property_id) return `/admin/validation/cases/${data.property_id}`;
  return null;
}

export function StaffInbox() {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    const response = await fetch("/api/notifications?limit=50");
    const body = await response.json().catch(() => ({}));
    setLoading(false);
    if (!response.ok) {
      setError(body.error || "Could not load notifications.");
      return;
    }
    setItems((body.notifications ?? []) as InboxItem[]);
    setUnread(Number(body.unread_count ?? 0));
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function markAllRead() {
    setPending(true);
    const response = await fetch("/api/notifications", { method: "POST" });
    setPending(false);
    if (!response.ok) {
      setError("Could not mark notifications as read.");
      return;
    }
    await load();
  }

  return (
    <div className="mx-auto min-w-0 max-w-3xl">
      <div className="mb-5 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
            Staff inbox
          </p>
          <h1 className="mt-1 font-heading text-2xl text-[#07402F] dark:text-foreground sm:text-3xl">
            Notifications
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Case-scoped alerts when you are assigned as leader, put on a team, or named check-in officer.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-11 w-full shrink-0 touch-manipulation sm:h-10 sm:w-auto"
          disabled={pending || unread === 0}
          onClick={() => void markAllRead()}
        >
          <CheckCheck className="mr-1.5 h-4 w-4" />
          Mark all read{unread > 0 ? ` (${unread})` : ""}
        </Button>
      </div>

      {loading ? <p className="text-sm text-muted-foreground">Loading inbox…</p> : null}
      {error ? <p className="mb-4 break-words text-sm text-destructive">{error}</p> : null}

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        {items.map((item) => {
          const href = hrefFor(item);
          const body = (
            <div className="flex min-w-0 items-start gap-3">
              <div
                className={`mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-xl sm:h-9 sm:w-9 ${
                  item.is_read ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                }`}
              >
                <Bell className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="break-words text-sm font-semibold leading-5">{item.title}</p>
                  {!item.is_read ? (
                    <span className="rounded-full bg-brand-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#07402F]">
                      New
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 break-words text-sm leading-5 text-muted-foreground">{item.message}</p>
                <div className="mt-2 flex flex-col gap-0.5 text-xs text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-2">
                  <span>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString("en-NG", {
                          timeZone: "Africa/Lagos",
                        })
                      : ""}
                  </span>
                  {item.type ? (
                    <span className="capitalize">{item.type.replace(/_/g, " ")}</span>
                  ) : null}
                </div>
              </div>
              {href ? (
                <ChevronRight className="mt-2 h-4 w-4 shrink-0 text-muted-foreground sm:mt-1" aria-hidden />
              ) : null}
            </div>
          );

          const rowClass =
            "block min-h-[4.5rem] border-b border-border px-3 py-3.5 last:border-b-0 touch-manipulation active:bg-secondary/50 hover:bg-secondary/40 sm:px-5 sm:py-4";

          return href ? (
            <Link key={item.id} href={href} className={rowClass}>
              {body}
            </Link>
          ) : (
            <div key={item.id} className={rowClass}>
              {body}
            </div>
          );
        })}
        {!loading && items.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-muted-foreground sm:p-12">
            No notifications yet. Assignments and team confirms appear here.
          </div>
        ) : null}
      </div>
    </div>
  );
}
