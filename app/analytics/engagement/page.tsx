import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { AreaChart } from "@/components/charts/AreaChart";
import { BarChart } from "@/components/charts/BarChart";
import { createClient } from "@/lib/supabase/server";

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

async function getEngagementMetrics() {
  const supabase = createClient();

  // Mock data for engagement metrics
  const dailyActiveUsers = [
    { date: "2024-01-01", users: 1200 },
    { date: "2024-01-02", users: 1350 },
    { date: "2024-01-03", users: 1180 },
    { date: "2024-01-04", users: 1420 },
    { date: "2024-01-05", users: 1380 },
    { date: "2024-01-06", users: 1520 },
    { date: "2024-01-07", users: 1480 },
  ];

  const inquiryTrends = [
    { month: "Jan", inquiries: 450 },
    { month: "Feb", inquiries: 520 },
    { month: "Mar", inquiries: 480 },
    { month: "Apr", inquiries: 610 },
    { month: "May", inquiries: 550 },
    { month: "Jun", inquiries: 670 },
  ];

  // Placeholder for real queries
  const totalSessions = 125000;
  const avgSessionDuration = "8m 32s";
  const bounceRate = "24.5%";

  return {
    totalSessions,
    avgSessionDuration,
    bounceRate,
    dailyActiveUsers,
    inquiryTrends,
  };
}

export default async function EngagementPage() {
  const metrics = await getEngagementMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          User Engagement Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Track user activity, interaction patterns, and engagement metrics
          across the platform.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Sessions"
          value={metrics.totalSessions.toLocaleString()}
          change="+22% from last month"
        />
        <MetricCard
          title="Avg. Session Duration"
          value={metrics.avgSessionDuration}
          change="+5% from last month"
        />
        <MetricCard
          title="Bounce Rate"
          value={metrics.bounceRate}
          change="-8% from last month"
        />
      </div>

      {/* Daily Active Users Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <h2 className="text-xl font-semibold text-foreground">
            Daily Active Users
          </h2>
          <p className="text-sm text-muted-foreground">
            User activity over the past week
          </p>
        </CardHeader>
        <CardContent>
          <AreaChart data={metrics.dailyActiveUsers} dataKey="users" />
        </CardContent>
      </Card>

      {/* Inquiry Trends and Top Pages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Inquiry Trends
            </h2>
            <p className="text-sm text-muted-foreground">
              Monthly inquiry submissions
            </p>
          </CardHeader>
          <CardContent>
            <BarChart data={metrics.inquiryTrends} dataKeys={["inquiries"]} />
          </CardContent>
        </Card>

        {/* Top Pages */}
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Top Viewed Pages
            </h2>
            <p className="text-sm text-muted-foreground">
              Most visited pages this month
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Property Search</p>
                  <p className="text-sm text-muted-foreground">/search</p>
                </div>
                <span className="text-lg font-bold text-primary">
                  45.2K views
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Property Listings</p>
                  <p className="text-sm text-muted-foreground">/explore</p>
                </div>
                <span className="text-lg font-bold text-primary">
                  32.8K views
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">How It Works</p>
                  <p className="text-sm text-muted-foreground">/how-it-works</p>
                </div>
                <span className="text-lg font-bold text-primary">
                  28.1K views
                </span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Contact Us</p>
                  <p className="text-sm text-muted-foreground">/contact</p>
                </div>
                <span className="text-lg font-bold text-primary">
                  21.5K views
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
