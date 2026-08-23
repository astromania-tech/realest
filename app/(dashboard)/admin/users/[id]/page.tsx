import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, User, Mail, Phone, MapPin } from "lucide-react";
import Link from "next/link";

export default async function UserEditPage({
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

  // Fetch the specific user — users table holds role + is_active
  const { data: userProfile } = await supabase
    .from("users")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!userProfile) {
    notFound();
  }

  // Mock additional user data (in a real app, this might be in separate tables)
  const userStats = {
    totalProperties: 5,
    activeListings: 3,
    totalInquiries: 12,
    joinDate: userProfile.created_at,
    lastLogin: "2024-01-14T10:30:00Z",
  };

  return (
    <>
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <Link
            href="/admin/users"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Users
          </Link>
          <h1 className="text-3xl font-bold">Edit User</h1>
          <p className="text-muted-foreground">
            View and manage user account details
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  User Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="full_name">Full Name</Label>
                    <Input
                      id="full_name"
                      defaultValue={userProfile.full_name || ""}
                      placeholder="Enter full name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      defaultValue={userProfile.email || ""}
                      placeholder="Enter email"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      defaultValue={userProfile.phone || ""}
                      placeholder="Enter phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user_type">User Type</Label>
                    <Select defaultValue={userProfile.role}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select user type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
                        <SelectItem value="agent">Agent</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="banned">Banned</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio/About</Label>
                  <Textarea
                    id="bio"
                    defaultValue={userProfile.bio || ""}
                    placeholder="User bio or additional information"
                    className="min-h-24"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_verified"
                    defaultChecked={userProfile.is_verified || false}
                    className="rounded"
                  />
                  <Label htmlFor="is_verified">Verified Account</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_premium"
                    defaultChecked={userProfile.is_premium || false}
                    className="rounded"
                  />
                  <Label htmlFor="is_premium">Premium Member</Label>
                </div>
              </CardContent>
            </Card>

            {/* User Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>User Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userStats.totalProperties}</p>
                    <p className="text-sm text-muted-foreground">Properties</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userStats.activeListings}</p>
                    <p className="text-sm text-muted-foreground">Active Listings</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">{userStats.totalInquiries}</p>
                    <p className="text-sm text-muted-foreground">Inquiries</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold">
                      {new Date(userStats.joinDate).getFullYear()}
                    </p>
                    <p className="text-sm text-muted-foreground">Joined</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Actions & Status */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Account Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Current Status</p>
                  <Badge variant={!userProfile.is_active ? 'destructive' : 'default'}>
                    {userProfile.role}{!userProfile.is_active ? ' (Banned)' : ''}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Verification</p>
                  <Badge variant={userProfile.is_active ? 'default' : 'secondary'}>
                    {userProfile.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Last Login</p>
                  <p className="text-sm">
                    {new Date(userStats.lastLogin).toLocaleDateString()} at{" "}
                    {new Date(userStats.lastLogin).toLocaleTimeString()}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>

                <Button variant="outline" className="w-full">
                  Send Password Reset
                </Button>

                <Button variant="outline" className="w-full">
                  Send Verification Email
                </Button>

                <Button
                  variant={!userProfile.is_active ? 'default' : 'destructive'}
                  className="w-full"
                >
                  {!userProfile.is_active ? 'Unban User' : 'Ban User'}
                </Button>

                <Button variant="ghost" className="w-full text-red-600 hover:text-red-700">
                  Delete User Account
                </Button>
              </CardContent>
            </Card>
            </div>
        </div>
      </div>
    </>
  );
}
