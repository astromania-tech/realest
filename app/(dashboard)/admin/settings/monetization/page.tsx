import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DollarSign, Percent, Settings, Save } from "lucide-react";

export default async function MonetizationPage() {
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

  // Mock monetization settings (in a real app, this would come from a settings table)
  const monetizationSettings = {
    platformFee: 2.5, // percentage
    premiumFee: 9999, // monthly in NGN
    transactionFee: 1.5, // percentage
    withdrawalFee: 500, // fixed in NGN
    minimumWithdrawal: 5000, // in NGN
    paymentMethods: [
      { name: "Flutterwave", isActive: true, fee: 1.5 },
      { name: "Paystack", isActive: true, fee: 1.2 },
      { name: "Stripe", isActive: false, fee: 2.9 },
    ],
    subscriptionPlans: [
      { name: "Basic", price: 0, features: ["Basic listings"] },
      { name: "Premium", price: 9999, features: ["Advanced analytics", "Priority support"] },
      { name: "Enterprise", price: 29999, features: ["All premium features", "Custom integrations"] },
    ],
  };

  return (
    <>
    <div className="container mx-auto p-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Monetization Settings</h1>
          <p className="text-muted-foreground">
            Configure fees, pricing, and payment settings
          </p>
        </div>

        {/* Settings Grid */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Fee Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="w-5 h-5" />
                Fee Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="platformFee">Platform Fee (%)</Label>
                <Input
                  id="platformFee"
                  type="number"
                  step="0.1"
                  defaultValue={monetizationSettings.platformFee}
                  placeholder="Enter platform fee percentage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="transactionFee">Transaction Fee (%)</Label>
                <Input
                  id="transactionFee"
                  type="number"
                  step="0.1"
                  defaultValue={monetizationSettings.transactionFee}
                  placeholder="Enter transaction fee percentage"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="withdrawalFee">Withdrawal Fee (₦)</Label>
                <Input
                  id="withdrawalFee"
                  type="number"
                  defaultValue={monetizationSettings.withdrawalFee}
                  placeholder="Enter fixed withdrawal fee"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="minimumWithdrawal">Minimum Withdrawal (₦)</Label>
                <Input
                  id="minimumWithdrawal"
                  type="number"
                  defaultValue={monetizationSettings.minimumWithdrawal}
                  placeholder="Enter minimum withdrawal amount"
                />
              </div>
            </CardContent>
          </Card>

          {/* Subscription Plans */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                Subscription Plans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {monetizationSettings.subscriptionPlans.map((plan, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">{plan.name}</h4>
                      <span className="text-lg font-bold">
                        ₦{plan.price.toLocaleString()}/month
                      </span>
                    </div>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      {plan.features.map((feature, idx) => (
                        <li key={idx}>• {feature}</li>
                      ))}
                    </ul>
                    <Button variant="outline" size="sm" className="mt-3">
                      Edit Plan
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Payment Methods */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Payment Methods
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Method</TableHead>
                    <TableHead>Fee (%)</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monetizationSettings.paymentMethods.map((method, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{method.name}</TableCell>
                      <TableCell>{method.fee}%</TableCell>
                      <TableCell>
                        <Switch defaultChecked={method.isActive} />
                      </TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button size="lg">
              <Save className="w-4 h-4 mr-2" />
              Save Monetization Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
