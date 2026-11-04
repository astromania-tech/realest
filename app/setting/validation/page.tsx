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
  Shield,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Database,
  Activity,
  BarChart3,
  Target,
  AlertCircle,
  Zap,
  Globe,
  DollarSign,
  Lock,
} from "lucide-react";
import { ValidationQueuePanel } from "@/components/realest/validation/ValidationQueuePanel";

// Mock data for validation metrics
const validationData = {
  mlModel: {
    currentConfidence: 94.7,
    baselineConfidence: 96.2,
    driftThreshold: 2.0,
    isDrifting: true,
    lastUpdated: "2 minutes ago",
    confidenceHistory: [
      { time: "00:00", confidence: 96.1 },
      { time: "04:00", confidence: 95.8 },
      { time: "08:00", confidence: 95.3 },
      { time: "12:00", confidence: 94.9 },
      { time: "16:00", confidence: 94.7 },
      { time: "20:00", confidence: 94.2 },
    ],
  },
  logistics: {
    avgSubmitToMl: "2.3h",
    avgMlToVetting: "4.1h",
    avgTotalProcess: "6.4h",
    teamUtilization: 78,
    bottlenecks: [
      { stage: "ML Validation", delay: "2.1h", status: "high" },
      { stage: "Physical Vetting", delay: "1.8h", status: "medium" },
      { stage: "Document Review", delay: "0.9h", status: "low" },
    ],
  },
  geotagAccuracy: {
    overallAccuracy: 87.3,
    avgDeviation: 45.2, // meters
    regionalData: [
      { region: "Lagos", accuracy: 92.1, deviation: 28.5 },
      { region: "Abuja", accuracy: 89.4, deviation: 35.2 },
      { region: "Port Harcourt", accuracy: 85.6, deviation: 52.1 },
      { region: "Kano", accuracy: 83.2, deviation: 61.8 },
      { region: "Ibadan", accuracy: 86.9, deviation: 48.3 },
    ],
  },
  alerts: [
    {
      id: 1,
      type: "warning" as "warning" | "error" | "info",
      title: "ML Model Confidence Dropping",
      message: "Model confidence fell below 95% threshold in Lagos region",
      timestamp: "15 minutes ago",
      action: "Retrain Model",
    },
    {
      id: 2,
      type: "error" as "warning" | "error" | "info",
      title: "Geotag Accuracy Alert",
      message: "Kano region showing 15% accuracy drop in property locations",
      timestamp: "1 hour ago",
      action: "Review Geocoding",
    },
    {
      id: 3,
      type: "info" as "warning" | "error" | "info",
      title: "Vetting Team Overloaded",
      message: "Port Harcourt team at 95% capacity - consider redistribution",
      timestamp: "2 hours ago",
      action: "Reassign Tasks",
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
    active: true,
  },
  {
    id: "financials",
    label: "Financials & Revenue",
    icon: DollarSign,
    href: "/setting/financials",
    active: false,
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
  { label: "Validation Control", href: "/setting/validation", isActive: true },
];

export default function ValidationPage() {
  const [data, setData] = useState(validationData);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        mlModel: {
          ...prev.mlModel,
          currentConfidence: Math.max(
            90,
            prev.mlModel.currentConfidence + (Math.random() - 0.5) * 0.3,
          ),
        },
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "high":
        return "text-danger";
      case "medium":
        return "text-warning";
      case "low":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-danger" />;
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
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-heading text-white">
                    Validation Control
                  </h1>
                  <p className="text-sm text-gray-400 font-body">
                    Dual-Layer Verification Oversight
                  </p>
                </div>
              </div>
            </div>

            {/* Validation Health Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
                <div
                  className={`w-2 h-2 rounded-full ${
                    data.mlModel.isDrifting
                      ? "bg-warning animate-pulse"
                      : "bg-success"
                  }`}
                />
                <span className="text-sm font-medium text-gray-300">
                  ML Health: {data.mlModel.currentConfidence.toFixed(1)}%
                </span>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Last updated</div>
                <div className="text-sm font-mono text-gray-300">
                  30 seconds ago
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
                  <span className="text-sm">Retrain Model</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">View Metrics</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm">Settings</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* ML Model Drift Monitor */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                  <Database className="w-5 h-5 text-brand-accent" />
                  ML Model Drift Monitor
                </h3>
                <Badge
                  variant="default"
                  className={
                    data.mlModel.isDrifting ? "bg-warning" : "bg-success"
                  }
                >
                  {data.mlModel.isDrifting ? "Drifting" : "Stable"}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                  <div>
                    <div className="text-sm text-gray-400">
                      Current Confidence
                    </div>
                    <div className="text-2xl font-bold font-mono text-brand-accent">
                      {data.mlModel.currentConfidence.toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-400">Baseline</div>
                    <div className="text-lg font-semibold font-mono text-gray-300">
                      {data.mlModel.baselineConfidence}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">24h Confidence Trend</span>
                    <span
                      className={`font-medium ${data.mlModel.isDrifting ? "text-danger" : "text-success"}`}
                    >
                      {data.mlModel.isDrifting ? "↓ Drifting" : "→ Stable"}
                    </span>
                  </div>
                  <div className="h-20 bg-gray-800/50 rounded p-2">
                    <div className="flex items-end justify-between h-full gap-1">
                      {data.mlModel.confidenceHistory.map((point, index) => (
                        <div
                          key={index}
                          className="flex flex-col items-center flex-1"
                        >
                          <div
                            className="w-full bg-brand-accent rounded-t min-h-[2px]"
                            style={{
                              height: `${(point.confidence / 100) * 100}%`,
                            }}
                          />
                          <span className="text-xs text-gray-500 mt-1">
                            {point.time}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">
                      Drift Threshold
                    </span>
                    <span className="text-sm font-mono text-warning">
                      ±{data.mlModel.driftThreshold}%
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Vetting Logistics Efficiency */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-brand-accent" />
                Vetting Logistics Efficiency
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      Submit → ML
                    </div>
                    <div className="text-lg font-semibold font-mono text-gray-300">
                      {data.logistics.avgSubmitToMl}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      ML → Vetting
                    </div>
                    <div className="text-lg font-semibold font-mono text-gray-300">
                      {data.logistics.avgMlToVetting}
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      Total Process
                    </div>
                    <div className="text-lg font-semibold font-mono text-brand-accent">
                      {data.logistics.avgTotalProcess}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Team Utilization</span>
                    <span className="font-medium text-success">
                      {data.logistics.teamUtilization}%
                    </span>
                  </div>
                  <Progress
                    value={data.logistics.teamUtilization}
                    className="h-2 [&>div]:bg-success"
                  />
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-400 mb-2">
                    Process Bottlenecks
                  </div>
                  {data.logistics.bottlenecks.map((bottleneck, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-800/50 rounded"
                    >
                      <span className="text-sm">{bottleneck.stage}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-mono ${getStatusColor(bottleneck.status)}`}
                        >
                          +{bottleneck.delay}
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            bottleneck.status === "high"
                              ? "bg-danger"
                              : bottleneck.status === "medium"
                                ? "bg-warning"
                                : "bg-success"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>

          <ValidationQueuePanel />

          {/* Geotag Accuracy Report */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <MapPin className="w-5 h-5 text-brand-accent" />
                Geotag Accuracy Report
              </h3>
              <Badge variant="default" className="bg-info">
                {data.geotagAccuracy.overallAccuracy.toFixed(1)}% Accurate
              </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-brand-accent/20 to-brand-violet/20 rounded-lg border border-brand-accent/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      Overall Accuracy
                    </span>
                    <Target className="w-4 h-4 text-brand-accent" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-brand-accent mb-1">
                    {data.geotagAccuracy.overallAccuracy.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    Avg deviation: {data.geotagAccuracy.avgDeviation}m
                  </div>
                </div>

                <div className="text-sm text-gray-400">
                  Regional accuracy breakdown (last 30 days)
                </div>
              </div>

              <div className="space-y-3">
                {data.geotagAccuracy.regionalData.map((region, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {region.region}
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold font-mono text-success">
                        {region.accuracy.toFixed(1)}%
                      </div>
                      <div className="text-xs text-gray-400">
                        ±{region.deviation}m
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Active Alerts */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Validation Alerts
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

          {/* Navigation Actions */}
          <div className="flex gap-4 pt-6">
            <div className="flex gap-3">
              <Button className="bg-brand-accent hover:bg-brand-accent-hover text-gray-900 font-semibold">
                <Zap className="w-4 h-4 mr-2" />
                Retrain ML Model
              </Button>
              <Button
                variant="ghost"
                className="border-brand-violet text-brand-violet hover:bg-brand-violet/20"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                View Detailed Metrics
              </Button>
              <Button
                variant="ghost"
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
              >
                <Shield className="w-4 h-4 mr-2" />
                Validation Settings
              </Button>
            </div>
            <div className="flex gap-3 ml-auto">
              <Button
                variant="ghost"
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
                onClick={() => (window.location.href = "/setting")}
              >
                <Globe className="w-4 h-4 mr-2" />
                Global View
              </Button>
              <Button
                variant="ghost"
                className="border-gray-600 text-gray-400 hover:bg-gray-800"
                onClick={() => (window.location.href = "/setting/financials")}
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Financials
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
