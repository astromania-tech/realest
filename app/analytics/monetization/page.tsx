import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { BarChart } from "@/components/charts/BarChart";
import { PieChart } from "@/components/charts/PieChart";
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

async function getMonetizationMetrics() {
  const supabase = createClient();

  // Mock data for now - replace with actual queries
  // Assume transactions table with amount, type, created_at
  const revenueData = [
    { month: "Jan", revenue: 45000, fees: 2250 },
    { month: "Feb", revenue: 52000, fees: 2600 },
    { month: "Mar", revenue: 48000, fees: 2400 },
    { month: "Apr", revenue: 61000, fees: 3050 },
    { month: "May", revenue: 55000, fees: 2750 },
    { month: "Jun", revenue: 67000, fees: 3350 },
  ];

  const feeBreakdown = [
    { name: "Listing Fees", value: 45, color: "#07402F" },
    { name: "Premium Upgrades", value: 30, color: "#2E322E" },
    { name: "Transaction Fees", value: 25, color: "#ADF434" },
  ];

  // Placeholder for real queries
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.revenue, 0);
  const totalFees = revenueData.reduce((sum, item) => sum + item.fees, 0);

  return {
    totalRevenue,
    totalFees,
    revenueData,
    feeBreakdown,
  };
}

export default async function MonetizationPage() {
  const metrics = await getMonetizationMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Monetization Analytics
        </h1>
        <p className="text-muted-foreground mt-2">
          Revenue tracking, fee collection, and monetization performance
          metrics.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Revenue"
          value={`₦${metrics.totalRevenue.toLocaleString()}`}
          change="+18% from last month"
        />
        <MetricCard
          title="Total Fees Collected"
          value={`₦${metrics.totalFees.toLocaleString()}`}
          change="+15% from last month"
        />
        <MetricCard title="Average Fee Rate" value="5.0%" change="Stable" />
      </div>

      {/* Revenue Trend Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <h2 className="text-xl font-semibold text-foreground">
            Revenue & Fees Trend
          </h2>
          <p className="text-sm text-muted-foreground">
            Monthly revenue and fee collection over the past 6 months
          </p>
        </CardHeader>
        <CardContent>
          <BarChart data={metrics.revenueData} dataKeys={["revenue", "fees"]} />
        </CardContent>
      </Card>

      {/* Fee Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Fee Breakdown
            </h2>
            <p className="text-sm text-muted-foreground">
              Distribution of revenue sources
            </p>
          </CardHeader>
          <CardContent>
            <PieChart data={metrics.feeBreakdown} />
          </CardContent>
        </Card>

        {/* Top Earning Properties */}
        <Card className="bg-card border-border">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">
              Top Earning Properties
            </h2>
            <p className="text-sm text-muted-foreground">
              Properties generating the most revenue this month
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Luxury Villa in Lekki</p>
                  <p className="text-sm text-muted-foreground">
                    Property ID: 12345
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">₦2.5M</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">Commercial Space in VI</p>
                  <p className="text-sm text-muted-foreground">
                    Property ID: 12346
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">₦1.8M</span>
              </div>
              <div className="flex justify-between items-center">
                <div>
                  <p className="font-medium">3BR Apartment in Ikeja</p>
                  <p className="text-sm text-muted-foreground">
                    Property ID: 12347
                  </p>
                </div>
                <span className="text-lg font-bold text-primary">₦1.2M</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
