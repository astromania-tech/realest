import { Badge } from "@/components/ui/badge";
import { createClient, getAuthUser} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Settings, Save, Globe, Shield, Mail } from "lucide-react";

export default async function SettingsPage() {
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

  // Mock system settings (in a real app, this would come from a settings table)
  const systemSettings = {
    siteName: "RealEST",
    siteDescription: "Nigeria's premier property marketplace",
    contactEmail: "support@realest.ng",
    maintenanceMode: false,
    allowRegistrations: true,
    emailNotifications: true,
    maxUploadSize: 10, // MB
    supportedCurrencies: ["NGN", "USD"],
    defaultCurrency: "NGN",
  };

  return (
    <>
      <div className="container mx-auto p-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">
            Configure global system settings and preferences
          </p>
        </div>

        {/* Settings Grid */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* General Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                General Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  defaultValue={systemSettings.siteName}
                  placeholder="Enter site name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  defaultValue={systemSettings.siteDescription}
                  placeholder="Enter site description"
                  className="min-h-20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  defaultValue={systemSettings.contactEmail}
                  placeholder="Enter contact email"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxUploadSize">Max Upload Size (MB)</Label>
                <Input
                  id="maxUploadSize"
                  type="number"
                  defaultValue={systemSettings.maxUploadSize}
                  placeholder="Enter max upload size"
                />
              </div>
            </CardContent>
          </Card>

          {/* Security & Access */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Access
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Put site in maintenance mode
                  </p>
                </div>
                <Switch defaultChecked={systemSettings.maintenanceMode} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Registrations</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow new user registrations
                  </p>
                </div>
                <Switch defaultChecked={systemSettings.allowRegistrations} />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Send system email notifications
                  </p>
                </div>
                <Switch defaultChecked={systemSettings.emailNotifications} />
              </div>
            </CardContent>
          </Card>

          {/* Currency Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Currency Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Supported Currencies</Label>
                <div className="flex gap-2">
                  {systemSettings.supportedCurrencies.map((currency) => (
                    <Badge key={currency} variant="outline">
                      {currency}
                    </Badge>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Add or remove supported currencies
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultCurrency">Default Currency</Label>
                <select
                  id="defaultCurrency"
                  defaultValue={systemSettings.defaultCurrency}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  {systemSettings.supportedCurrencies.map((currency) => (
                    <option key={currency} value={currency}>
                      {currency}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>

          {/* Email Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Email Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="smtpHost">SMTP Host</Label>
                <Input
                  id="smtpHost"
                  placeholder="smtp.example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPort">SMTP Port</Label>
                <Input
                  id="smtpPort"
                  placeholder="587"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpUser">SMTP Username</Label>
                <Input
                  id="smtpUser"
                  placeholder="noreply@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtpPass">SMTP Password</Label>
                <Input
                  id="smtpPass"
                  type="password"
                  placeholder="Enter SMTP password"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <Button size="lg">
              <Save className="w-4 h-4 mr-2" />
              Save All Settings
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
