import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Eye,
  MessageSquare,
  DollarSign,
  Calendar,
} from "lucide-react";

export default async function AnalyticsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is a property owner
  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role !== "owner") {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  // Mock analytics data - in a real app, this would come from analytics tables
  const analytics = {
    totalViews: 1250,
    totalInquiries: 45,
    conversionRate: 3.6,
    averageResponseTime: "2.3 hours",
    monthlyRevenue: 250000, // in Naira
    topPerformingProperty: "Luxury 3BR Apartment in Lekki",
    recentActivity: [
      {
        date: "2024-01-15",
        action: "Property viewed",
        property: "Lekki Apartment",
      },
      {
        date: "2024-01-14",
        action: "Inquiry received",
        property: "Victoria Island Villa",
      },
      {
        date: "2024-01-13",
        action: "Property viewed",
        property: "Ikeja Duplex",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track your property performance and insights
          </p>
          {!profile?.is_premium && (
            <Badge variant="secondary" className="mt-2">
              Premium Feature - Upgrade for detailed analytics
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Eye className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {analytics.totalViews.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <MessageSquare className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {analytics.totalInquiries}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total Inquiries
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <TrendingUp className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {analytics.conversionRate}%
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Conversion Rate
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <DollarSign className="w-8 h-8 text-yellow-600" />
                <div>
                  <p className="text-2xl font-bold">
                    ₦{analytics.monthlyRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Monthly Revenue
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Property</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {analytics.topPerformingProperty}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Average response time: {analytics.averageResponseTime}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.property}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {activity.date}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
