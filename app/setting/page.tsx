"use client";

import { useState, useEffect } from "react";
import { Card, Button } from "@heroui/react";
import { Badge } from "@/components/ui/badge";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Activity,
  Globe,
  TrendingUp,
  AlertTriangle,
  Shield,
  Users,
  Building,
  DollarSign,
  Zap,
  MapPin,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  Settings,
  Database,
  Eye,
} from "lucide-react";

// Mock data for demonstration - in production this would come from APIs
const mockSystemData = {
  health: {
    score: 99.7,
    status: "healthy" as "healthy" | "warning" | "critical",
    uptime: "99.98%",
    responseTime: "145ms",
    errorRate: "0.02%",
  },
  validation: {
    mlQueue: 23,
    physicalQueue: 8,
    completedToday: 156,
    rejectionRate: "2.1%",
    avgProcessingTime: "4.2h",
  },
  financial: {
    revenueToday: 1250000,
    revenueThisWeek: 8750000,
    topTierRevenue: "Premium Sales",
    churnRate: "0.8%",
  },
  alerts: [
    {
      id: 1,
      type: "warning" as "warning" | "error" | "info",
      title: "ML Model Drift Detected",
      message: "Confidence score dropped below threshold in Lagos region",
      timestamp: "2 minutes ago",
      action: "Review Model",
    },
    {
      id: 2,
      type: "info" as "warning" | "error" | "info",
      title: "High Activity in Abuja",
      message: "Unusual spike in property searches (+45% vs yesterday)",
      timestamp: "15 minutes ago",
      action: "Monitor",
    },
    {
      id: 3,
      type: "error" as "warning" | "error" | "info",
      title: "Payment Gateway Timeout",
      message: "Intermittent connectivity issues with payment processor",
      timestamp: "1 hour ago",
      action: "Investigate",
    },
  ],
};

const navigationItems = [
  {
    id: "overview",
    label: "Global View",
    icon: Globe,
    href: "/setting",
    active: true,
  },
  {
    id: "validation",
    label: "Validation Control",
    icon: Shield,
    href: "/setting/validation",
  },
  {
    id: "financials",
    label: "Financials",
    icon: DollarSign,
    href: "/setting/financials",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    href: "/setting/security",
  },
  {
    id: "data-lab",
    label: "Data Lab",
    icon: Database,
    href: "/setting/data-lab",
  },
];

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "RealEST Global Control", href: "/setting", isActive: true },
];

