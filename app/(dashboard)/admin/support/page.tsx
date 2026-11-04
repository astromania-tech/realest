import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, Clock, CheckCircle, AlertCircle, Reply } from "lucide-react";
import Link from "next/link";

export default async function SupportPage() {
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

  // Mock support tickets data (in a real app, this would come from a support_tickets table)
  const supportTickets = {
    open: [
      {
        id: "1",
        subject: "Property listing not showing up",
        userName: "Alice Johnson",
        userEmail: "alice@example.com",
        priority: "High",
        status: "Open",
        createdAt: "2024-01-15T08:30:00Z",
        lastReply: "2024-01-15T10:15:00Z",
      },
      {
        id: "2",
        subject: "Payment not processed",
        userName: "Bob Smith",
        userEmail: "bob@example.com",
        priority: "Medium",
        status: "Open",
        createdAt: "2024-01-14T14:20:00Z",
        lastReply: "2024-01-14T16:45:00Z",
      },
    ],
    resolved: [
      {
        id: "3",
        subject: "Account verification issue",
        userName: "Carol Davis",
        userEmail: "carol@example.com",
        priority: "Low",
        status: "Resolved",
        createdAt: "2024-01-10T09:00:00Z",
        lastReply: "2024-01-12T11:30:00Z",
      },
    ],
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "High":
        return "bg-red-600";
      case "Medium":
        return "bg-yellow-600";
      case "Low":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Open":
        return "bg-blue-600";
      case "Resolved":
        return "bg-green-600";
      case "Closed":
        return "bg-gray-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <>
    <div className="min-h-screen bg-background">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Support Tickets</h1>
          <p className="text-muted-foreground">
            Manage customer support requests and inquiries
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <Clock className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{supportTickets.open.length}</p>
                  <p className="text-sm text-muted-foreground">Open Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{supportTickets.resolved.length}</p>
                  <p className="text-sm text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <AlertCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {supportTickets.open.filter(t => t.priority === "High").length}
                  </p>
                  <p className="text-sm text-muted-foreground">High Priority</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <MessageSquare className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold">
                    {supportTickets.open.length + supportTickets.resolved.length}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>

        <Tabs defaultValue="open" className="space-y-6">
          <TabsList>
            <TabsTrigger value="open">
              Open Tickets ({supportTickets.open.length})
            </TabsTrigger>
            <TabsTrigger value="resolved">
              Resolved ({supportTickets.resolved.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="open">
            <Card>
              <CardHeader>
                <CardTitle>Open Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Reply</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportTickets.open.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.subject}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.userName}</p>
                            <p className="text-sm text-muted-foreground">{ticket.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(ticket.lastReply).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button asChild size="sm" variant="outline">
                              <Link href={`/admin/support/${ticket.id}`}>
                                <Reply className="w-4 h-4 mr-1" />
                                Reply
                              </Link>
                            </Button>
                            <Button size="sm" variant="outline">
                              Close
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="resolved">
            <Card>
              <CardHeader>
                <CardTitle>Resolved Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Resolved</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supportTickets.resolved.map((ticket) => (
                      <TableRow key={ticket.id}>
                        <TableCell className="font-medium">{ticket.subject}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{ticket.userName}</p>
                            <p className="text-sm text-muted-foreground">{ticket.userEmail}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(ticket.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>{new Date(ticket.lastReply).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/admin/support/${ticket.id}`}>
                              View
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </>
  );
}
