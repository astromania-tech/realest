import { redirect } from "next/navigation"
import Link from "next/link"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { PropertiesList, type PropertyListItem } from "@/components/agent/PropertiesList"

export default async function AgentPropertiesPage() {
  const { data: { user } } = await getAuthUser()
  if (!user) {
    redirect("/login?redirect=/agent/properties")
  }

  const userRow = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!userRow || userRow.role !== "agent") {
    redirect("/")
  }

  const agentRow = await prisma.agents.findUnique({
    where: { profile_id: user.id },
    select: { id: true },
  })

  if (!agentRow) {
    redirect("/")
  }

  const properties = await prisma.properties.findMany({
    where: { agent_id: agentRow.id },
    select: {
      id: true,
      title: true,
      status: true,
      price: true,
      price_frequency: true,
      created_at: true,
    },
    orderBy: { created_at: "desc" },
  })

  const mappedProperties: PropertyListItem[] = properties.map((property) => ({
    id: property.id,
    title: property.title,
    status: property.status,
    price: property.price != null ? Number(property.price) : null,
    price_frequency: property.price_frequency as PropertyListItem["price_frequency"],
    created_at: property.created_at ? property.created_at.toISOString() : null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl">Manage Properties</h1>
        <Link href="/agent/properties/new" className="text-primary underline">New Property</Link>
      </div>
      <PropertiesList properties={mappedProperties} />
    </div>
  )
}
