import type { Prisma } from "@/lib/prisma/client";

const ACCOUNT_ROLES = [
  "user",
  "agent",
  "owner",
  "admin",
  "reviewer",
  "supervisor",
  "team_leader",
  "team_member",
] as const;

export type AccountRole = (typeof ACCOUNT_ROLES)[number];

const ROLE_LABEL: Record<AccountRole, string> = {
  user: "User",
  agent: "Agent",
  owner: "Owner",
  admin: "Admin",
  reviewer: "Reviewer",
  supervisor: "Supervisor",
  team_leader: "Team leader",
  team_member: "Team member",
};

export function accountRoles(): AccountRole[] {
  return [...ACCOUNT_ROLES];
}

export function accountRoleLabel(role: string): string {
  return ROLE_LABEL[role as AccountRole] ?? role.replaceAll("_", " ");
}

export function usersSearchTerm(raw: string | string[] | undefined): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return (value ?? "").trim().slice(0, 80);
}

export function usersRoleFilter(raw: string | string[] | undefined): AccountRole | "" {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return ACCOUNT_ROLES.includes(value as AccountRole) ? (value as AccountRole) : "";
}

export function usersListHref(page: number, q: string, role: string): string {
  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (role) params.set("role", role);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return query ? `/admin/users?${query}` : "/admin/users";
}

/** Name and email search, plus an exact role. Empty filters return every account. */
export function usersListWhere(q: string, role: string): Prisma.usersWhereInput | undefined {
  const where: Prisma.usersWhereInput = {};
  const exactRole = usersRoleFilter(role);
  if (exactRole) where.role = exactRole;
  if (q) {
    where.OR = [
      { full_name: { contains: q, mode: "insensitive" } },
      { email: { contains: q, mode: "insensitive" } },
    ];
  }
  return exactRole || q ? where : undefined;
}
