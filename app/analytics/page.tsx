import Link from "next/link";
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

interface NavigationTileProps {
  title: string;
  description: string;
  href: string;
}

function NavigationTile({ title, description, href }: NavigationTileProps) {
  return (
    <Link href={href}>
      <Card className="bg-card border-border hover:bg-accent/10 transition-colors cursor-pointer h-full">
        <CardHeader>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
        </CardContent>
      </Card>
    </Link>
  );
}

async function getAnalyticsOverview() {
  const supabase = await createClient();

  // Fetch total counts
  const [
    { count: totalUsers },
    { count: totalProperties },
    { count: totalInquiries },
    { count: verifiedProperties },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("properties").select("*", { count: "exact", head: true }),
    supabase.from("inquiries").select("*", { count: "exact", head: true }),
    supabase
      .from("properties")
      .select("*", { count: "exact", head: true })
      .eq("verified_status", "approved"),
  ]);

  // Placeholder for revenue (enhance with actual monetization data later)
  const revenue = 0;

  // Fetch user growth data for last 6 months
  const sixMonthsAgo = subMonths(new Date(), 6);
  const { data: userGrowthData } = await supabase
    .from("profiles")
    .select("created_at")
    .gte("created_at", sixMonthsAgo.toISOString())
    .order("created_at");

  // Process growth data
  const months = eachMonthOfInterval({
    start: sixMonthsAgo,
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
      date: format(month, "MMM"),
      count,
    };
  });

  return {
    totalUsers: totalUsers || 0,
    totalProperties: totalProperties || 0,
    totalInquiries: totalInquiries || 0,
    verifiedProperties: verifiedProperties || 0,
    revenue,
    userGrowth,
  };
}

export default async function AnalyticsPage() {
  const data = await getAnalyticsOverview();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-foreground">
          Analytics Dashboard
        </h1>
        <p className="text-muted-foreground mt-2">
          Overview of RealEST platform metrics and insights.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Total Users"
          value={data.totalUsers.toLocaleString()}
        />
        <MetricCard
          title="Total Properties"
          value={data.totalProperties.toLocaleString()}
        />
        <MetricCard
          title="Total Inquiries"
          value={data.totalInquiries.toLocaleString()}
        />
        <MetricCard
          title="Verified Properties"
          value={data.verifiedProperties.toLocaleString()}
        />
      </div>

      {/* Chart Preview */}
      <Card className="bg-card border-border">
        <CardHeader>
          <h2 className="text-xl font-semibold text-foreground">
            User Growth (Last 6 Months)
          </h2>
          <p className="text-sm text-muted-foreground">
            Monthly user registrations
          </p>
        </CardHeader>
        <CardContent>
          <LineChart data={data.userGrowth} dataKey="count" height={300} />
        </CardContent>
      </Card>

      {/* Navigation Tiles */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-4">
          Explore Analytics
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <NavigationTile
            title="Platform"
            description="Platform performance, user growth, and system metrics."
            href="/analytics/platform"
          />
          <NavigationTile
            title="Monetization"
            description="Revenue streams, pricing analytics, and financial insights."
            href="/analytics/monetization"
          />
          <NavigationTile
            title="Engagement"
            description="User engagement, interaction patterns, and activity metrics."
            href="/analytics/engagement"
          />
          <NavigationTile
            title="Validation"
            description="Property verification status, approval rates, and quality metrics."
            href="/analytics/validation"
          />
          <NavigationTile
            title="Team"
            description="Team performance, productivity metrics, and operational insights."
            href="/analytics/team"
          />
        </div>
      </div>
    </div>
  );
}
