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
    <main className="w-full max-w-7xl mx-auto py-2 sm:py-4">
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold sm:text-3xl">My Listings</h1>
          <p className="text-muted-foreground">
            Manage your properties and inquiries
          </p>
        </div>
        <Link href="/owner/listings/new" className="shrink-0">
          <Button className="w-full gap-2 sm:w-auto">
            <Plus className="w-4 h-4" />
            List New Property
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6 sm:mb-8">
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
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 p-1">
          <TabsTrigger value="overview" className="gap-1 px-1 text-xs sm:gap-2 sm:px-3 sm:text-sm">
            <Home className="hidden h-4 w-4 sm:block" />
            Listings
          </TabsTrigger>
          <TabsTrigger value="inquiries" className="gap-1 px-1 text-xs sm:gap-2 sm:px-3 sm:text-sm">
            <MessageSquare className="hidden h-4 w-4 sm:block" />
            Inquiries
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-1 px-1 text-xs sm:gap-2 sm:px-3 sm:text-sm">
            <TrendingUp className="hidden h-4 w-4 sm:block" />
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
