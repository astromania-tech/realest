import { redirect } from "next/navigation"
import { createClient, getAuthUser} from "@/lib/supabase/server"
import { type AgentItem } from "@/components/admin/VerifyAgentRow"
import { VerifyAgentsList } from "@/components/admin/VerifyAgentsList"

export default async function VerifyAgentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await getAuthUser()
  if (!user) redirect("/login?redirect=/admin/verify-agents")

  const { data: userData } = await supabase
    .from("users")
    .select("id, role")
    .eq("id", user.id)
    .single()
  if (!userData || userData.role !== "admin") redirect("/")

  // Fetch pending agents with basic info
  const { data: agents } = await supabase
    .from("agents")
    .select("id, profile_id, agency_name, license_number, verification_status, license_certificate_url, profiles(full_name)")
    .eq("verification_status", "pending")
    .limit(50)

  const items: AgentItem[] = (agents ?? []).map((a: any) => ({
    id: a.id,
    profile_id: a.profile_id,
    full_name: a.profiles?.full_name ?? null,
    agency_name: a.agency_name ?? null,
    license_number: a.license_number ?? null,
    verification_status: a.verification_status ?? "pending",
    license_certificate_url: a.license_certificate_url ?? null,
  }))

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Verify Agents</h1>
      <VerifyAgentsList initialAgents={items} />
    </div>
  )
}
