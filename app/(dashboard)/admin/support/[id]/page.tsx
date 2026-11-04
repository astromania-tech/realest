import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, User, Mail, MessageSquare } from "lucide-react";
import Link from "next/link";

export default async function SupportTicketDetailPage({
  params,
}: {
  params: { id: string };
}) {
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

  // Fetch the specific support ticket
  // Mock data - in a real app, this would come from a support_tickets table
  const ticket = {
    id: params.id,
    subject: "Property listing not showing up",
    userName: "Alice Johnson",
    userEmail: "alice@example.com",
    priority: "High",
    status: "Open",
    createdAt: "2024-01-15T08:30:00Z",
    description: "I uploaded my property listing yesterday but it's not appearing in the search results. I've tried refreshing and clearing my cache but still can't see it.",
    replies: [
      {
        id: "1",
        from: "Alice Johnson",
        message: "The listing ID is PROP-12345. Please help me find out why it's not showing.",
        timestamp: "2024-01-15T08:35:00Z",
        isAdmin: false,
      },
      {
        id: "2",
        from: "Support Team",
        message: "Thank you for reaching out. Let me check the status of your listing. It appears there might be an issue with the verification process.",
        timestamp: "2024-01-15T09:15:00Z",
        isAdmin: true,
      },
    ],
  };

  if (!ticket) {
    notFound();
  }

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
      <div className="min-h-screen bg-background container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link
            href="/admin/support"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Support Tickets
          </Link>
          <h1 className="text-3xl font-bold">Support Ticket #{ticket.id}</h1>
          <p className="text-muted-foreground">
            {ticket.subject}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket Details */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Ticket Information</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(ticket.priority)}>
                    {ticket.priority} Priority
                  </Badge>
                  <Badge className={getStatusColor(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-sm">{ticket.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Created</p>
                    <p>{new Date(ticket.createdAt).toLocaleDateString()} at{" "}
                      {new Date(ticket.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Last Updated</p>
                    <p>{new Date(ticket.replies[ticket.replies.length - 1]?.timestamp || ticket.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Conversation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5" />
                  Conversation ({ticket.replies.length} messages)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {ticket.replies.map((reply) => (
                    <div
                      key={reply.id}
                      className={`flex gap-3 ${reply.isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-md p-4 rounded-lg ${
                          reply.isAdmin
                            ? "bg-primary text-primary-foreground ml-auto"
                            : "bg-muted"
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4" />
                          <span className="font-medium text-sm">{reply.from}</span>
                          {reply.isAdmin && (
                            <Badge variant="secondary" className="text-xs">
                              Admin
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm">{reply.message}</p>
                        <p className="text-xs opacity-70 mt-2">
                          {new Date(reply.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Reply Form */}
            <Card>
              <CardHeader>
                <CardTitle>Send Reply</CardTitle>
              </CardHeader>
              <CardContent>
                <form className="space-y-4">
                  <Textarea
                    name="reply"
                    placeholder="Type your reply to the customer..."
                    className="min-h-24"
                    required
                  />
                  <div className="flex gap-2">
                    <Button type="submit">
                      <Send className="w-4 h-4 mr-2" />
                      Send Reply
                    </Button>
                    <Button type="button" variant="outline">
                      Mark as Resolved
                    </Button>
                    <Button type="button" variant="outline">
                      Close Ticket
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{ticket.userName}</p>
                  </div>
  
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <a
                        href={`mailto:${ticket.userEmail}`}
                        className="text-blue-600 hover:underline"
                      >
                        {ticket.userEmail}
                      </a>
                    </div>
                  </div>
  
                  <div>
                    <p className="text-sm text-muted-foreground">Ticket ID</p>
                    <p className="font-mono text-sm">{ticket.id}</p>
                  </div>
                </CardContent>
              </Card>
  
              <Card>
                <CardHeader>
                  <CardTitle>Ticket Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full" variant="outline">
                    Escalate to Senior Support
                  </Button>
                  <Button className="w-full" variant="outline">
                    Add Internal Note
                  </Button>
                  <Button className="w-full" variant="destructive">
                    Delete Ticket
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
