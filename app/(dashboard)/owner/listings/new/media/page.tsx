"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Button, Input, Spinner } from "@/components/ui";
import { ArrowLeft, Upload, Save, Image as ImageIcon } from "lucide-react";

export default function PropertyMediaStep() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyType = searchParams.get("type") || "";
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  useEffect(() => {
    if (!propertyType) {
      router.push("/owner/listings/new/type");
    }
  }, [propertyType, router]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      setUploadedFiles(Array.from(files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Upload files to server
      console.log("Uploading media files:", uploadedFiles);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to next step
      router.push(`/owner/listings/new/documents?type=${propertyType}`);
    } catch (error) {
      console.error("Failed to upload media:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!propertyType) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Link href={`/owner/listings/new/location?type=${propertyType}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Photos & Media
                </h1>
                <p className="text-muted-foreground">
                  Upload high-quality photos and videos of your {propertyType}
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Step 4 of 6</div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Upload Media</h3>
                  <p className="text-muted-foreground mb-6">
                    Add photos and videos to showcase your property. The first
                    image will be your featured photo.
                  </p>

                  <div className="flex justify-center">
                    <label htmlFor="media-upload">
                      <Button variant="default">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
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
                    Supported formats: JPG, PNG, GIF, MP4, MOV. Max file size:
                    10MB each.
                  </p>
                </div>

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-medium mb-4">
                      Uploaded Files ({uploadedFiles.length})
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {uploadedFiles.map((file, index) => (
                        <div key={index} className="relative">
                          <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-muted-foreground" />
                          </div>
                          <p className="text-xs text-muted-foreground mt-2 truncate">
                            {file.name}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-medium mb-2">📸 Photo Tips</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Take photos during daylight for best results</li>
                    <li>• Include photos of all rooms and outdoor spaces</li>
                    <li>• Clean and declutter before photographing</li>
                    <li>• Use landscape orientation for most photos</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Link href={`/owner/listings/new/location?type=${propertyType}`}>
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Location
                </Button>
              </Link>
              <Button type="submit" variant="default" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Spinner className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Continue to Documents
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
