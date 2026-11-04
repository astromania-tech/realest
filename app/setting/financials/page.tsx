"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@heroui/react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Target,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Calculator,
  Zap,
  Globe,
  Shield,
  Lock,
  Database,
} from "lucide-react";

// Mock data for financial metrics
const financialData = {
  revenue: {
    today: 1250000,
    thisWeek: 8750000,
    thisMonth: 35000000,
    lastMonth: 32000000,
    growth: 9.4,
    breakdown: {
      rental: { amount: 4500000, percentage: 51.4, growth: 12.1 },
      sales: { amount: 3200000, percentage: 36.6, growth: 8.7 },
      commercial: { amount: 1050000, percentage: 12.0, growth: 5.2 },
    },
  },
  profitability: {
    rental: {
      revenue: 4500000,
      vettingCost: 225000,
      overhead: 900000,
      netMargin: 28.9,
    },
    sales: {
      revenue: 3200000,
      vettingCost: 160000,
      overhead: 640000,
      netMargin: 35.0,
    },
    commercial: {
      revenue: 1050000,
      vettingCost: 52500,
      overhead: 210000,
      netMargin: 32.1,
    },
  },
  tiers: {
    rental: {
      landlord_2: { listings: 145, revenue: 2900000, percentage: 64.4 },
      agent_1: { listings: 80, revenue: 1600000, percentage: 35.6 },
    },
    sales: {
      tier_10m_50m: { listings: 89, revenue: 3200000, percentage: 100.0 },
    },
    commercial: {
      flat_20k: { listings: 52, revenue: 1040000, percentage: 99.0 },
    },
  },
  forecasts: {
    renewalRate: {
      rental: 78.5,
      sales: 65.2,
      commercial: 82.1,
    },
    projections: [
      { month: "Dec", projected: 38500000, confidence: 85 },
      { month: "Jan", projected: 41200000, confidence: 78 },
      { month: "Feb", projected: 39800000, confidence: 82 },
    ],
  },
  alerts: [
    {
      id: 1,
      type: "warning" as "warning" | "error" | "info",
      title: "Revenue Growth Slowing",
      message: "Commercial listings revenue down 5.2% vs last month",
      timestamp: "1 hour ago",
      action: "Review Pricing",
    },
    {
      id: 2,
      type: "info" as "warning" | "error" | "info",
      title: "High Renewal Success",
      message: "Rental renewals at 78.5% - above target of 75%",
      timestamp: "3 hours ago",
      action: "Analyze Factors",
    },
    {
      id: 3,
      type: "success" as "warning" | "error" | "info",
      title: "Sales Tier Performance",
      message: "₦10M-₦50M tier showing 15% growth this quarter",
      timestamp: "6 hours ago",
      action: "Scale Marketing",
    },
  ],
};

const navigationItems = [
  {
    id: "overview",
    label: "Global View",
    icon: Globe,
    href: "/setting",
    active: false,
  },
  {
    id: "validation",
    label: "Validation Control",
    icon: Shield,
    href: "/setting/validation",
    active: false,
  },
  {
    id: "financials",
    label: "Financials & Revenue",
    icon: DollarSign,
    href: "/setting/financials",
    active: true,
  },
  {
    id: "security",
    label: "Security & Access",
    icon: Lock,
    href: "/setting/security",
    active: false,
  },
  {
    id: "data-lab",
    label: "Data & ML Oversight",
    icon: Database,
    href: "/setting/data-lab",
    active: false,
  },
];

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "RealEST Global Control", href: "/setting" },
  {
    label: "Financials & Revenue",
    href: "/setting/financials",
    isActive: true,
  },
];

