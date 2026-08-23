import { redirect } from "next/navigation"
import { getAuthUser } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { PropertyForm } from "@/components/agent/PropertyForm"

export default async function NewPropertyPage() {
  const { data: { user } } = await getAuthUser()
  if (!user) redirect("/login?redirect=/agent/properties/new")

  const userData = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  })

  if (!userData || userData.role !== "agent") redirect("/")

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl">Create Property</h1>
      <PropertyForm mode="create" />
    </div>
  )
}
