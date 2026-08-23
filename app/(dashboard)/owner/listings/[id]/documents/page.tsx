"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Chip } from "@heroui/react";
import { Card, CardContent, Button, Input, Spinner } from "@/components/ui";
import {
  ArrowLeft,
  Upload,
  FileText,
  Download,
  Eye,
  Trash2,
  CheckCircle,
  AlertCircle,
  Plus,
} from "lucide-react";

interface Document {
  id: string;
  filename: string;
  type: string;
  size: number;
  uploaded_at: string;
  verified: boolean;
  url: string;
}

const documentTypes = [
  { value: "deed", label: "Property Deed" },
  { value: "certificate", label: "Certificate of Occupancy" },
  { value: "survey", label: "Survey Plan" },
  { value: "receipt", label: "Payment Receipt" },
  { value: "id", label: "ID Document" },
  { value: "other", label: "Other" },
];

export default function ListingDocumentsPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params.id as string;
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [propertyTitle, setPropertyTitle] = useState("");

  useEffect(() => {
    const fetchDocuments = async () => {
      // TODO: Replace with actual API call
      setTimeout(() => {
        const mockDocuments: Document[] = [
          {
            id: "1",
            filename: "property_deed.pdf",
            type: "deed",
            size: 2048576,
            uploaded_at: "2024-01-15T10:00:00Z",
            verified: true,
            url: "/documents/deed.pdf",
          },
          {
            id: "2",
            filename: "certificate_of_occupancy.pdf",
            type: "certificate",
            size: 1536000,
            uploaded_at: "2024-01-15T10:05:00Z",
            verified: false,
            url: "/documents/certificate.pdf",
          },
        ];

        setDocuments(mockDocuments);
        setPropertyTitle("Modern 3BR Apartment in Lekki");
        setIsLoading(false);
      }, 1000);
    };

    if (propertyId) {
      fetchDocuments();
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
      console.log("Uploading documents:", files);

      // Simulate upload delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Mock successful upload
      const newDocuments: Document[] = Array.from(files).map((file, index) => ({
        id: `new-${Date.now()}-${index}`,
        filename: file.name,
        type: "other", // Default type, user can change later
        size: file.size,
        uploaded_at: new Date().toISOString(),
        verified: false,
        url: URL.createObjectURL(file),
      }));

      setDocuments((prev) => [...prev, ...newDocuments]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      // TODO: Implement API call to delete document
      setDocuments((prev) => prev.filter((doc) => doc.id !== documentId));
    } catch (error) {
      console.error("Failed to delete document:", error);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getDocumentTypeLabel = (type: string) => {
    const docType = documentTypes.find((dt) => dt.value === type);
    return docType ? docType.label : type;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-muted rounded-lg mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-32 bg-muted rounded-2xl"></div>
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
                Manage Documents
              </h1>
              <p className="text-muted-foreground">
                Upload and verify documents for {propertyTitle}
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Link href={`/owner/listings/${propertyId}`}>
              <Button variant="ghost">Back to Edit</Button>
            </Link>
            <Link href={`/listing/${propertyId}`}>
              <Button variant="secondary">
                <Eye className="w-4 h-4 mr-2" />
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
              <h3 className="text-lg font-semibold mb-2">Upload Documents</h3>
              <p className="text-muted-foreground mb-6">
                Upload property documents like deeds, certificates, and receipts
                for verification.
              </p>

              <div className="flex justify-center">
                <label htmlFor="document-upload">
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
                Supported formats: PDF, DOC, DOCX, JPG, PNG. Max file size: 10MB
                each.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Documents List */}
        {documents.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <FileText className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-body-m text-muted-foreground mb-2">
                No documents uploaded yet.
              </p>
              <p className="text-body-s text-muted-foreground/80 mb-4">
                Upload property documents to increase buyer trust and complete
                verification.
              </p>
              <label htmlFor="document-upload">
                <Button variant="default">
                  <Upload className="w-4 h-4 mr-2" />
                  Upload First Document
                </Button>
              </label>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <Card
                key={document.id}
                className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">
                          {document.filename}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{getDocumentTypeLabel(document.type)}</span>
                          <span>{formatFileSize(document.size)}</span>
                          <span>
                            Uploaded{" "}
                            {new Date(
                              document.uploaded_at,
                            ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Verification Status */}
                      <div className="flex items-center gap-2">
                        {document.verified ? (
                          <Chip variant="secondary" color="success" size="sm">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Verified
                          </Chip>
                        ) : (
                          <Chip variant="secondary" color="warning" size="sm">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            Pending
                          </Chip>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <Link href={document.url} target="_blank">
                          <Button variant="ghost" size="sm">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Link href={document.url} download>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Document Requirements */}
        <Card className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl shadow-lg">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">Required Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documentTypes.slice(0, 4).map((type) => {
                const hasDocument = documents.some(
                  (doc) => doc.type === type.value,
                );
                return (
                  <div key={type.value} className="flex items-center gap-3">
                    {hasDocument ? (
                      <CheckCircle className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-warning" />
                    )}
                    <span
                      className={`text-sm ${
                        hasDocument ? "text-success" : "text-muted-foreground"
                      }`}
                    >
                      {type.label}
                    </span>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              Upload required documents to improve your listing's verification
              status and attract more serious buyers.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
