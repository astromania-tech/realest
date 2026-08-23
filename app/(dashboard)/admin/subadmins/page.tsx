import { redirect } from "next/navigation"
import { createClient, getAuthUser } from "@/lib/supabase/server"
import { SubAdminForm } from "@/components/admin/SubAdminForm"

export default async function SubAdminsPage() {
  const supabase = await createClient()
  const { data: { user } } = await getAuthUser()
  if (!user) redirect("/login?redirect=/admin/subadmins")

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single()
  if (!userRow || userRow.role !== "admin") redirect("/")

  // Fetch existing admins
  const { data: admins } = await supabase
    .from("users")
    .select("id, full_name, email, created_at")
    .eq("role", "admin")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Manage Sub-Admins</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="font-heading text-xl mb-4">Create New Sub-Admin</h2>
          <SubAdminForm />
        </div>

        <div>
          <h2 className="font-heading text-xl mb-4">Current Admins ({admins?.length ?? 0})</h2>
          {admins && admins.length > 0 ? (
            <div className="space-y-2">
              {admins.map((admin) => (
                <div key={admin.id} className="border border-border rounded-md p-3">
                  <p className="font-medium">{admin.full_name}</p>
                  <p className="text-sm text-muted-foreground">{admin.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Added: {new Date(admin.created_at).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No other admins found.</p>
          )}
        </div>
      </div>
    </div>
  )
}
