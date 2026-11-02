import { getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { AdminBanControl } from "@/components/admin/AdminBanControl";
import { ListPager } from "@/components/realest/ListPager";
import { pageWindow, parsePage } from "@/lib/ui/page-window";
import {
  accountRoleLabel,
  accountRoles,
  usersListHref,
  usersListWhere,
  usersRoleFilter,
  usersSearchTerm,
} from "@/lib/admin/users-list";

const PAGE_SIZE = 10;

function joinedOn(value: Date | null): string {
  if (!value) return "Join date unknown";
  return new Date(value).toLocaleDateString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; role?: string }>;
}) {
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const userRow = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (userRow?.role !== "admin") {
    redirect("/");
  }

  const params = await searchParams;
  const q = usersSearchTerm(params.q);
  const role = usersRoleFilter(params.role);
  const where = usersListWhere(q, role);
  const requested = parsePage(params.page);
  const [totalUsers, activeUsers, inactiveUsers, matched] = await Promise.all([
    prisma.users.count(),
    prisma.users.count({ where: { is_active: true } }),
    prisma.users.count({ where: { is_active: false } }),
    prisma.users.count({ where }),
  ]);
  const window = pageWindow(matched, requested, PAGE_SIZE);
  if (params.page && requested !== window.page) redirect(usersListHref(window.page, q, role));
  const users = await prisma.users.findMany({
    where,
    select: {
      id: true,
      email: true,
      full_name: true,
      role: true,
      is_active: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
    skip: window.start,
    take: PAGE_SIZE,
  });

  return (
    <div className="min-w-0">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">
        Admin only
      </p>
      <h1 className="mt-1 font-heading text-2xl text-[#07402F] dark:text-foreground sm:text-3xl">
        User management
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
        Find an account and open it. Ban stays on this screen, and only for an admin looking at someone else.
      </p>

      <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Total</p>
          <p className="mt-1 font-heading text-2xl text-[#07402F] dark:text-foreground">{totalUsers}</p>
          <p className="mt-1 text-xs text-muted-foreground">Every account</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Active</p>
          <p className="mt-1 font-heading text-2xl text-[#07402F] dark:text-foreground">{activeUsers}</p>
          <p className="mt-1 text-xs text-muted-foreground">Can sign in</p>
        </div>
        <div className="rounded-2xl border border-border bg-card px-4 py-3">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground">Inactive</p>
          <p className="mt-1 font-heading text-2xl text-[#07402F] dark:text-foreground">{inactiveUsers}</p>
          <p className="mt-1 text-xs text-muted-foreground">Suspended or banned</p>
        </div>
      </div>

      <form action="/admin/users" className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <Input
          name="q"
          defaultValue={q}
          placeholder="Name or email"
          className="min-w-0 sm:flex-1"
        />
        <select
          name="role"
          defaultValue={role}
          className="border-input h-9 w-full rounded-md border bg-transparent px-3 text-base md:text-sm sm:w-44"
        >
          <option value="">All roles</option>
          {accountRoles().map((item) => (
            <option key={item} value={item}>
              {accountRoleLabel(item)}
            </option>
          ))}
        </select>
        <Button type="submit" className="w-full sm:w-auto">
          Search
        </Button>
        {q || role ? (
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/users">Clear</Link>
          </Button>
        ) : null}
      </form>

      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3 sm:px-5">
          <h2 className="text-sm font-semibold">Accounts</h2>
          <p className="text-xs text-muted-foreground">
            {matched === 1 ? "1 account" : `${matched} accounts`}
          </p>
        </div>
        {users.length === 0 ? (
          <p className="px-5 py-12 text-center text-sm text-muted-foreground">
            {q || role ? "No accounts match that search." : "No accounts yet."}
          </p>
        ) : (
          users.map((userProfile) => {
            const active = userProfile.is_active !== false;
            const mine = user.id === userProfile.id;
            return (
              <div
                key={userProfile.id}
                className="flex min-w-0 flex-col gap-3 border-b border-border px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between sm:px-5"
                style={{ contentVisibility: "auto", containIntrinsicSize: "auto 88px" }}
              >
                <div className="min-w-0">
                  <div className="flex min-w-0 items-center gap-2">
                    <p className="truncate text-sm font-medium">{userProfile.full_name || "No name"}</p>
                    <span
                      className={
                        active
                          ? "shrink-0 rounded-full bg-[#ADF434]/40 px-2 py-0.5 text-[11px] font-semibold text-[#07402F]"
                          : "shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground"
                      }
                    >
                      {active ? "Active" : "Inactive"}
                    </span>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{userProfile.email || "No email"}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {accountRoleLabel(userProfile.role)} · {joinedOn(userProfile.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/users/${userProfile.id}`}>Open</Link>
                  </Button>
                  {mine ? (
                    <span className="inline-flex h-8 items-center px-2 text-xs text-muted-foreground">You</span>
                  ) : (
                    <AdminBanControl userId={userProfile.id} isActive={active} />
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <ListPager
        page={window.page}
        pageCount={window.pageCount}
        from={window.from}
        to={window.to}
        total={matched}
        prevHref={window.page > 1 ? usersListHref(window.page - 1, q, role) : null}
        nextHref={window.page < window.pageCount ? usersListHref(window.page + 1, q, role) : null}
      />
    </div>
  );
}
