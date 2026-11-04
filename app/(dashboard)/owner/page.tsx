import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { OwnerDashboardContent } from "@/components/dashboard";

export default async function OwnerDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is a property owner
  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role !== "owner") {
    redirect("/");
  }

  // Fetch owner's properties
  const { data: properties } = await supabase
    .from("properties")
    .select("*")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false });

  // Fetch inquiries for owner's properties
  const { data: inquiries } = await supabase
    .from("inquiries")
    .select("*, properties(title), profiles(full_name, email)")
    .eq("owner_id", user.id)
    .order("created_at", { ascending: false })
    .limit(10);

  return (
    <div className="min-h-screen bg-background">
      <OwnerDashboardContent
        user={user}
        properties={properties || []}
        inquiries={inquiries || []}
      />
    </div>
  );
}
