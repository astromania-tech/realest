import { createClient, getAuthUser} from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle, XCircle, Eye, MessageSquare, Image } from "lucide-react";

export default async function ContentPage() {
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

  // Mock content data (in a real app, this would come from reviews and media tables)
  const pendingReviews = [
    {
      id: "1",
      propertyTitle: "Luxury Apartment in Lekki",
      reviewerName: "John Doe",
      rating: 4,
      review: "Great location and amenities. Highly recommended!",
      submittedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: "2",
      propertyTitle: "3BR House in Ikeja",
      reviewerName: "Jane Smith",
      rating: 2,
      review: "Property needs maintenance. Not as described.",
      submittedAt: "2024-01-14T14:20:00Z",
    },
  ];

  const pendingMedia = [
    {
      id: "1",
      propertyTitle: "Commercial Space in Victoria Island",
      uploaderName: "Mike Johnson",
      mediaType: "image",
      fileName: "property_exterior.jpg",
      uploadedAt: "2024-01-15T09:15:00Z",
    },
    {
      id: "2",
      propertyTitle: "Land Plot in Abuja",
      uploaderName: "Sarah Wilson",
      mediaType: "video",
      fileName: "land_tour.mp4",
      uploadedAt: "2024-01-14T16:45:00Z",
    },
  ];

  return (
    <>
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Content Moderation</h1>
          <p className="text-muted-foreground">
            Review and moderate user reviews and uploaded media
          </p>
          
        <Tabs defaultValue="reviews" className="space-y-6">
          <TabsList>
            <TabsTrigger value="reviews" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Reviews ({pendingReviews.length})
            </TabsTrigger>
            <TabsTrigger value="media" className="flex items-center gap-2">
              <Image className="w-4 h-4" />
              Media ({pendingMedia.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Pending Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Reviewer</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Submitted</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingReviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">{review.propertyTitle}</TableCell>
                        <TableCell>{review.reviewerName}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <span className="font-medium">{review.rating}</span>
                            <span className="text-yellow-500">★</span>
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{review.review}</TableCell>
                        <TableCell>{new Date(review.submittedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              View
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="media">
            <Card>
              <CardHeader>
                <CardTitle>Pending Media</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Property</TableHead>
                      <TableHead>Uploader</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>File</TableHead>
                      <TableHead>Uploaded</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingMedia.map((media) => (
                      <TableRow key={media.id}>
                        <TableCell className="font-medium">{media.propertyTitle}</TableCell>
                        <TableCell>{media.uploaderName}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{media.mediaType}</Badge>
                        </TableCell>
                        <TableCell>{media.fileName}</TableCell>
                        <TableCell>{new Date(media.uploadedAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="w-4 h-4 mr-1" />
                              Preview
                            </Button>
                            <Button size="sm" className="bg-green-600 hover:bg-green-700">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive">
                              <XCircle className="w-4 h-4 mr-1" />
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
