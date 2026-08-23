import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { PropertyForm } from "@/components/agent/PropertyForm"

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const { data: { user } } = await getAuthUser()
  if (!user) redirect(`/login?redirect=/agent/properties/${id}/edit`)

  const userRow = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!userRow || userRow.role !== "agent") redirect("/")

  const agentRow = await prisma.agents.findUnique({
    where: { profile_id: user.id },
    select: { id: true },
  })

  if (!agentRow) redirect("/")

  const property = await prisma.properties.findFirst({
    where: {
      id,
      agent_id: agentRow.id,
    },
    select: {
      id: true,
      title: true,
      description: true,
      address: true,
      state: true,
      city: true,
      property_type: true,
      price: true,
      price_frequency: true,
      listing_type: true,
    },
  })

  if (!property) redirect("/agent/properties")

  const initialProperty = {
    ...property,
    price: Number(property.price),
  }

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Edit Property</h1>
      <PropertyForm mode="edit" initial={initialProperty} />
    </div>
  )
}
