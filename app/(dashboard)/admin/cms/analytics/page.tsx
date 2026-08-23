import { createClient, getAuthUser} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Users,
  Home,
  MessageSquare,
  DollarSign,
  Calendar,
  Download,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

export default async function CMSAnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is an admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    redirect("/");
  }

  // Mock analytics data (in a real app, this would come from analytics tables)
  const analyticsData = {
    overview: {
      totalUsers: 1250,
      totalProperties: 567,
      totalInquiries: 2340,
      totalRevenue: 1250000, // in Naira
      growthRate: 12.5,
    },
    userGrowth: {
      thisMonth: 145,
      lastMonth: 120,
      growth: 20.8,
    },
    propertyStats: {
      activeListings: 423,
      pendingVerification: 89,
      verifiedToday: 12,
      averagePrice: 4500000,
    },
    engagement: {
      dailyActiveUsers: 89,
      weeklyActiveUsers: 456,
      monthlyActiveUsers: 890,
      averageSessionDuration: "4:32",
    },
    revenue: {
      thisMonth: 450000,
      lastMonth: 380000,
      growth: 18.4,
      topEarningProperty: "Luxury Villa in Lekki",
    },
    recentActivity: [
      { time: "2 hours ago", event: "New user registration", details: "John Doe joined as property owner" },
      { time: "4 hours ago", event: "Property verified", details: "3BR Apartment in Ikeja approved" },
      { time: "6 hours ago", event: "Payment received", details: "₦2,500,000 for premium listing" },
      { time: "8 hours ago", event: "Inquiry submitted", details: "5 inquiries on Victoria Island properties" },
    ],
  };

  return (
    <>
      <div className="mb-8">
        <Link
          href="/admin/cms"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
        >
          ← Back to CMS Dashboard
        </Link>
        <h1 className="text-3xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">
          Comprehensive insights into platform performance and user behavior
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.totalUsers.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Home className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.totalProperties.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Properties</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <MessageSquare className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.totalInquiries.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Inquiries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <DollarSign className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">₦{analyticsData.overview.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <TrendingUp className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{analyticsData.overview.growthRate}%</p>
                <p className="text-sm text-muted-foreground">Growth</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <div className="flex gap-4 mb-6">
        <Select defaultValue="30days">
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
            <SelectItem value="1year">Last year</SelectItem>
          </SelectContent>
        </Select>

        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>

        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Report
        </Button>
      </div>

      {/* Detailed Analytics */}
      <Tabs defaultValue="users" className="space-y-6">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>This Month</span>
                    <span className="font-bold">{analyticsData.userGrowth.thisMonth}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Last Month</span>
                    <span className="font-bold">{analyticsData.userGrowth.lastMonth}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t">
                    <span>Growth Rate</span>
                    <Badge variant="default" className="bg-green-600">
                      +{analyticsData.userGrowth.growth}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Property Owners</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Agents</span>
                    <span className="font-bold">30%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Regular Users</span>
                    <span className="font-bold">25%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="properties">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Property Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Active Listings</span>
                    <span className="font-bold">{analyticsData.propertyStats.activeListings}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Pending Verification</span>
                    <span className="font-bold">{analyticsData.propertyStats.pendingVerification}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Verified Today</span>
                    <span className="font-bold text-green-600">{analyticsData.propertyStats.verifiedToday}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Average Price</span>
                    <span className="font-bold">₦{analyticsData.propertyStats.averagePrice.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Property Types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Houses</span>
                    <span className="font-bold">35%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Apartments</span>
                    <span className="font-bold">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Commercial</span>
                    <span className="font-bold">20%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Land</span>
                    <span className="font-bold">17%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="engagement">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Daily Active Users</span>
                    <span className="font-bold">{analyticsData.engagement.dailyActiveUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Weekly Active Users</span>
                    <span className="font-bold">{analyticsData.engagement.weeklyActiveUsers}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Active Users</span>
                    <span className="font-bold">{analyticsData.engagement.monthlyActiveUsers}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Avg Session Duration</span>
                    <span className="font-bold">{analyticsData.engagement.averageSessionDuration}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Property Search</span>
                    <span className="font-bold">45%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Property Details</span>
                    <span className="font-bold">28%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dashboard</span>
                    <span className="font-bold">15%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Profile</span>
                    <span className="font-bold">12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="revenue">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>This Month</span>
                    <span className="font-bold">₦{analyticsData.revenue.thisMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Month</span>
                    <span className="font-bold">₦{analyticsData.revenue.lastMonth.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t">
                    <span>Growth Rate</span>
                    <Badge variant="default" className="bg-green-600">
                      +{analyticsData.revenue.growth}%
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Earning Property</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-lg font-semibold mb-2">{analyticsData.revenue.topEarningProperty}</p>
                <p className="text-muted-foreground">Generated ₦850,000 this month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <Calendar className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="font-medium">{activity.event}</p>
                      <p className="text-sm text-muted-foreground">{activity.details}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
