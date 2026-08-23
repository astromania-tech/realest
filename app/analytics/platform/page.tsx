import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { LineChart } from "@/components/charts/LineChart";
import { createClient } from "@/lib/supabase/server";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
}

function MetricCard({ title, value, change }: MetricCardProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && (
          <p className="text-xs text-muted-foreground mt-1">{change}</p>
        )}
      </CardContent>
    </Card>
  );
}

async function getPlatformMetrics() {
  const supabase = await createClient();

  // Get total counts
  const [userResult, propertyResult, inquiryResult] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
  ]);

  // Get user growth data for last 12 months
  const twelveMonthsAgo = subMonths(new Date(), 12);
  const { data: userGrowthData } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", twelveMonthsAgo.toISOString())
    .order("created_at");

  // Process user growth data
  const months = eachMonthOfInterval({
    start: twelveMonthsAgo,
    end: new Date(),
  });
  const userGrowth = months.map((month) => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const count =
      userGrowthData?.filter((user: any) => {
        const userDate = new Date(user.created_at);
        return userDate >= monthStart && userDate <= monthEnd;
      }).length || 0;

    return {
      date: format(month, "MMM yyyy"),
      count,
    };
  });

  return {
    totalUsers: userResult.count || 0,
    totalProperties: propertyResult.count || 0,
    totalInquiries: inquiryResult.count || 0,
    userGrowth,
  };
}

export default async function PlatformPage() {
  const metrics = await getPlatformMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Platform Overview
        </h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive metrics for RealEST platform performance and growth.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          change="+12% from last month"
        />
        <MetricCard
          title="Total Properties"
          value={metrics.totalProperties.toLocaleString()}
          change="+8% from last month"
        />
        <MetricCard
          title="Total Inquiries"
          value={metrics.totalInquiries.toLocaleString()}
          change="+15% from last month"
        />
      </div>

      {/* User Growth Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <h2 className="text-xl font-semibold text-foreground">
            User Growth Trend
          </h2>
          <p className="text-sm text-muted-foreground">
            Monthly user registrations over the past 12 months
          </p>
        </CardHeader>
        <CardContent>
          <CardContent>
            <LineChart data={metrics.userGrowth} dataKey="count" />
          </CardContent>
        </CardContent>
      </Card>

      {/* Additional Charts or Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Property Status Distribution */}
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Property Status Distribution
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Live</span>
                <span className="text-sm font-medium">1,234</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  Pending Verification
                </span>
                <span className="text-sm font-medium">567</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Rejected</span>
                <span className="text-sm font-medium">89</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Recent Activity
            </h2>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-success rounded-full"></div>
                <span className="text-sm">New property listed in Lagos</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  2m ago
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm">User verification completed</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  5m ago
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-warning rounded-full"></div>
                <span className="text-sm">Inquiry submitted for property</span>
                <span className="text-xs text-muted-foreground ml-auto">
                  10m ago
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
