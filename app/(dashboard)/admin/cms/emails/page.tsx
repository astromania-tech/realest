import { createClient, getAuthUser} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Send, Clock, CheckCircle, XCircle, Eye, Plus } from "lucide-react";
import Link from "next/link";

export default async function CMSEmailsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is an admin
  const { data: userData } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userData?.role !== "admin") {
    redirect("/");
  }

  // Fetch real campaign data
  const campaigns = await prisma.email_campaigns.findMany({
    orderBy: { created_at: "desc" },
    take: 100,
  });

  const emailStats = {
    totalSent: campaigns.reduce((s, c) => s + (c.sent_count ?? 0), 0),
    totalFailed: campaigns.reduce((s, c) => s + (c.failed_count ?? 0), 0),
    pendingCampaigns: campaigns.filter(
      (c) => c.status === "draft" || c.status === "scheduled"
    ).length,
    sentCampaigns: campaigns.filter((c) => c.status === "sent").length,
  };

  const recentLogs = campaigns.filter(
    (c) => c.status === "sent" || c.status === "failed"
  );

  const statusVariant = (
    status: string
  ): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case "sent":
        return "default";
      case "sending":
      case "scheduled":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to CMS Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Email Management</h1>
          <p className="text-muted-foreground">
            Create and manage email campaigns and communications
          </p>
        </div>

        {/* Email Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Send className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{emailStats.totalSent.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total Sent</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{emailStats.sentCampaigns.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Campaigns Sent</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Clock className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{emailStats.pendingCampaigns}</p>
                <p className="text-xs text-muted-foreground">Pending Campaigns</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <XCircle className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{emailStats.totalFailed.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Failed Deliveries</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-4 mb-6">
          <Button asChild>
            <Link href="/admin/emails/campaigns/new">
              <Plus className="w-4 h-4 mr-2" />
              New Campaign
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/admin/emails/campaigns">
              <Mail className="w-4 h-4 mr-2" />
              View All Campaigns
            </Link>
          </Button>
        </div>

        {/* Email Campaigns */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList>
            <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="logs">Campaign History</TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns">
            <Card>
              <CardHeader>
                <CardTitle>Email Campaigns</CardTitle>
              </CardHeader>
              <CardContent>
                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No campaigns yet.</p>
                    <Button asChild className="mt-4">
                      <Link href="/admin/emails/campaigns/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Create your first campaign
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Failed</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {campaigns.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {campaign.subject}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(campaign.total_recipients ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {(campaign.sent_count ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {(campaign.failed_count ?? 0) > 0 ? (
                              <span className="text-destructive font-medium">
                                {campaign.failed_count}
                              </span>
                            ) : (
                              "0"
                            )}
                          </TableCell>
                          <TableCell>
                            {campaign.sent_at
                              ? new Date(campaign.sent_at).toLocaleDateString()
                              : campaign.scheduled_at
                              ? `Sched. ${new Date(campaign.scheduled_at).toLocaleDateString()}`
                              : campaign.created_at
                              ? new Date(campaign.created_at).toLocaleDateString()
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" asChild>
                                <Link href={`/admin/emails/campaigns/${campaign.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    Email Templates
                    <Badge variant="secondary">34 templates</Badge>
                  </CardTitle>
                  <Button asChild>
                    <Link href="/admin/emails">
                      <Eye className="w-4 h-4 mr-2" />
                      Open Preview Dashboard
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-6">
                  All 34 transactional and marketing email templates used by the platform.
                  Use the interactive preview dashboard to inspect, toggle dark mode, and view each
                  template at desktop or mobile widths.
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {([
                    { label: "Platform",   count: 8,  description: "Auth, onboarding, account events" },
                    { label: "Listing",    count: 6,  description: "Property submission & verification" },
                    { label: "Engagement", count: 3,  description: "Inquiries, viewings, alerts" },
                    { label: "Financial",  count: 4,  description: "Invoices, payments, renewals" },
                    { label: "Security",   count: 2,  description: "Login alerts, vetting tasks" },
                    { label: "Marketing",  count: 11, description: "Waitlist, launch, warm-up series" },
                  ] as const).map((cat) => (
                    <div key={cat.label} className="rounded-lg border border-border p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{cat.label}</span>
                        <Badge variant="outline">{cat.count}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{cat.description}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs">
            <Card>
              <CardHeader>
                <CardTitle>Campaign History</CardTitle>
              </CardHeader>
              <CardContent>
                {recentLogs.length === 0 ? (
                  <div className="text-center py-12">
                    <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">No completed campaigns yet.</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Sent and failed campaigns will appear here.
                    </p>
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Campaign</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Recipients</TableHead>
                        <TableHead>Sent</TableHead>
                        <TableHead>Failed</TableHead>
                        <TableHead>Sent At</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentLogs.map((campaign) => (
                        <TableRow key={campaign.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">{campaign.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {campaign.subject}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={statusVariant(campaign.status)}>
                              {campaign.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {(campaign.total_recipients ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {(campaign.sent_count ?? 0).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            {(campaign.failed_count ?? 0) > 0 ? (
                              <span className="text-destructive font-medium">
                                {campaign.failed_count}
                              </span>
                            ) : (
                              "0"
                            )}
                          </TableCell>
                          <TableCell>
                            {campaign.sent_at
                              ? new Date(campaign.sent_at).toLocaleString()
                              : "—"}
                          </TableCell>
                          <TableCell>
                            <Button size="sm" variant="outline" asChild>
                              <Link href={`/admin/emails/campaigns/${campaign.id}`}>
                                <Eye className="w-4 h-4" />
                              </Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
