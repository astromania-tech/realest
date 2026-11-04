"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MapPin, Edit, Eye } from "lucide-react"

interface Property {
  id: string
  title: string
  price: number
  address: string
  city: string
  status: string
  verification_status: string
  created_at: string
}

interface OwnerListingsProps {
  properties: Property[]
}

export default function OwnerListings({ properties }: OwnerListingsProps) {
  if (properties.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">You haven't listed any properties yet</p>
            <Link href="/owner/list-property">
              <Button>List Your First Property</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <Card key={property.id} className="hover:shadow-lg transition-shadow">
          <div className="h-40 bg-gradient-to-br from-slate-400 to-slate-600 rounded-t-lg" />
          <CardContent className="pt-4">
            <h3 className="font-semibold line-clamp-2 mb-2">{property.title}</h3>
            <p className="text-2xl font-bold text-primary mb-2">£{property.price.toLocaleString()}</p>
            <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">
                {property.address}, {property.city}
              </span>
            </div>

            <div className="flex gap-2 mb-4">
              <Badge
                className={
                  property.status === "active"
                    ? "bg-green-600"
                    : property.status === "sold"
                      ? "bg-gray-600"
                      : "bg-yellow-600"
                }
              >
                {property.status.toUpperCase()}
              </Badge>
              <Badge
                variant="outline"
                className={
                  property.verification_status === "verified"
                    ? "border-green-600 text-green-600"
                    : property.verification_status === "pending"
                      ? "border-yellow-600 text-yellow-600"
                      : "border-red-600 text-red-600"
                }
              >
                {property.verification_status.toUpperCase()}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Link href={`/property/${property.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                  <Eye className="w-4 h-4" />
                  View
                </Button>
              </Link>
              <Link href={`/owner/edit-property/${property.id}`} className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-2 bg-transparent">
                  <Edit className="w-4 h-4" />
                  Edit
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
