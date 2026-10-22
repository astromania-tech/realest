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

  const [{ data: properties }, { data: inquiries }] = await Promise.all([
    supabase
      .from("properties")
      .select(
        "id, title, price, address, city, status, verification_status, created_at",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("inquiries")
      .select(
        "id, status, message, created_at, properties(title), profiles(full_name, email)",
      )
      .eq("owner_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const inquiryRows = (inquiries ?? []).map((row) => ({
    id: row.id,
    message: row.message,
    status: row.status,
    created_at: row.created_at,
    properties: Array.isArray(row.properties)
      ? row.properties[0] ?? { title: "" }
      : row.properties ?? { title: "" },
    profiles: Array.isArray(row.profiles)
      ? row.profiles[0] ?? { full_name: "", email: "" }
      : row.profiles ?? { full_name: "", email: "" },
  }));

  return (
    <div className="min-h-screen bg-background">
      <OwnerDashboardContent
        user={user}
        properties={properties || []}
        inquiries={inquiryRows}
      />
    </div>
  );
}
