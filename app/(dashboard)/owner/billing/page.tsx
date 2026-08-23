import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CreditCard, Download, Calendar, DollarSign } from "lucide-react";

export default async function BillingPage() {
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  const isPremium = profile?.is_premium || false;

  // Mock billing data - in a real app, this would come from billing/subscription tables
  const billingData = {
    currentPlan: isPremium ? "Premium" : "Free",
    nextBillingDate: "2024-02-15",
    monthlyAmount: isPremium ? 9999 : 0,
    paymentMethod: "**** **** **** 1234",
    billingHistory: [
      {
        date: "2024-01-15",
        amount: 9999,
        status: "Paid",
        description: "Premium Plan - January",
      },
      {
        date: "2023-12-15",
        amount: 9999,
        status: "Paid",
        description: "Premium Plan - December",
      },
      {
        date: "2023-11-15",
        amount: 9999,
        status: "Paid",
        description: "Premium Plan - November",
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Billing & Payments</h1>
          <p className="text-muted-foreground">
            Manage your subscription and payment history
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Current Plan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">
                    {billingData.currentPlan}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {isPremium
                      ? `₦${billingData.monthlyAmount.toLocaleString()}/month`
                      : "Free plan"}
                  </p>
                </div>
                <Badge variant={isPremium ? "default" : "secondary"}>
                  {isPremium ? "Active" : "Free"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Next Billing
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">
                {billingData.nextBillingDate}
              </p>
              <p className="text-sm text-muted-foreground">
                {isPremium
                  ? `₦${billingData.monthlyAmount.toLocaleString()}`
                  : "No charge"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Payment Method
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg font-semibold">
                {billingData.paymentMethod}
              </p>
              <Button variant="outline" size="sm" className="mt-2">
                Update Payment Method
              </Button>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Billing History</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billingData.billingHistory.map((bill, index) => (
                  <TableRow key={index}>
                    <TableCell>{bill.date}</TableCell>
                    <TableCell>{bill.description}</TableCell>
                    <TableCell>₦{bill.amount.toLocaleString()}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          bill.status === "Paid" ? "default" : "destructive"
                        }
                      >
                        {bill.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="mt-8 flex gap-4">
          <Button variant="outline">Download All Invoices</Button>
          {isPremium && (
            <Button variant="destructive">Cancel Subscription</Button>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
