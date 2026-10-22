import { getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Users,
  UserCheck,
  UserX,
  Filter,
  Eye,
  Edit,
  CheckCircle,
  Home,
  MessageSquare,
} from "lucide-react";
import Link from "next/link";

export default async function CMSUsersPage() {
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const userData = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (userData?.role !== "admin") {
    redirect("/");
  }

  const [users, totalUsers, activeUsers, bannedUsers, roleGroups] =
    await Promise.all([
      prisma.users.findMany({
        select: {
          id: true,
          email: true,
          full_name: true,
          role: true,
          is_active: true,
          deleted_at: true,
          created_at: true,
        },
        orderBy: { created_at: "desc" },
        take: 50,
      }),
      prisma.users.count(),
      prisma.users.count({ where: { is_active: true } }),
      prisma.users.count({ where: { is_active: false } }),
      prisma.users.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
    ]);

  const roleCount = (role: string) =>
    roleGroups.find((row) => row.role === role)?._count._all ?? 0;

  const userStats = {
    totalUsers,
    activeUsers,
    verifiedUsers: activeUsers,
    bannedUsers,
    owners: roleCount("owner"),
    agents: roleCount("agent"),
    regularUsers: roleCount("user"),
  };

  return (
    <>
    <div className="container mx-auto p-4">
        {/* Page Header */}
        <div className="mb-8">
          <Link
            href="/admin/cms"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4"
          >
            ← Back to CMS Dashboard
          </Link>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">
            Comprehensive user overview and management
          </p>
        </div>

        {/* Statistics Overview */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:mb-8 sm:gap-4 lg:grid-cols-4 xl:grid-cols-7">
          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.totalUsers}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <UserCheck className="w-6 h-6 text-green-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.activeUsers}</p>
                <p className="text-xs text-muted-foreground">Active</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-purple-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.verifiedUsers}</p>
                <p className="text-xs text-muted-foreground">Verified</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Home className="w-6 h-6 text-orange-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.owners}</p>
                <p className="text-xs text-muted-foreground">Owners</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <MessageSquare className="w-6 h-6 text-indigo-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.agents}</p>
                <p className="text-xs text-muted-foreground">Agents</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <Users className="w-6 h-6 text-gray-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.regularUsers}</p>
                <p className="text-xs text-muted-foreground">Users</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="text-center">
                <UserX className="w-6 h-6 text-red-600 mx-auto mb-2" />
                <p className="text-xl font-bold">{userStats.bannedUsers}</p>
                <p className="text-xs text-muted-foreground">Banned</p>
              </div>
            </CardContent>
          </Card>

        {/* Filters and Search */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search users by name, email, or phone..."
                  className="max-w-md"
                />
              </div>
              <div className="flex gap-2">
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Roles</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="banned">Banned</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="unverified">Unverified</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="w-4 h-4 mr-2" />
                  Apply
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Users Table */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList>
            <TabsTrigger value="all">All Users ({userStats.totalUsers})</TabsTrigger>
            <TabsTrigger value="owners">Owners ({userStats.owners})</TabsTrigger>
            <TabsTrigger value="agents">Agents ({userStats.agents})</TabsTrigger>
            <TabsTrigger value="banned">Banned ({userStats.bannedUsers})</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>All Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full min-w-0 overflow-x-auto">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>User</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Activity</TableHead>
                      <TableHead>Properties</TableHead>
                      <TableHead>Inquiries</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center text-muted-foreground">
                          No users found
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((userProfile) => (
                        <TableRow key={userProfile.id}>
                          <TableCell>
                            <div>
                              <p className="font-medium">
                                {userProfile.full_name || "N/A"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {userProfile.email}
                              </p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{userProfile.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              {userProfile.is_active && (
                                <Badge variant="default" className="text-xs">
                                  Active
                                </Badge>
                              )}
                              {!userProfile.is_active && (
                                <Badge variant="destructive" className="text-xs">
                                  Banned
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm text-muted-foreground">
                              Preview list (max 50)
                            </div>
                          </TableCell>
                          <TableCell className="text-center">—</TableCell>
                          <TableCell className="text-center">—</TableCell>
                          <TableCell>
                            {userProfile.created_at
                              ? new Date(userProfile.created_at).toLocaleDateString()
                              : "N/A"}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button asChild size="sm" variant="outline">
                                <Link href={`/admin/users/${userProfile.id}`}>
                                  <Eye className="w-4 h-4" />
                                </Link>
                              </Button>
                              <Button size="sm" variant="outline">
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant={userProfile.is_active ? "destructive" : "default"}
                              >
                                {userProfile.is_active ? "Ban" : "Unban"}
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
            </div>
          </CardContent>
            </Card>
          </TabsContent>

          {/* Similar tabs for owners, agents, banned - would filter the data */}
          <TabsContent value="owners">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Filtered view for property owners - implementation similar to "All Users" tab
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Filtered view for agents - implementation similar to "All Users" tab
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="banned">
            <Card>
              <CardContent className="pt-6">
                <p className="text-center text-muted-foreground">
                  Banned users view - implementation similar to "All Users" tab
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        </div>
      </div>
    </>
  );
}
