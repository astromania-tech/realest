import { createClient, getAuthUser} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Mail,
  MessageSquare,
  List,
  BarChart3,
  Settings,
  UserCheck,
  Clock,
} from "lucide-react";
import Link from "next/link";

export default async function CMSDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is an admin
  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role !== "admin") {
    redirect("/");
  }

  // Mock CMS statistics (in a real app, this would come from various tables)
  const cmsStats = {
    totalUsers: 1250,
    activeUsers: 890,
    waitlistSubscribers: 3450,
    pendingEmails: 12,
    activeChats: 3,
    totalProperties: 567,
    verifiedProperties: 423,
    pendingValidations: 23,
  };

  const quickActions = [
    {
      title: "Manage Users",
      description: "View and manage all user accounts",
      icon: Users,
      href: "/admin/cms/users",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Waitlist Management",
      description: "Review and manage waitlist subscribers",
      icon: List,
      href: "/admin/cms/waitlist",
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Email Campaigns",
      description: "Send emails and manage campaigns",
      icon: Mail,
      href: "/admin/cms/emails",
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Live Chat Support",
      description: "Handle customer support chats",
      icon: MessageSquare,
      href: "/admin/cms/chat",
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Analytics",
      description: "View detailed platform analytics",
      icon: BarChart3,
      href: "/admin/cms/analytics",
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
    },
    {
      title: "System Settings",
      description: "Configure platform settings",
      icon: Settings,
      href: "/admin/settings",
      color: "text-gray-600",
      bgColor: "bg-gray-50",
    },
  ];

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">CMS Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive management suite for RealEST platform
        </p>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">
                  {cmsStats.totalUsers.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <UserCheck className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {cmsStats.activeUsers.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <List className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {cmsStats.waitlistSubscribers.toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Waitlist</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Clock className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">
                  {cmsStats.pendingValidations}
                </p>
                <p className="text-sm text-muted-foreground">Pending Reviews</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg ${action.bgColor}`}>
                    <action.icon className={`w-6 h-6 ${action.color}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">{action.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {action.description}
                    </p>
                    <Button asChild size="sm" variant="outline">
                      <Link href={action.href}>Access</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <Badge variant="default">New User</Badge>
              <div className="flex-1">
                <p className="font-medium">
                  John Doe registered as a property owner
                </p>
                <p className="text-sm text-muted-foreground">2 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <Badge variant="secondary">Waitlist</Badge>
              <div className="flex-1">
                <p className="font-medium">
                  Sarah Wilson joined the waitlist (#3,450)
                </p>
                <p className="text-sm text-muted-foreground">15 minutes ago</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <Badge variant="outline">Property</Badge>
              <div className="flex-1">
                <p className="font-medium">
                  Luxury Apartment in Lekki submitted for review
                </p>
                <p className="text-sm text-muted-foreground">1 hour ago</p>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
              <Badge variant="destructive">Support</Badge>
              <div className="flex-1">
                <p className="font-medium">
                  New support ticket: "Payment not processed"
                </p>
                <p className="text-sm text-muted-foreground">2 hours ago</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
