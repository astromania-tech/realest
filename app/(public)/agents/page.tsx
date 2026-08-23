import { createClient } from "@/lib/supabase/server"
import { AgentCard, type AgentCardItem } from "@/components/agent/AgentCard"

export default async function AgentsDirectoryPage({ searchParams }: { searchParams?: { state?: string } }) {
  const supabase = await createClient()

  const stateFilter = searchParams?.state ?? null

  // Fetch verified agents with optional state filter
  let query = supabase
    .from("agents")
    .select("id, agency_name, license_number, verified, verification_date, profiles(full_name, avatar_url, state), properties:properties(count) ")
    .eq("verified", true)
    .limit(50)
  if (stateFilter) query = query.eq("profiles.state", stateFilter)

  const { data: agents } = await query

  const items: AgentCardItem[] = (agents ?? []).map((a: any) => ({
    id: a.id,
    full_name: a.profiles?.full_name ?? null,
    agency_name: a.agency_name ?? null,
    license_number: a.license_number ?? null,
    state: a.profiles?.state ?? null,
    verified_at: a.verification_date ?? null,
    profile_photo_url: a.profiles?.avatar_url ?? null,
    properties_count: Array.isArray(a.properties) ? a.properties.length : null,
    average_rating: null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Find Verified Agents</h1>
        <form method="GET" className="flex items-center gap-2">
          <label className="text-sm">State:</label>
          <select name="state" className="rounded-md border border-border bg-background px-2 py-1">
            <option value="">All</option>
            <option value="LA">Lagos</option>
            <option value="FC">FCT</option>
            <option value="OG">Ogun</option>
            <option value="OY">Oyo</option>
          </select>
          <button className="text-primary underline" type="submit">Filter</button>
        </form>
      </div>

      {items.length === 0 ? (
        <p className="text-muted-foreground">No agents found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {items.map((agent) => (
            <AgentCard key={agent.id} agent={agent} />
          ))}
        </div>
      )}
    </div>
  )
}