export default function FinancialsPage() {
  const [data, setData] = useState(financialData);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        revenue: {
          ...prev.revenue,
          today: prev.revenue.today + Math.floor(Math.random() * 50000),
        },
      }));
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-danger" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "success":
        return <CheckCircle className="w-4 h-4 text-success" />;
      case "info":
        return <AlertTriangle className="w-4 h-4 text-info" />;
      default:
        return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-sm">
        <div className="px-6 py-4">
          {/* Breadcrumbs */}
          <div className="mb-4">
            <Breadcrumb>
              <BreadcrumbList>
                {breadcrumbItems.map((item, index) => (
                  <div key={index} className="flex items-center">
                    {index > 0 && <BreadcrumbSeparator />}
                    <BreadcrumbItem>
                      {item.isActive ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={item.href}>
                          {item.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </div>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-accent to-brand-violet flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-heading text-white">
                    Financials & Revenue
                  </h1>
                  <p className="text-sm text-gray-400 font-body">
                    Business Health & Monetization Oversight
                  </p>
                </div>
              </div>
            </div>

            {/* Financial Health Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
                <div
                  className={`w-2 h-2 rounded-full ${
                    data.revenue.growth >= 10
                      ? "bg-success"
                      : data.revenue.growth >= 5
                        ? "bg-warning"
                        : "bg-danger"
                  } animate-pulse`}
                />
                <span className="text-sm font-medium text-gray-300">
                  Growth: +{data.revenue.growth}%
                </span>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Last updated</div>
                <div className="text-sm font-mono text-gray-300">
                  45 seconds ago
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-gray-900/30 border-r border-gray-800">
          <nav className="p-4">
            <div className="mb-6">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Control Modules
              </h2>
              <div className="space-y-1">
                {navigationItems.map((item) => (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                      item.active
                        ? "bg-brand-accent/20 text-brand-accent border border-brand-accent/30"
                        : "text-gray-400 hover:text-white hover:bg-gray-800/50"
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="font-medium">{item.label}</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Actions Sidebar */}
            <div>
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Quick Actions
              </h2>
              <div className="space-y-1">
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <Calculator className="w-4 h-4" />
                  <span className="text-sm">Run Pricing Simulation</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Export Report</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <Target className="w-4 h-4" />
                  <span className="text-sm">Adjust Tiers</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Revenue Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Today</span>
                <TrendingUp className="w-4 h-4 text-success" />
              </div>
              <div className="text-2xl font-bold font-mono text-brand-accent">
                {formatCurrency(data.revenue.today)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                +12.5% vs yesterday
              </div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">This Week</span>
                <BarChart3 className="w-4 h-4 text-info" />
              </div>
              <div className="text-2xl font-bold font-mono text-gray-300">
                {formatCurrency(data.revenue.thisWeek)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                +8.7% vs last week
              </div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">This Month</span>
                <PieChart className="w-4 h-4 text-warning" />
              </div>
              <div className="text-2xl font-bold font-mono text-gray-300">
                {formatCurrency(data.revenue.thisMonth)}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                +9.4% vs last month
              </div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Growth Rate</span>
                <Target className="w-4 h-4 text-success" />
              </div>
              <div className="text-2xl font-bold font-mono text-success">
                +{data.revenue.growth}%
              </div>
              <div className="text-xs text-gray-400 mt-1">Monthly growth</div>
            </Card>
          </div>

          {/* Revenue Breakdown & Profitability */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Breakdown by Type */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <PieChart className="w-5 h-5 text-brand-accent" />
                Revenue Breakdown by Type
              </h3>

              <div className="space-y-4">
                {Object.entries(data.revenue.breakdown).map(([type, info]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium capitalize">
                        {type}
                      </span>
                      <div className="text-right">
                        <div className="text-sm font-semibold font-mono">
                          {formatCurrency(info.amount)}
                        </div>
                        <div className="text-xs text-gray-400">
                          {info.percentage}% • {info.growth > 0 ? "+" : ""}
                          {info.growth}%
                        </div>
                      </div>
                    </div>
                    <Progress
                      value={info.percentage}
                      className="h-2 [&>div]:bg-brand-accent"
                    />
                  </div>
                ))}
              </div>
            </Card>

            {/* Profitability Analysis */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <Calculator className="w-5 h-5 text-brand-accent" />
                Profitability by Listing Type
              </h3>

              <div className="space-y-4">
                {Object.entries(data.profitability).map(([type, metrics]) => (
                  <div key={type} className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-medium capitalize">
                        {type}
                      </span>
                      <Badge variant="default" className="bg-success">
                        {metrics.netMargin}% margin
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="text-gray-400">Revenue</div>
                        <div className="font-semibold font-mono text-success">
                          {formatCurrency(metrics.revenue)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Vetting Cost</div>
                        <div className="font-semibold font-mono text-danger">
                          -{formatCurrency(metrics.vettingCost)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Overhead</div>
                        <div className="font-semibold font-mono text-danger">
                          -{formatCurrency(metrics.overhead)}
                        </div>
                      </div>
                      <div>
                        <div className="text-gray-400">Net Profit</div>
                        <div className="font-semibold font-mono text-brand-accent">
                          {formatCurrency(
                            metrics.revenue -
                              metrics.vettingCost -
                              metrics.overhead,
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Tiered Revenue & Renewal Forecast */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tiered Revenue Structure */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <BarChart3 className="w-5 h-5 text-brand-accent" />
                Tiered Revenue Structure
              </h3>

              <div className="space-y-4">
                {Object.entries(data.tiers).map(([category, tiers]) => (
                  <div key={category} className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-300 capitalize mb-2">
                      {category} Tiers
                    </h4>
                    {Object.entries(tiers).map(([tier, info]) => (
                      <div
                        key={tier}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-brand-accent" />
                          <span className="text-sm">
                            {tier
                              .replace(/_/g, " ")
                              .replace(/(\d+m)/g, "₦$1")
                              .toUpperCase()}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold font-mono">
                            {formatCurrency(info.revenue)}
                          </div>
                          <div className="text-xs text-gray-400">
                            {info.listings} listings • {info.percentage}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </Card>

            {/* Renewal Rate Forecast */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <RefreshCw className="w-5 h-5 text-brand-accent" />
                Renewal Rate Forecast
              </h3>

              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    Current Renewal Rates
                  </h4>
                  {Object.entries(data.forecasts.renewalRate).map(
                    ([type, rate]) => (
                      <div
                        key={type}
                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded"
                      >
                        <span className="text-sm capitalize">{type}</span>
                        <div className="flex items-center gap-2">
                          <Progress
                            value={rate}
                            className="w-16 h-2 [&>div]:bg-success"
                          />
                          <span
                            className={`text-sm font-semibold font-mono ${
                              rate >= 75
                                ? "text-success"
                                : rate >= 60
                                  ? "text-warning"
                                  : "text-danger"
                            }`}
                          >
                            {rate}%
                          </span>
                        </div>
                      </div>
                    ),
                  )}
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-3">
                    3-Month Revenue Projection
                  </h4>
                  <div className="space-y-2">
                    {data.forecasts.projections.map((projection, index) => (
                      <div className="flex items-center justify-between p-2 bg-gray-800/30 rounded">
                        <span className="text-sm font-medium">
                          {projection.month}
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-mono text-gray-300">
                            {formatCurrency(projection.projected)}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {projection.confidence}% confidence
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Financial Alerts */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Financial Alerts & Insights
              </h3>
              <Badge variant="secondary">{data.alerts.length} active</Badge>
            </div>

            <div className="space-y-3">
              {data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 p-4 bg-gray-800/50 rounded-lg border border-gray-700"
                >
                  {getAlertIcon(alert.type)}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-medium text-sm">{alert.title}</h4>
                      <span className="text-xs text-gray-400 font-mono">
                        {alert.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mb-3">
                      {alert.message}
                    </p>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-brand-accent hover:bg-brand-accent/20"
                    >
                      {alert.action}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions */}
          <div className="flex gap-4 pt-6">
            <Button className="bg-brand-accent hover:bg-brand-accent-hover text-gray-900 font-semibold">
              <Calculator className="w-4 h-4 mr-2" />
              Run Pricing Simulation
            </Button>
            <Button
              variant="ghost"
              className="border-brand-violet text-brand-violet hover:bg-brand-violet/20"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Export Financial Report
            </Button>
            <Button
              variant="ghost"
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              <Target className="w-4 h-4 mr-2" />
              Adjust Revenue Tiers
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
