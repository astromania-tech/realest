import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Edit, Trash2, Star } from "lucide-react";

export default async function AmenitiesPage() {
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

  // Mock amenities data (in a real app, this would come from an amenities table)
  const amenities = [
    { id: "1", name: "Swimming Pool", category: "Recreation", usageCount: 89, isActive: true },
    { id: "2", name: "Gym", category: "Fitness", usageCount: 156, isActive: true },
    { id: "3", name: "Parking", category: "Convenience", usageCount: 234, isActive: true },
    { id: "4", name: "Security", category: "Safety", usageCount: 198, isActive: true },
    { id: "5", name: "Generator", category: "Utilities", usageCount: 145, isActive: true },
    { id: "6", name: "Air Conditioning", category: "Comfort", usageCount: 167, isActive: true },
  ];

  return (
    <>
    <div className="container mx-auto p-4">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Property Amenities</h1>
          <p className="text-muted-foreground">
            Manage property features and amenities
          </p>
        </div>

        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-muted-foreground">
              Total Amenities: {amenities.length} | Active: {amenities.filter(a => a.isActive).length}
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Amenity
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Amenity</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amenityName">Amenity Name</Label>
                  <Input id="amenityName" placeholder="Enter amenity name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="amenityCategory">Category</Label>
                  <select
                    id="amenityCategory"
                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  >
                    <option value="">Select category</option>
                    <option value="Recreation">Recreation</option>
                    <option value="Fitness">Fitness</option>
                    <option value="Convenience">Convenience</option>
                    <option value="Safety">Safety</option>
                    <option value="Utilities">Utilities</option>
                    <option value="Comfort">Comfort</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="isActive" defaultChecked className="rounded" />
                  <Label htmlFor="isActive">Active Amenity</Label>
                </div>
                <Button className="w-full">Create Amenity</Button>
              </div>
            </DialogContent>
          </Dialog>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                All Amenities
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Usage Count</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {amenities.map((amenity) => (
                    <TableRow key={amenity.id}>
                      <TableCell className="font-medium">{amenity.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{amenity.category}</Badge>
                      </TableCell>
                      <TableCell>{amenity.usageCount}</TableCell>
                      <TableCell>
                        <Badge variant={amenity.isActive ? "default" : "secondary"}>
                          {amenity.isActive ? "Active" : "Inactive"}
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
                                <DialogTitle>Edit Amenity</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4">
                                <div className="space-y-2">
                                  <Label htmlFor="editName">Amenity Name</Label>
                                  <Input id="editName" defaultValue={amenity.name} />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="editCategory">Category</Label>
                                  <select
                                    id="editCategory"
                                    defaultValue={amenity.category}
                                    className="w-full px-3 py-2 border border-input bg-background rounded-md"
                                  >
                                    <option value="Recreation">Recreation</option>
                                    <option value="Fitness">Fitness</option>
                                    <option value="Convenience">Convenience</option>
                                    <option value="Safety">Safety</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Comfort">Comfort</option>
                                  </select>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <input
                                    type="checkbox"
                                    id="editActive"
                                    defaultChecked={amenity.isActive}
                                    className="rounded"
                                  />
                                  <Label htmlFor="editActive">Active Amenity</Label>
                                </div>
                                <Button className="w-full">Update Amenity</Button>
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
