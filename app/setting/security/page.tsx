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
  Users,
  AlertTriangle,
  Lock,
  Eye,
  UserCheck,
  UserX,
  Clock,
  Database,
  Key,
  Activity,
  Zap,
  Globe,
  DollarSign,
} from "lucide-react";

// Mock data for security metrics
const securityData = {
  access: {
    activeUsers: 1247,
    failedLogins: 23,
    suspiciousActivities: 5,
    systemOwnerAccess: 1,
    adminAccess: 12,
    lastSecurityAudit: "2 hours ago",
  },
  incidents: {
    total: 47,
    resolved: 42,
    critical: 2,
    high: 3,
    recentIncidents: [
      {
        id: 1,
        type: "suspicious_login",
        severity: "high",
        description: "Multiple failed login attempts from IP 102.89.45.123",
        location: "Lagos, Nigeria",
        timestamp: "15 minutes ago",
        status: "investigating",
      },
      {
        id: 2,
        type: "unauthorized_access",
        severity: "critical",
        description:
          "Attempted access to system_owner routes from admin account",
        location: "Abuja, Nigeria",
        timestamp: "1 hour ago",
        status: "resolved",
      },
      {
        id: 3,
        type: "data_export",
        severity: "medium",
        description: "Large data export initiated by admin user",
        location: "Port Harcourt, Nigeria",
        timestamp: "3 hours ago",
        status: "monitoring",
      },
    ],
  },
  roles: {
    system_owner: { count: 1, active: 1, permissions: ["ultimate_control"] },
    admin: {
      count: 12,
      active: 10,
      permissions: ["user_management", "validation_override"],
    },
    owner: { count: 234, active: 198, permissions: ["listing_management"] },
    agent: { count: 89, active: 76, permissions: ["client_management"] },
    user: { count: 1456, active: 1123, permissions: ["basic_access"] },
  },
  audit: {
    totalLogs: 45632,
    todayLogs: 1247,
    criticalEvents: 8,
    complianceScore: 98.7,
    lastBackup: "4 hours ago",
  },
  alerts: [
    {
      id: 1,
      type: "warning" as "warning" | "error" | "info",
      title: "IP Whitelist Violation",
      message: "Login attempt from non-whitelisted IP address in Kano region",
      timestamp: "5 minutes ago",
      action: "Review Access",
    },
    {
      id: 2,
      type: "error" as "warning" | "error" | "info",
      title: "2FA Bypass Attempt",
      message: "Multiple 2FA bypass attempts detected on admin account",
      timestamp: "12 minutes ago",
      action: "Lock Account",
    },
    {
      id: 3,
      type: "info" as "warning" | "error" | "info",
      title: "Security Audit Completed",
      message: "Automated security audit passed with 98.7% compliance score",
      timestamp: "2 hours ago",
      action: "View Report",
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
    active: true,
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
  { label: "Security & Access", href: "/setting/security", isActive: true },
];

export default function SecurityPage() {
  const [data, setData] = useState(securityData);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => ({
        ...prev,
        access: {
          ...prev.access,
          activeUsers:
            prev.access.activeUsers + Math.floor(Math.random() * 10) - 5,
        },
      }));
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "text-danger";
      case "high":
        return "text-warning";
      case "medium":
        return "text-info";
      case "low":
        return "text-success";
      default:
        return "text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
        return "text-success";
      case "investigating":
        return "text-warning";
      case "monitoring":
        return "text-info";
      default:
        return "text-muted-foreground";
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "error":
        return <AlertTriangle className="w-4 h-4 text-danger" />;
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-warning" />;
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
                  <Shield className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold font-heading text-white">
                    Security & Access
                  </h1>
                  <p className="text-sm text-gray-400 font-body">
                    Platform Security & User Access Management
                  </p>
                </div>
              </div>
            </div>

            {/* Security Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-800/50 border border-gray-700">
                <div
                  className={`w-2 h-2 rounded-full ${
                    data.audit.complianceScore >= 95
                      ? "bg-success"
                      : data.audit.complianceScore >= 90
                        ? "bg-warning"
                        : "bg-danger"
                  } animate-pulse`}
                />
                <span className="text-sm font-medium text-gray-300">
                  Compliance: {data.audit.complianceScore}%
                </span>
              </div>

              <div className="text-right">
                <div className="text-xs text-gray-400">Last audit</div>
                <div className="text-sm font-mono text-gray-300">
                  {data.access.lastSecurityAudit}
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
                  <span className="text-sm">Emergency Lockdown</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <Database className="w-4 h-4" />
                  <span className="text-sm">Generate Audit Report</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 text-left text-gray-400 hover:text-white hover:bg-gray-800/50 rounded-lg transition-all">
                  <Key className="w-4 h-4" />
                  <span className="text-sm">Manage Access Policies</span>
                </button>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 space-y-6">
          {/* Access Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Active Users</span>
                <Users className="w-4 h-4 text-success" />
              </div>
              <div className="text-2xl font-bold font-mono text-brand-accent">
                {data.access.activeUsers.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">Currently online</div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Failed Logins</span>
                <UserX className="w-4 h-4 text-danger" />
              </div>
              <div className="text-2xl font-bold font-mono text-danger">
                {data.access.failedLogins}
              </div>
              <div className="text-xs text-gray-400 mt-1">Last 24 hours</div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">
                  Security Incidents
                </span>
                <AlertTriangle className="w-4 h-4 text-warning" />
              </div>
              <div className="text-2xl font-bold font-mono text-warning">
                {data.incidents.total}
              </div>
              <div className="text-xs text-gray-400 mt-1">
                {data.incidents.resolved} resolved
              </div>
            </Card>

            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-400">Audit Logs</span>
                <Database className="w-4 h-4 text-info" />
              </div>
              <div className="text-2xl font-bold font-mono text-info">
                {data.audit.todayLogs.toLocaleString()}
              </div>
              <div className="text-xs text-gray-400 mt-1">Today's entries</div>
            </Card>
          </div>

          {/* Role Management & Recent Incidents */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* User Role Distribution */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <Key className="w-5 h-5 text-brand-accent" />
                User Role Distribution
              </h3>

              <div className="space-y-3">
                {Object.entries(data.roles).map(([role, info]) => (
                  <div
                    key={role}
                    className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          role === "system_owner"
                            ? "bg-brand-accent"
                            : role === "admin"
                              ? "bg-danger"
                              : role === "owner"
                                ? "bg-warning"
                                : role === "agent"
                                  ? "bg-info"
                                  : "bg-gray-400"
                        }`}
                      />
                      <div>
                        <div className="text-sm font-medium capitalize">
                          {role.replace("_", " ")}
                        </div>
                        <div className="text-xs text-gray-400">
                          {info.active}/{info.count} active
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {info.permissions.length} permissions
                    </Badge>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Total Users</span>
                  <span className="font-semibold font-mono">
                    {Object.values(data.roles)
                      .reduce((sum, role) => sum + role.count, 0)
                      .toLocaleString()}
                  </span>
                </div>
              </div>
            </Card>

            {/* Recent Security Incidents */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5 text-brand-accent" />
                Recent Security Incidents
              </h3>

              <div className="space-y-3">
                {data.incidents.recentIncidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="p-3 bg-gray-800/50 rounded-lg border border-gray-700"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            incident.severity === "critical"
                              ? "bg-danger"
                              : incident.severity === "high"
                                ? "bg-warning"
                                : incident.severity === "medium"
                                  ? "bg-info"
                                  : "bg-success"
                          }`}
                        />
                        <span className="text-sm font-medium capitalize">
                          {incident.type.replace("_", " ")}
                        </span>
                      </div>
                      <Badge
                        variant="outline"
                        className={`text-xs ${getStatusColor(incident.status)}`}
                      >
                        {incident.status}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-300 mb-2">
                      {incident.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{incident.location}</span>
                      <span className="font-mono">{incident.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-lg font-bold font-mono text-danger">
                      {data.incidents.critical}
                    </div>
                    <div className="text-xs text-gray-400">Critical</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold font-mono text-warning">
                      {data.incidents.high}
                    </div>
                    <div className="text-xs text-gray-400">High</div>
                  </div>
                  <div>
                    <div className="text-lg font-bold font-mono text-info">
                      {data.incidents.total -
                        data.incidents.resolved -
                        data.incidents.critical -
                        data.incidents.high}
                    </div>
                    <div className="text-xs text-gray-400">Medium</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Audit Logs & Compliance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Audit Trail Summary */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <Database className="w-5 h-5 text-brand-accent" />
                Audit Trail Summary
              </h3>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-2xl font-bold font-mono text-brand-accent">
                      {data.audit.totalLogs.toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-400">Total Logs</div>
                  </div>
                  <div className="p-4 bg-gray-800/50 rounded-lg text-center">
                    <div className="text-2xl font-bold font-mono text-warning">
                      {data.audit.criticalEvents}
                    </div>
                    <div className="text-xs text-gray-400">Critical Events</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Compliance Score</span>
                    <span className="font-semibold font-mono text-success">
                      {data.audit.complianceScore}%
                    </span>
                  </div>
                  <Progress
                    value={data.audit.complianceScore}
                    className="h-2 [&>div]:bg-success"
                  />
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Last System Backup</span>
                    <span className="font-mono text-gray-300">
                      {data.audit.lastBackup}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Access Control Status */}
            <Card className="bg-gray-900/50 border-gray-800 p-6">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2 mb-4">
                <Lock className="w-5 h-5 text-brand-accent" />
                Access Control Status
              </h3>

              <div className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <UserCheck className="w-4 h-4 text-success" />
                      <span className="text-sm">System Owner Access</span>
                    </div>
                    <Badge variant="default" className="bg-success">
                      {data.access.systemOwnerAccess} active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-danger" />
                      <span className="text-sm">Admin Access</span>
                    </div>
                    <Badge variant="default" className="bg-danger">
                      {data.access.adminAccess} active
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Eye className="w-4 h-4 text-info" />
                      <span className="text-sm">Suspicious Activities</span>
                    </div>
                    <Badge variant="default" className="bg-warning">
                      {data.access.suspiciousActivities} flagged
                    </Badge>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-700">
                  <div className="text-sm text-gray-400 mb-2">
                    Security Measures Active
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">
                      2FA Required
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      IP Whitelist
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Rate Limiting
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      Geo-fencing
                    </Badge>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Security Alerts */}
          <Card className="bg-gray-900/50 border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold font-heading flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Security Alerts & Notifications
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
              <Zap className="w-4 h-4 mr-2" />
              Emergency Lockdown
            </Button>
            <Button
              variant="ghost"
              className="border-brand-violet text-brand-violet hover:bg-brand-violet/20"
            >
              <Database className="w-4 h-4 mr-2" />
              Generate Audit Report
            </Button>
            <Button
              variant="ghost"
              className="border-gray-600 text-gray-400 hover:bg-gray-800"
            >
              <Key className="w-4 h-4 mr-2" />
              Manage Access Policies
            </Button>
          </div>
        </main>
      </div>
    </div>
  );
}
