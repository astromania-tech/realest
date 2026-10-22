import { getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Users, Search, UserCheck, UserX, Edit } from "lucide-react";
import Link from "next/link";

export default async function UsersPage() {
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  const userRow = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  });

  if (userRow?.role !== "admin") {
    redirect("/");
  }

  const [users, totalUsers, activeUsers, bannedUsers] = await Promise.all([
    prisma.users.findMany({
      select: {
        id: true,
        email: true,
        full_name: true,
        role: true,
        is_active: true,
        created_at: true,
      },
      orderBy: { created_at: "desc" },
      take: 50,
    }),
    prisma.users.count(),
    prisma.users.count({ where: { is_active: true } }),
    prisma.users.count({ where: { is_active: false } }),
  ]);

  const userStats = {
    totalUsers,
    verifiedUsers: activeUsers,
    activeUsers,
    bannedUsers,
  };

  return (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">
          Manage user accounts, verification status, and permissions
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 mb-6 sm:mb-8">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{userStats.totalUsers}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <UserCheck className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-2xl font-bold">{userStats.activeUsers}</p>
              <p className="text-sm text-muted-foreground">Active</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <UserX className="w-8 h-8 text-red-600" />
            <div>
              <p className="text-2xl font-bold">{userStats.bannedUsers}</p>
              <p className="text-sm text-muted-foreground">Banned</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <div className="min-w-0 flex-1">
              <Input
                placeholder="Search users by name or email..."
                className="w-full max-w-sm"
              />
            </div>
            <Button variant="outline" className="w-full shrink-0 sm:w-auto">
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full min-w-0 overflow-x-auto">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    No users found
                  </TableCell>
                </TableRow>
              ) : (
                users.map((userProfile) => (
                  <TableRow key={userProfile.id}>
                    <TableCell className="font-medium">
                      {userProfile.full_name || "N/A"}
                    </TableCell>
                    <TableCell>{userProfile.email || "N/A"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{userProfile.role}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={userProfile.is_active ? "default" : "secondary"}>
                        {userProfile.is_active ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {userProfile.created_at
                        ? new Date(userProfile.created_at).toLocaleDateString()
                        : "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/admin/users/${userProfile.id}`}>
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Link>
                        </Button>
                        <Button size="sm" variant="outline">
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
    </>
  );
}
