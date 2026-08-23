"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Chip } from "@heroui/react";
import { Card, CardContent, Button, Input, Spinner } from "@/components/ui";
import {
  ArrowLeft,
  Upload,
  X,
  Image as ImageIcon,
  Star,
  StarOff,
  Trash2,
  Plus,
} from "lucide-react";

interface MediaItem {
  id: string;
  url: string;
  filename: string;
  type: "image" | "video";
  size: number;
  uploaded_at: string;
  is_featured: boolean;
  order: number;
}

export default function ListingMediaPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [propertyTitle, setPropertyTitle] = useState("");

  useEffect(() => {
    const fetchMedia = async () => {
      // TODO: Replace with actual API call
      setTimeout(() => {
        const mockMedia: MediaItem[] = [
          {
            id: "1",
            url: "/placeholder-property-1.jpg",
            filename: "living-room.jpg",
            type: "image",
            size: 2048576,
            uploaded_at: "2024-01-15T10:00:00Z",
            is_featured: true,
            order: 1,
          },
          {
            id: "2",
            url: "/placeholder-property-2.jpg",
            filename: "kitchen.jpg",
            type: "image",
            size: 1536000,
            uploaded_at: "2024-01-15T10:05:00Z",
            is_featured: false,
            order: 2,
          },
          {
            id: "3",
            url: "/placeholder-property-3.jpg",
            filename: "bedroom.jpg",
            type: "image",
            size: 1879048,
            uploaded_at: "2024-01-15T10:10:00Z",
            is_featured: false,
            order: 3,
          },
        ];

        setMedia(mockMedia);
        setPropertyTitle("Modern 3BR Apartment in Lekki");
        setIsLoading(false);
      }, 1000);
    };

    if (propertyId) {
      fetchMedia();
    }
  }, [propertyId]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      // TODO: Implement actual file upload
      console.log("Uploading files:", files);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful upload
      const newMedia: MediaItem[] = Array.from(files).map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        url: URL.createObjectURL(file),
        filename: file.name,
        type: file.type.startsWith("video/") ? "video" : "image",
        size: file.size,
        uploaded_at: new Date().toISOString(),
        is_featured: false,
        order: media.length + index + 1,
      }));

      setMedia((prev) => [...prev, ...newMedia]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleSetFeatured = async (mediaId: string) => {
    try {
      // TODO: Implement API call to set featured image
      setMedia((prev) =>
        prev.map((item) => ({
          ...item,
          is_featured: item.id === mediaId,
        })),
      );
    } catch (error) {
      console.error("Failed to set featured image:", error);
    }
  };

  const handleDeleteMedia = async (mediaId: string) => {
    if (!confirm("Are you sure you want to delete this media file?")) return;

    try {
      // TODO: Implement API call to delete media
      setMedia((prev) => prev.filter((item) => item.id !== mediaId));
    } catch (error) {
      console.error("Failed to delete media:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-muted rounded-2xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href={`/owner/listings/${propertyId}`}>
              <Button variant="ghost" size="icon-sm" >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">
                Manage Media
              </h1>
              <p className="text-muted-foreground">
                Upload and organize photos for {propertyTitle}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/owner/listings/${propertyId}`}>
              <Button variant="ghost">Back to Edit</Button>
            </Link>
            <Link href={`/listing/${propertyId}`}>
              <Button variant="secondary">
                <ImageIcon className="w-4 h-4 mr-2" />
                Preview Listing
              </Button>
            </Link>
          </div>
        </div>

        {/* Upload Section */}
        <Card className="mb-8 bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Upload Media</h3>
              <p className="text-muted-foreground mb-6">
                Add high-quality photos and videos of your property. First image
                will be featured.
              </p>

              <div className="flex justify-center">
                <label htmlFor="media-upload">
                  <Button variant="default" disabled={isUploading}>
                    {isUploading ? (
                      <>
                        <Spinner className="mr-2" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Choose Files
                      </>
                    )}
                  </Button>
                  <input
                    id="media-upload"
                    type="file"
                    multiple
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              <p className="text-xs text-muted-foreground mt-4">
                Supported formats: JPG, PNG, GIF, MP4, MOV. Max file size: 10MB
                each.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Media Grid */}
        {media.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <ImageIcon className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-body-m text-muted-foreground mb-2">
                No media uploaded yet.
              </p>
              <p className="text-body-s text-muted-foreground/80 mb-4">
                Start by uploading photos of your property to attract more
                buyers.
              </p>
              <label htmlFor="media-upload">
                <Button variant="default">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First Photo
                </Button>
              </label>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {media.map((item) => (
              <Card
                key={item.id}
                className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg overflow-hidden"
              >
                {/* Media Preview */}
                <div className="relative aspect-video bg-muted">
                  {item.type === "image" ? (
                    <img
                      src={item.url}
                      alt={item.filename}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.url}
                      className="w-full h-full object-cover"
                      controls
                    />
                  )}

                  {/* Featured Badge */}
                  {item.is_featured && (
                    <div className="absolute top-3 left-3">
                      <Chip
                        variant="secondary"
                        className="bg-accent/20 text-accent border-accent/30"
                      >
                        <Star className="w-3 h-3 mr-1" />
                        Featured
                      </Chip>
                    </div>
                  )}

                  {/* Actions Overlay */}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => handleSetFeatured(item.id)}
                      className={
                        item.is_featured ? "bg-accent/20 text-accent" : ""
                      }
                    >
                      {item.is_featured ? (
                        <Star className="w-4 h-4" />
                      ) : (
                        <StarOff className="w-4 h-4" />
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon-sm"
                      onClick={() => handleDeleteMedia(item.id)}
                      className="bg-destructive/20 text-destructive hover:bg-destructive/30"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {/* Media Info */}
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate mb-1">
                        {item.filename}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(item.size)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Uploaded{" "}
                        {new Date(item.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Chip
                      variant="secondary"
                      size="sm"
                      className="ml-2 shrink-0"
                    >
                      {item.type}
                    </Chip>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Tips */}
        <Card className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">
              Photo Tips for Better Listings
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">📸 High Quality Photos</h4>
                <p className="text-muted-foreground">
                  Use natural lighting and clean backgrounds for professional
                  results.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">🏠 Show All Rooms</h4>
                <p className="text-muted-foreground">
                  Include photos of every room, bathroom, and outdoor spaces.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">⭐ Feature Photo</h4>
                <p className="text-muted-foreground">
                  Choose the most attractive photo as your featured image.
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">📐 Proper Order</h4>
                <p className="text-muted-foreground">
                  Arrange photos logically: exterior, living areas, bedrooms,
                  etc.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
