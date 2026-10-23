import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { isStaffRole, staffHomePath } from "@/lib/auth/roles";
import { AgentOnboarding, OwnerOnboarding } from "@/components/onboarding";
import { UserSessionBoundary } from "@/components/providers/UserSessionBoundary";

export const metadata: Metadata = {
  title: "Complete Your Profile | RealEST",
  description: "Finish setting up your RealEST account to start listing or browsing verified properties.",
  robots: { index: false, follow: false },
};

export default async function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  void children;
  const {
    data: { user },
    error: authError,
  } = await getAuthUser();

  if (authError || !user) {
    redirect("/login");
  }

  const userRow = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  const role = userRow?.role ?? null;

  if (!role) {
    redirect("/login");
  }

  if (isStaffRole(role)) {
    redirect(staffHomePath(role));
  }

  if (role === "agent") {
    const agent = await prisma.agents.findUnique({
      where: { profile_id: user.id },
      select: { id: true },
    });
    if (agent) redirect("/agent");
  } else if (role === "owner") {
    const owner = await prisma.owners.findUnique({
      where: { profile_id: user.id },
      select: { id: true },
    });
    if (owner) redirect("/owner");
  } else {
    redirect("/profile");
  }

  return (
    <UserSessionBoundary>
      <div className="min-h-screen bg-background">
        {role === "agent" && <AgentOnboarding />}
        {role === "owner" && <OwnerOnboarding />}
      </div>
    </UserSessionBoundary>
  );
}
