"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import Link from "next/link"
import { Plus, Home, MessageSquare, TrendingUp } from "lucide-react"
import OwnerListings from "@/components/dashboard/OwnerListings"
import OwnerInquiries from "@/components/dashboard/OwnerInquiries"

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

interface Inquiry {
  id: string
  message: string
  status: string
  created_at: string
  properties: { title: string }
  profiles: { full_name: string; email: string }
}

interface OwnerDashboardContentProps {
  user: User
  properties: Property[]
  inquiries: Inquiry[]
}

export default function OwnerDashboardContent({
  user,
  properties,
  inquiries,
}: OwnerDashboardContentProps) {
  const [activeTab, setActiveTab] = useState("overview")

  const activeListings = properties.filter((p) => p.status === "active").length
  const totalInquiries = inquiries.length
  const verifiedProperties = properties.filter(
    (p) => p.verification_status === "verified",
  ).length

  return (
    <main className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your properties and inquiries
          </p>
        </div>
        <Link href="/owner/listings/new">
          <Button className="gap-2">
            <Plus className="w-4 h-4" />
            List New Property
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Properties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{properties.length}</div>
            <p className="text-xs text-muted-foreground mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Active Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">
              {activeListings}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Currently active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Inquiries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">
              {totalInquiries}
            </div>
            <p className="text-xs text-muted-foreground mt-1">New this week</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Verified
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              {verifiedProperties}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Verified properties
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview" className="gap-2">
            <Home className="w-4 h-4" />
            My Listings
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Inquiries
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <OwnerListings properties={properties} />
        </TabsContent>

        <TabsContent value="inquiries" className="mt-6">
          <OwnerInquiries inquiries={inquiries} />
        </TabsContent>

        <TabsContent value="analytics" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <p className="text-muted-foreground">Analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
}
