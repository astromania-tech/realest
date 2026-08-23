"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, Button, Input, Spinner } from "@/components/ui";
import { ArrowLeft, Upload, Save, FileText } from "lucide-react";

export default function PropertyDocumentsStep() {
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
      // TODO: Upload documents to server
      console.log("Uploading documents:", uploadedFiles);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Navigate to next step
      router.push(`/owner/listings/new/review?type=${propertyType}`);
    } catch (error) {
      console.error("Failed to upload documents:", error);
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
              <Link href={`/owner/listings/new/media?type=${propertyType}`}>
                <Button variant="ghost" size="icon-sm" >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  Documents
                </h1>
                <p className="text-muted-foreground">
                  Upload property documents for verification
                </p>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">Step 5 of 6</div>
          </div>

          <form onSubmit={handleSubmit}>
            <Card className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">
                    Upload Documents
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Upload property documents like deeds, certificates, and
                    receipts for verification.
                  </p>

                  <div className="flex justify-center">
                    <label htmlFor="document-upload">
                      <Button variant="default">
                        <Upload className="w-4 h-4 mr-2" />
                        Choose Files
                      </Button>
                      <input
                        id="document-upload"
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.png"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <p className="text-xs text-muted-foreground mt-4">
                    Supported formats: PDF, DOC, DOCX, JPG, PNG. Max file size:
                    10MB each.
                  </p>
                </div>

                {/* Uploaded Files Preview */}
                {uploadedFiles.length > 0 && (
                  <div className="mt-8">
                    <h4 className="font-medium mb-4">
                      Uploaded Documents ({uploadedFiles.length})
                    </h4>
                    <div className="space-y-3">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <FileText className="w-5 h-5 text-primary" />
                          <span className="flex-1 text-sm">{file.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Required Documents */}
                <div className="mt-8 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h4 className="font-medium mb-3">📋 Required Documents</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div>• Property Deed</div>
                    <div>• Certificate of Occupancy</div>
                    <div>• Survey Plan</div>
                    <div>• Payment Receipt</div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    Upload these documents to improve verification and attract
                    serious buyers.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-border">
              <Link href={`/owner/listings/new/media?type=${propertyType}`}>
                <Button variant="ghost">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Media
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
                    Continue to Review
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
