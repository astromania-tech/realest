"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { VerifyAgentRow, type AgentItem } from "./VerifyAgentRow"

interface VerifyAgentsListProps {
  initialAgents: AgentItem[]
}

export function VerifyAgentsList({ initialAgents }: VerifyAgentsListProps) {
  const [agents, setAgents] = useState<AgentItem[]>(initialAgents)
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to agents table changes
    const channel = supabase
      .channel("verify-agents-realtime")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "agents",
          filter: "verified=eq.true",
        },
        (payload) => {
          console.log("Agent updated:", payload)
          // Remove agent from list if status changed from pending
          setAgents((prev) => prev.filter((a) => a.id !== payload.old.id))
        }
      )
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "agents",
          filter: "verified=eq.false",
        },
        async (payload) => {
          console.log("New pending agent:", payload)
          // Fetch full agent details including profile
          const { data } = await supabase
            .from("agents")
            .select("id, profile_id, agency_name, license_number, verified, profiles(full_name)")
            .eq("id", payload.new.id)
            .single()

          if (data) {
            const newAgent: AgentItem = {
              id: data.id,
              profile_id: data.profile_id,
              full_name: (data.profiles as any)?.full_name ?? null,
              agency_name: data.agency_name ?? null,
              license_number: data.license_number ?? null,
              verification_status: data.verified ? "approved" : "pending",
              license_certificate_url: null,
            }
            setAgents((prev) => [newAgent, ...prev])
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase])

  function handleAction(agentId: string) {
    // Remove agent from list after action (approve/reject)
    setAgents((prev) => prev.filter((a) => a.id !== agentId))
  }

  return (
    <div className="space-y-4">
      {agents.length === 0 ? (
        <p className="text-muted-foreground">No agents pending verification.</p>
      ) : (
        agents.map((agent) => (
          <VerifyAgentRow
            key={agent.id}
            agent={agent}
            onAction={() => handleAction(agent.id)}
          />
        ))
      )}
    </div>
  )
}
