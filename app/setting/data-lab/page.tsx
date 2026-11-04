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
  Database,
  Brain,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Activity,
  BarChart3,
  Target,
  Zap,
  RefreshCw,
  Eye,
  Cpu,
  Globe,
  Shield,
  DollarSign,
  Lock,
} from "lucide-react";

// Mock data for ML and data analytics
const dataLabData = {
  mlModels: {
    primaryModel: {
      name: "RealEST Fraud Detector v2.1",
      accuracy: 94.7,
      precision: 96.2,
      recall: 92.8,
      f1Score: 94.4,
      status: "active",
      lastTrained: "2 days ago",
      trainingTime: "4.2 hours",
      dataPoints: 1250000,
    },
    secondaryModels: [
      {
        name: "Geotag Validator",
        accuracy: 89.3,
        status: "active",
        lastUpdated: "6 hours ago",
      },
      {
        name: "Duplicate Detector",
        accuracy: 97.1,
        status: "active",
        lastUpdated: "1 day ago",
      },
      {
        name: "Price Anomaly Detector",
        accuracy: 91.8,
        status: "training",
        lastUpdated: "3 hours ago",
      },
    ],
  },
  dataQuality: {
    overallScore: 92.4,
    completeness: 98.7,
    accuracy: 94.2,
    consistency: 89.1,
    timeliness: 96.5,
    issues: [
      { type: "Missing Photos", count: 234, severity: "medium" },
      { type: "Incomplete Addresses", count: 156, severity: "high" },
      { type: "Outdated Listings", count: 89, severity: "low" },
    ],
  },
  predictions: {
    listingSuccess: {
      current: 78.5,
      predicted: 82.1,
      confidence: 87,
      factors: ["Photo Quality", "Price Accuracy", "Description Length"],
    },
    marketTrends: [
      { region: "Lagos", trend: "up", change: 12.4, confidence: 92 },
      { region: "Abuja", trend: "up", change: 8.7, confidence: 88 },
      { region: "Port Harcourt", trend: "down", change: -3.2, confidence: 76 },
    ],
  },
  performance: {
    apiResponseTime: 145,
    throughput: 1250, // requests per minute
    errorRate: 0.02,
    uptime: 99.98,
    dataFreshness: 98.7,
  },
  alerts: [
    {
      id: 1,
      type: "warning" as "warning" | "error" | "info",
      title: "Model Accuracy Drift Detected",
      message:
        "Primary fraud detection model accuracy dropped 1.2% in last 24 hours",
      timestamp: "30 minutes ago",
      action: "Retrain Model",
    },
    {
      id: 2,
      type: "info" as "warning" | "error" | "info",
      title: "New Training Data Available",
      message: "1,247 new verified listings ready for model training",
      timestamp: "2 hours ago",
      action: "Start Training",
    },
    {
      id: 3,
      type: "success" as "warning" | "error" | "info",
      title: "Prediction Accuracy Improved",
      message: "Market trend predictions now 94% accurate vs 89% last month",
      timestamp: "4 hours ago",
      action: "View Details",
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
    active: true,
  },
];

const breadcrumbItems = [
  { label: "Dashboard", href: "/admin" },
  { label: "RealEST Global Control", href: "/setting" },
  { label: "Data & ML Oversight", href: "/setting/data-lab", isActive: true },
];

export default function DataLabPage() {
  const [data, setData] = useState(dataLabData);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        performance: {
          ...prev.performance,
          apiResponseTime: Math.max(
            120,
            prev.performance.apiResponseTime + (Math.random() - 0.5) * 10,
          ),
        },
      }));
    }, 12000);

    return () => clearInterval(interval);
  }, []);

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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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
                  <Database className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-heading text-white">
                    Data & ML Oversight
                  </h1>
                  <p className="text-sm text-gray-400 font-body">
                    Intelligence Center & Model Performance
                  </p>
                </div>
              </div>
            </div>

            {/* Data Lab Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
                <div
                  className={`w-2 h-2 rounded-full ${
                    data.mlModels.primaryModel.accuracy >= 95
                      ? "bg-success"
                      : data.mlModels.primaryModel.accuracy >= 90
                        ? "bg-warning"
                        : "bg-danger"
                  } animate-pulse`}
                />
                <span className="text-sm font-medium text-gray-300">
                  ML Health: {data.mlModels.primaryModel.accuracy.toFixed(1)}%
                </span>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Data Freshness</div>
                <div className="text-sm font-mono text-gray-300">
                  {data.performance.dataFreshness}%
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
                  <RefreshCw className="w-4 h-4" />
                  <span className="text-sm">Retrain ML Models</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <BarChart3 className="w-4 h-4" />
                  <span className="text-sm">Generate Analytics Report</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <Database className="w-4 h-4" />
                  <span className="text-sm">Data Quality Audit</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* ML Model Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                  <Brain className="w-5 h-5 text-brand-accent" />
                  Primary ML Model Performance
                </h3>
                <Badge variant="default" className="bg-success">
                  {data.mlModels.primaryModel.status}
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Accuracy</div>
                    <div className="text-2xl font-bold font-mono text-brand-accent">
                      {data.mlModels.primaryModel.accuracy}%
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">F1 Score</div>
                    <div className="text-2xl font-bold font-mono text-success">
                      {data.mlModels.primaryModel.f1Score}%
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Precision</div>
                    <div className="text-lg font-semibold font-mono text-gray-300">
                      {data.mlModels.primaryModel.precision}%
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="text-sm text-gray-400 mb-1">Recall</div>
                    <div className="text-lg font-semibold font-mono text-gray-300">
                      {data.mlModels.primaryModel.recall}%
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-400">Last Trained:</span>
                      <div className="font-mono text-gray-300">
                        {data.mlModels.primaryModel.lastTrained}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-400">Training Data:</span>
                      <div className="font-mono text-gray-300">
                        {(
                          data.mlModels.primaryModel.dataPoints / 1000000
                        ).toFixed(1)}
                        M points
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Secondary Models */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <Cpu className="w-5 h-5 text-brand-accent" />
                Secondary ML Models
              </h3>

              <div className="space-y-3">
                {data.mlModels.secondaryModels.map((model, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          model.status === "active"
                            ? "bg-success"
                            : model.status === "training"
                              ? "bg-warning"
                              : "bg-danger"
                        }`}
                      />
                      <div>
                        <div className="text-sm font-medium">{model.name}</div>
                        <div className="text-xs text-gray-400">
                          Updated {model.lastUpdated}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold font-mono text-success">
                        {model.accuracy}%
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {model.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Data Quality & Predictions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Quality Monitoring */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <Eye className="w-5 h-5 text-brand-accent" />
                Data Quality Monitoring
              </h3>

              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-brand-accent/20 to-brand-violet/20 rounded-lg border border-brand-accent/30">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">
                      Overall Quality Score
                    </span>
                    <Target className="w-4 h-4 text-brand-accent" />
                  </div>
                  <div className="text-3xl font-bold font-mono text-brand-accent mb-1">
                    {data.dataQuality.overallScore.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-400">
                    +2.1% vs last month
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      Completeness
                    </div>
                    <div className="text-lg font-semibold font-mono text-success">
                      {data.dataQuality.completeness}%
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">Accuracy</div>
                    <div className="text-lg font-semibold font-mono text-success">
                      {data.dataQuality.accuracy}%
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      Consistency
                    </div>
                    <div className="text-lg font-semibold font-mono text-warning">
                      {data.dataQuality.consistency}%
                    </div>
                  </div>
                  <div className="p-3 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">Timeliness</div>
                    <div className="text-lg font-semibold font-mono text-success">
                      {data.dataQuality.timeliness}%
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm text-gray-400 mb-2">
                    Quality Issues
                  </div>
                  {data.dataQuality.issues.map((issue, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-gray-800/30 rounded"
                    >
                      <span className="text-sm">{issue.type}</span>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm font-mono ${getSeverityColor(issue.severity)}`}
                        >
                          {issue.count}
                        </span>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            issue.severity === "high"
                              ? "bg-danger"
                              : issue.severity === "medium"
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

            {/* Predictive Analytics */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-brand-accent" />
                Predictive Analytics
              </h3>

              <div className="space-y-6">
                {/* Listing Success Prediction */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300">
                    Listing Success Prediction
                  </h4>
                  <div className="p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm">Current Success Rate</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-semibold font-mono text-success">
                          {data.predictions.listingSuccess.current}%
                        </span>
                        <TrendingUp className="w-4 h-4 text-success" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Predicted (Next Month)</span>
                      <span className="text-lg font-semibold font-mono text-brand-accent">
                        {data.predictions.listingSuccess.predicted}%
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>Confidence Level</span>
                      <span className="font-mono">
                        {data.predictions.listingSuccess.confidence}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Market Trends */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-gray-300">
                    Regional Market Trends
                  </h4>
                  {data.predictions.marketTrends.map((trend, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            trend.trend === "up" ? "bg-success" : "bg-danger"
                          }`}
                        />
                        <span className="text-sm font-medium">
                          {trend.region}
                        </span>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-sm font-semibold font-mono ${
                            trend.trend === "up"
                              ? "text-success"
                              : "text-danger"
                          }`}
                        >
                          {trend.change > 0 ? "+" : ""}
                          {trend.change}%
                        </div>
                        <div className="text-xs text-gray-400">
                          {trend.confidence}% confidence
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Key Factors */}
                <div className="pt-4 border-t border-gray-700">
                  <h4 className="text-sm font-medium text-gray-300 mb-2">
                    Success Factors
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {data.predictions.listingSuccess.factors.map(
                      (factor, index) => (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs"
                        >
                          {factor}
                        </Badge>
                      ),
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* System Performance & Alerts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* System Performance Metrics */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <Activity className="w-5 h-5 text-brand-accent" />
                System Performance Metrics
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">
                      API Response
                    </div>
                    <div className="text-2xl font-bold font-mono text-success">
                      {data.performance.apiResponseTime}ms
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">Throughput</div>
                    <div className="text-2xl font-bold font-mono text-info">
                      {data.performance.throughput}/min
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">Error Rate</div>
                    <div className="text-2xl font-bold font-mono text-danger">
                      {data.performance.errorRate}%
                    </div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-xs text-gray-400 mb-1">Uptime</div>
                    <div className="text-2xl font-bold font-mono text-success">
                      {data.performance.uptime}%
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Model Inference Time</span>
                    <span className="font-mono text-gray-300">23ms avg</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-2">
                    <span className="text-gray-400">Data Processing Rate</span>
                    <span className="font-mono text-gray-300">1.2GB/min</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* ML & Data Alerts */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  ML & Data Alerts
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
          </div>

          {/* Quick Actions */}
          <div className="flex gap-4 pt-6">
            <Button className="bg-brand-accent hover:bg-brand-accent-hover text-gray-900 font-semibold">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retrain ML Models
            </Button>
            <Button
              variant="ghost"
              className="border-brand-violet text-brand-violet hover:bg-brand-violet/20"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Generate Analytics Report
            </Button>
            <Button
              variant="ghost"
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              <Database className="w-4 h-4 mr-2" />
              Data Quality Audit
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
