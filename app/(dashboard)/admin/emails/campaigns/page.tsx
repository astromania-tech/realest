/**
 * /admin/emails/campaigns — Campaign list page (server component with auth guard)
 */
import { createClient, getAuthUser} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Send, Plus, BarChart3, MailCheck, Clock, XCircle } from "lucide-react";

export const metadata = {
  title: "Email Campaigns | RealEST Admin",
  description: "Create and manage bulk email campaigns",
};

const STATUS_BADGE: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  draft:      "secondary",
  scheduled:  "outline",
  sending:    "default",
  sent:       "default",
  failed:     "destructive",
  cancelled:  "secondary",
};

function formatDate(d: Date | string | null) {
  if (!d) return "—";
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(d));
}

export default async function EmailCampaignsPage() {
  // ── Auth guard ─────────────────────────────────────────────────────────────
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) redirect("/login");

  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role !== "admin") redirect("/");

  // ── Data ──────────────────────────────────────────────────────────────────
  const campaigns = await prisma.email_campaigns.findMany({
    orderBy: { created_at: "desc" },
    include: { profiles: { select: { full_name: true } } },
  });

  const stats = {
    total: campaigns.length,
    sent: campaigns.filter((c) => c.status === "sent").length,
    draft: campaigns.filter((c) => c.status === "draft").length,
    failed: campaigns.filter((c) => c.status === "failed").length,
    totalSent: campaigns.reduce((s, c) => s + (c.sent_count ?? 0), 0),
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Create and send bulk email campaigns to your audience
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/emails/campaigns/new">
            <Plus className="w-4 h-4 mr-2" />
            New Campaign
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <BarChart3 className="w-7 h-7 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Campaigns</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <MailCheck className="w-7 h-7 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.sent}</p>
                <p className="text-xs text-muted-foreground">Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-7 h-7 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.draft}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Send className="w-7 h-7 text-primary" />
              <div>
                <p className="text-2xl font-bold">
                  {stats.totalSent.toLocaleString()}
                </p>
                <p className="text-xs text-muted-foreground">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign table */}
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          {campaigns.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Send className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No campaigns yet</p>
              <p className="text-sm mt-1">
                Create your first campaign to reach your audience.
              </p>
              <Button asChild className="mt-4" variant="outline">
                <Link href="/admin/emails/campaigns/new">
                  <Plus className="w-4 h-4 mr-2" />
                  New Campaign
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Template</TableHead>
                  <TableHead>Audience</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Created By</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">{c.name}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {c.template_name}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="capitalize">
                        {c.audience_type === "resend_audience"
                          ? `Resend · ${c.audience_id?.slice(-8) ?? "—"}`
                          : `DB · ${
                              c.audience_filter
                                ? JSON.stringify(c.audience_filter)
                                : "All"
                            }`}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant={STATUS_BADGE[c.status] ?? "secondary"}>
                        {c.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {c.sent_count?.toLocaleString() ?? "—"}
                      {c.failed_count && c.failed_count > 0 ? (
                        <span className="text-destructive ml-1 text-xs">
                          ({c.failed_count} failed)
                        </span>
                      ) : null}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(c.sent_at)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {c.profiles?.full_name ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/emails/campaigns/${c.id}`}>
                          View
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
    </>
  );
}