export default function SettingPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [systemData, setSystemData] = useState(mockSystemData);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setSystemData((prev) => ({
        ...prev,
        health: {
          ...prev.health,
          responseTime: `${Math.floor(Math.random() * 50) + 120}ms`,
          score: Math.max(95, prev.health.score + (Math.random() - 0.5) * 0.1),
        },
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy":
        return "text-success";
      case "warning":
        return "text-warning";
      case "critical":
        return "text-danger";
      default:
        return "text-muted-foreground";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <XCircle className="w-4 h-4 text-danger" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
      case "info":
        return <AlertCircle className="w-4 h-4 text-info" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
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
                <div className="w-8 h-8 rounded-lg bg-linear-to-br from-brand-accent to-brand-violet flex items-center justify-center">
                  <Settings className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-heading text-white">
                    RealEST Global Control
                  </h1>
                  <p className="text-sm text-gray-400 font-body">
                    System Owner Dashboard
                  </p>
                </div>
              </div>
            </div>

            {/* System Health Status Bar */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
                <div
                  className={`w-2 h-2 rounded-full ${
                    systemData.health.status === "healthy"
                      ? "bg-success"
                      : systemData.health.status === "warning"
                        ? "bg-warning"
                        : "bg-danger"
                  } animate-pulse`}
                />
                <span className="text-sm font-medium text-gray-300">
                  System Health: {systemData.health.score.toFixed(1)}%
                </span>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Last updated</div>
                <div className="text-sm font-mono text-gray-300">
                  2 seconds ago
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
                  <Zap className="w-4 h-4" />
                  <span className="text-sm">Emergency Controls</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">System Config</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Analytics</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* System Health Gauge */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="text-center">
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <svg
                    className="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray={`${systemData.health.score}, 100`}
                      className="text-brand-accent"
                    />
                    <path
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="100, 100"
                      className="text-gray-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-2xl font-bold font-mono text-brand-accent">
                        {systemData.health.score.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">Health Score</div>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Uptime:</span>
                    <span className="font-mono text-success">
                      {systemData.health.uptime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Response:</span>
                    <span className="font-mono text-gray-300">
                      {systemData.health.responseTime}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Errors:</span>
                    <span className="font-mono text-danger">
                      {systemData.health.errorRate}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Global Map Widget */}
            <Card className="bg-gray-900/50 border-gray-800 p-6 lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                  <Globe className="w-5 h-5 text-brand-accent" />
                  Global Activity Map
                </h3>
                <Badge variant="default" className="bg-green-600 font-mono">
                  LIVE
                </Badge>
              </div>

              <div className="bg-gray-800/50 rounded-lg p-4 h-64 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-brand-accent/20 flex items-center justify-center">
                    <MapPin className="w-8 h-8 text-brand-accent" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold font-mono text-brand-accent">
                      2,847
                    </div>
                    <div className="text-sm text-gray-400">
                      Active Properties
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-lg font-semibold text-success">
                        +23
                      </div>
                      <div className="text-xs text-gray-400">New Today</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-warning">
                        156
                      </div>
                      <div className="text-xs text-gray-400">Searches/min</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-info">89</div>
                      <div className="text-xs text-gray-400">Active Users</div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Validation Pipeline & Financial Snapshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Validation Pipeline */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-brand-accent" />
                Validation Pipeline
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Database className="w-4 h-4 text-info" />
                    <span className="text-sm">ML Validation Queue</span>
                  </div>
                  <Badge variant="secondary">
                    {systemData.validation.mlQueue} pending
                  </Badge>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-warning" />
                    <span className="text-sm">Physical Vetting</span>
                  </div>
                  <Badge variant="outline">
                    {systemData.validation.physicalQueue} active
                  </Badge>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold font-mono text-success">
                        {systemData.validation.completedToday}
                      </div>
                      <div className="text-xs text-gray-400">
                        Completed Today
                      </div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold font-mono text-danger">
                        {systemData.validation.rejectionRate}
                      </div>
                      <div className="text-xs text-gray-400">
                        Rejection Rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Financial Snapshot */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <DollarSign className="w-5 h-5 text-brand-accent" />
                Financial Snapshot
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-linear-to-r from-brand-accent/20 to-brand-violet/20 rounded-lg border border-brand-accent/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Revenue Today</span>
                    <TrendingUp className="w-4 h-4 text-success" />
                  </div>
                  <div className="text-2xl font-bold font-mono text-brand-accent">
                    ₦{systemData.financial.revenueToday.toLocaleString()}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">This Week</div>
                    <div className="text-lg font-semibold font-mono text-gray-300">
                      ₦
                      {(systemData.financial.revenueThisWeek / 1000000).toFixed(
                        1,
                      )}
                      M
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg">
                    <div className="text-xs text-gray-400 mb-1">Churn Rate</div>
                    <div className="text-lg font-semibold font-mono text-warning">
                      {systemData.financial.churnRate}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Top Revenue Stream
                    </span>
                    <Badge variant="default" className="bg-green-600">
                      {systemData.financial.topTierRevenue}
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Active Alerts */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Active Alerts
              </h3>
              <Badge variant="secondary">
                {systemData.alerts.length} active
              </Badge>
            </div>

            <div className="space-y-3">
              {systemData.alerts.map((alert) => (
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

          {/* Navigation Actions */}
          <div className="flex gap-4 pt-6">
            <div className="flex gap-3">
              <Button
                className="bg-brand-accent hover:bg-brand-accent-hover text-gray-900 font-semibold"
                onClick={() => (window.location.href = "/setting/validation")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Validation Control
              </Button>
              <Button
                variant="ghost"
                className="border-brand-violet text-brand-violet hover:bg-brand-violet/20"
                onClick={() => (window.location.href = "/setting/financials")}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Financial Overview
              </Button>
              <Button
                variant="ghost"
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
                onClick={() => (window.location.href = "/setting/security")}
              >
                <Shield className="w-4 h-4 mr-2" />
                Security Center
              </Button>
            </div>
            <div className="flex gap-3 ml-auto">
              <Button
                variant="ghost"
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
                onClick={() => (window.location.href = "/setting/data-lab")}
              >
                <Database className="w-4 h-4 mr-2" />
                Data Lab
              </Button>
              <Button
                variant="ghost"
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
                onClick={() => (window.location.href = "/admin")}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Admin Dashboard
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
