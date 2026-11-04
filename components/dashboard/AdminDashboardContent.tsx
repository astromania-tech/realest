"use client"

import { useState } from "react"
import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileCheck, 
  Home, 
  AlertTriangle,
  Clock,
  Users,
  Building,
  BarChart3
} from "lucide-react"
import AdminPropertyVerification from "@/components/dashboard/AdminPropertyVerification"
import AdminDocumentVerification from "@/components/dashboard/AdminDocumentVerification"

interface Property {
  id: string
  title: string
  address: string
  city: string
  price: number
  verification_status: string
  created_at: string
  owners?: { profiles?: { full_name: string; email: string } | null } | null
}

interface PropertyDocument {
  id: string
  document_type: string
  file_name: string
  verification_status: string
  created_at: string
  properties: { title: string; owner_id: string }
}

interface AdminDashboardContentProps {
  user: User
  pendingProperties: Property[]
  pendingDocuments: PropertyDocument[]
  verifiedCount: number
  rejectedCount: number
}

export default function AdminDashboardContent({
  user,
  pendingProperties,
  pendingDocuments,
  verifiedCount,
  rejectedCount,
}: AdminDashboardContentProps) {
  const [activeTab, setActiveTab] = useState("properties")
  const [systemStats] = useState({
      totalUsers: 1250,
      pendingVerifications: 23,
      activeProperties: 456,
      systemHealth: "healthy" as "healthy" | "warning" | "critical",
    });

  return (
    <main className="container px-8">

    {/* System Status Bar */}
     <div className="bg-background border-b border-accent/20 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${
                systemStats.systemHealth === "healthy"
                  ? "bg-success"
                  : systemStats.systemHealth === "warning"
                    ? "bg-warning"
                    : "bg-danger"
              }`}
            />
            <span className="text-sm font-medium">
              System {systemStats.systemHealth}
            </span>
          </div>
          <span className="text-sm text-muted-foreground">
            {systemStats.totalUsers} Users
          </span>
          <span className="text-sm text-muted-foreground">
            {systemStats.pendingVerifications} Pending
          </span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>
    </div>

      {/* Quick Stats */}
      <div className="px-6 py-4 border-b border-accent/20 bg-muted/20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-accent/10">
            <Users className="w-8 h-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">
                {systemStats.totalUsers}
              </div>
              <div className="text-xs text-muted-foreground">
                Total Users
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-accent/10">
            <Building className="w-8 h-8 text-primary" />
            <div>
              <div className="text-2xl font-bold">
                {systemStats.activeProperties}
              </div>
              <div className="text-xs text-muted-foreground">
                Active Properties
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-accent/10">
            <AlertTriangle className="w-8 h-8 text-warning" />
            <div>
              <div className="text-2xl font-bold">
                {systemStats.pendingVerifications}
              </div>
              <div className="text-xs text-muted-foreground">
                Pending Reviews
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 bg-background rounded-lg border border-accent/10">
            <BarChart3 className="w-8 h-8 text-success" />
            <div>
              <div className="text-2xl font-bold">98.5%</div>
              <div className="text-xs text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8 p-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Verify and manage property listings</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-600">{pendingProperties.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting verification</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Verified Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{verifiedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Approved listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{rejectedCount}</div>
            <p className="text-xs text-muted-foreground mt-1">Rejected listings</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{pendingDocuments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Awaiting review</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="properties" className="gap-2">
            <Home className="w-4 h-4" />
            Properties
          </TabsTrigger>
          <TabsTrigger value="documents" className="gap-2">
            <FileCheck className="w-4 h-4" />
            Documents
          </TabsTrigger>
        </TabsList>

        <TabsContent value="properties" className="mt-6">
          <AdminPropertyVerification properties={pendingProperties} />
        </TabsContent>

        <TabsContent value="documents" className="mt-6">
          <AdminDocumentVerification documents={pendingDocuments} />
        </TabsContent>
      </Tabs>
    </main>
  )
}
