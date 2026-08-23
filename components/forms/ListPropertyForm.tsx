"use client"

import { PropertyForm } from "@/components/agent/PropertyForm"

interface ListPropertyFormProps {
  userId: string
}

export default function ListPropertyForm({ userId }: ListPropertyFormProps) {
  return (
    <PropertyForm mode="create" role="owner" />
  )
}
