import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Mail, Phone, MessageSquare, ArrowLeft } from "lucide-react";
import Link from "next/link";

interface Inquiry {
  id: string;
  message: string;
  status: string;
  created_at: string;
  properties: { id: string; title: string };
  profiles: { full_name: string; email: string; phone: string };
}

export default async function InquiryDetailPage({
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

  // Check if user is a property owner
  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role !== "owner") {
    redirect("/");
  }

  // Fetch the specific inquiry
  const { data: inquiry } = await supabase
    .from("inquiries")
    .select("*, properties(id, title), profiles(full_name, email, phone)")
    .eq("id", params.id)
    .eq("owner_id", user.id)
    .single();

  if (!inquiry) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-600";
      case "viewed":
        return "bg-yellow-600";
      case "responded":
        return "bg-green-600";
      default:
        return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <Link
            href="/dashboard/owner/inquiries"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Inquiries
          </Link>
          <h1 className="text-3xl font-bold">Inquiry Details</h1>
          <p className="text-muted-foreground">
            View and respond to this inquiry
          </p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardTitle className="text-xl">
                  {inquiry.properties.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  From: {inquiry.profiles.full_name}
                </p>
              </div>
              <Badge className={getStatusColor(inquiry.status)}>
                {inquiry.status.toUpperCase()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Inquiry Message</h3>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{inquiry.message}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Received on {new Date(inquiry.created_at).toLocaleDateString()}{" "}
                at {new Date(inquiry.created_at).toLocaleTimeString()}
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <div className="space-y-2">
                {inquiry.profiles.email && (
                  <a
                    href={`mailto:${inquiry.profiles.email}`}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Mail className="w-4 h-4" />
                    {inquiry.profiles.email}
                  </a>
                )}
                {inquiry.profiles.phone && (
                  <a
                    href={`tel:${inquiry.profiles.phone}`}
                    className="flex items-center gap-2 text-sm text-blue-600 hover:underline"
                  >
                    <Phone className="w-4 h-4" />
                    {inquiry.profiles.phone}
                  </a>
                )}
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="font-semibold mb-2">Send Reply</h3>
              <form className="space-y-4">
                <Textarea
                  name="reply"
                  placeholder="Type your reply..."
                  className="min-h-24"
                  required
                />
                <Button type="submit" className="w-full">
                  Send Reply
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
