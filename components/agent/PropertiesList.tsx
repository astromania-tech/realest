"use client"

import Link from "next/link"
import { Card } from "@heroui/react"

export type PropertyListItem = {
  id: string
  title: string
  status: string
  price?: number | null
  price_frequency?: "sale" | "annual" | "monthly" | "nightly" | null
  created_at?: string | null
}

export function PropertiesList({ properties }: { properties: PropertyListItem[] }) {
  if (!properties?.length) {
    return (
      <div className="space-y-3">
        <h2 className="font-heading text-xl">Your Properties</h2>
        <Card className="p-6">
          <p className="text-muted-foreground">No properties yet. Create your first listing.</p>
          <div className="mt-4">
            <Link className="text-primary underline" href="/agent/properties/new">Create Property</Link>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <h2 className="font-heading text-xl">Your Properties</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {properties.map((p) => (
          <Card key={p.id} className="p-5 hover:shadow-lg transition-shadow">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-heading text-lg">{p.title}</h3>
                <p className="text-sm text-muted-foreground">Status: {p.status}</p>
                {typeof p.price === "number" && (
                  <p className="mt-1 font-heading">₦{p.price.toLocaleString()} {p.price_frequency && p.price_frequency !== "sale" ? `/${p.price_frequency}` : ""}</p>
                )}
                {/* Premium features: views_count and inquiries_count removed for free tier */}
              </div>
              <div className="text-right">
                <Link className="text-primary underline" href={`/agent/properties/${p.id}/edit`}>Edit</Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
