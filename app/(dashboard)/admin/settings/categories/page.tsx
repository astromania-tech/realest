import { createClient, getAuthUser} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Tag } from "lucide-react";

export default async function CategoriesPage() {
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

  // Mock categories data (in a real app, this would come from a categories table)
  const categories = [
    { id: "1", name: "Houses", description: "Residential houses and homes", propertyCount: 245, isActive: true },
    { id: "2", name: "Apartments", description: "Residential apartments and flats", propertyCount: 189, isActive: true },
    { id: "3", name: "Commercial", description: "Commercial properties and offices", propertyCount: 67, isActive: true },
    { id: "4", name: "Land", description: "Land plots and undeveloped properties", propertyCount: 123, isActive: true },
    { id: "5", name: "Hotels", description: "Hotels and hospitality properties", propertyCount: 34, isActive: false },
  ];

  return (
    <>
    <div className="container mx-auto p-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Property Categories</h1>
          <p className="text-muted-foreground">
            Manage property types and categories
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Categories: {categories.length} | Active: {categories.filter(c => c.isActive).length}
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Category</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="categoryName">Category Name</Label>
                  <Input id="categoryName" placeholder="Enter category name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="categoryDescription">Description</Label>
                  <Input id="categoryDescription" placeholder="Enter category description" />
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isActive" defaultChecked className="rounded" />
                  <Label htmlFor="isActive">Active Category</Label>
                </div>
                <Button className="w-full">Create Category</Button>
              </div>
            </DialogContent>
          </Dialog>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Tag className="w-5 h-5" />
              All Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Properties</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell>{category.description}</TableCell>
                    <TableCell>{category.propertyCount}</TableCell>
                    <TableCell>
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button size="sm" variant="outline">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Edit Category</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="editName">Category Name</Label>
                                <Input id="editName" defaultValue={category.name} />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="editDescription">Description</Label>
                                <Input id="editDescription" defaultValue={category.description} />
                              </div>
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id="editActive"
                                  defaultChecked={category.isActive}
                                  className="rounded"
                                />
                                <Label htmlFor="editActive">Active Category</Label>
                              </div>
                              <Button className="w-full">Update Category</Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        </div>
      </div>
    </>
  );
}
