import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient, getAuthUser } from "@/lib/supabase/server";
import { AgentOnboarding, OwnerOnboarding } from "@/components/onboarding";

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
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await getAuthUser();

  if (authError || !user) {
    redirect("/login");
  }

  const userType =
    user.app_metadata?.role || user.user_metadata?.user_type || null;

  if (!userType) {
    redirect("/login");
  }

  // Check if user has already completed onboarding
  if (userType === "agent") {
    const { data: agent } = await supabase
      .from("agents")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (agent) {
      redirect("/agent");
    }
  } else if (userType === "owner") {
    const { data: owner } = await supabase
      .from("owners")
      .select("id")
      .eq("profile_id", user.id)
      .single();

    if (owner) {
      redirect("/owner");
    }
  } else if (userType === "admin") {
    redirect("/admin");
  } else {
    // For 'user' type or others, redirect to profile
    redirect("/profile");
  }

  return (
    <div className="min-h-screen bg-background">
      {userType === "agent" && <AgentOnboarding />}
      {userType === "owner" && <OwnerOnboarding />}
    </div>
  );
}
