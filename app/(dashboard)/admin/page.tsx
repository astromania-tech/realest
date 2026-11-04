import { createClient, getAuthUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AdminDashboardContent } from "@/components/dashboard"

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await getAuthUser()

  if (!user) {
    redirect("/login")
  }

  // Check if user is an admin
  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).single()

  if (userRow?.role !== "admin") {
    redirect("/")
  }

  // Fetch pending properties for verification
  const { data: pendingProperties } = await supabase
    .from("properties")
    .select("*, owners(profiles(full_name, email))")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true })

  // Fetch pending documents
  const { data: pendingDocuments } = await supabase
    .from("property_documents")
    .select("*, properties(title, owner_id)")
    .eq("verification_status", "pending")
    .order("created_at", { ascending: true })

  // Fetch verified properties count
  const { count: verifiedCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "verified")

  // Fetch rejected properties count
  const { count: rejectedCount } = await supabase
    .from("properties")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "rejected")

  return (
    <>
      <AdminDashboardContent
        user={user}
        pendingProperties={pendingProperties || []}
        pendingDocuments={pendingDocuments || []}
        verifiedCount={verifiedCount || 0}
        rejectedCount={rejectedCount || 0}
      />
    </>
  )
}
