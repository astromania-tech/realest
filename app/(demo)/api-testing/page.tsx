// realest / app / demo / api - testing / page.tsx;
"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Play,
  User,
  Home,
  Search,
  MessageSquare,
  Shield,
  Upload,
  Bell,
  MapPin,
  Settings,
  CheckCircle,
  XCircle,
  Loader2,
} from "lucide-react";

interface ApiResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export default function ApiTestingPage() {
  const [activeTab, setActiveTab] = useState("auth");
  const [authToken, setAuthToken] = useState("");
  const [userType, setUserType] = useState<
    "user" | "owner" | "agent" | "admin"
  >("user");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [customUrl, setCustomUrl] = useState("");
  const [customMethod, setCustomMethod] = useState<
    "GET" | "POST" | "PUT" | "DELETE"
  >("GET");
  const [customBody, setCustomBody] = useState("");

  // Form states for different endpoints
  const [propertyForm, setPropertyForm] = useState({
    title: "Beautiful 3 Bedroom Duplex in Lekki",
    description: "Modern duplex with 24/7 power, borehole water, and security.",
    price: "25000000",
    address: "Lekki Phase 1, Lagos",
    city: "Lagos",
    state: "Lagos",
    latitude: "6.4698",
    longitude: "3.5852",
    property_type: "duplex",
    listing_type: "for_sale",
    bedrooms: "3",
    bathrooms: "4",
    nepa_status: "stable",
    has_bq: "true",
    security_type: ["gated_community", "cctv"],
  });

  const [searchForm, setSearchForm] = useState({
    state: "Lagos",
    property_type: "duplex",
    min_price: "10000000",
    max_price: "50000000",
    nepa_status: "stable",
    has_bq: "true",
  });

  const [inquiryForm, setInquiryForm] = useState({
    property_id: "",
    message:
      "Hello! I am interested in this property. Is the price negotiable?",
    contact_phone: "+2348012345678",
    contact_email: "user@example.com",
  });

  const [geocodeForm, setGeocodeForm] = useState({
    address: "Lekki Phase 1, Lagos, Nigeria",
    country: "Nigeria",
  });

  const [uploadForm, setUploadForm] = useState({
    file_name: "property-photo.jpg",
    file_type: "image/jpeg",
    file_size: "2048000",
    bucket: "property-media",
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const makeApiCall = async (
    method: string,
    url: string,
    data?: any,
    auth: boolean = false,
  ) => {
    setLoading(true);
    setResponse(null);

    try {
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (auth && authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const config: RequestInit = {
        method,
        headers,
      };

      if (data && (method === "POST" || method === "PUT")) {
        config.body = JSON.stringify(data);
      }

      const response = await fetch(url, config);
      const result = await response.json();

      setResponse({
        success: response.ok,
        data: result,
      });
    } catch (error) {
      setResponse({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    } finally {
      setLoading(false);
    }
  };

  const testAuth = () => {
    makeApiCall("GET", "/api/profile", null, true);
  };

  const testProperties = () => {
    makeApiCall("GET", "/api/properties");
  };

  const testSearch = () => {
    const params = new URLSearchParams();
    Object.entries(searchForm).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    makeApiCall("GET", `/api/properties?${params.toString()}`);
  };

  const testCreateProperty = () => {
    const data = {
      title: propertyForm.title,
      description: propertyForm.description,
      price: parseInt(propertyForm.price),
      address: propertyForm.address,
      city: propertyForm.city,
      state: propertyForm.state,
      latitude: parseFloat(propertyForm.latitude),
      longitude: parseFloat(propertyForm.longitude),
      property_type: propertyForm.property_type,
      listing_type: propertyForm.listing_type,
      bedrooms: parseInt(propertyForm.bedrooms),
      bathrooms: parseInt(propertyForm.bathrooms),
      nepa_status: propertyForm.nepa_status,
      has_bq: propertyForm.has_bq === "true",
      security_type: propertyForm.security_type,
    };
    makeApiCall("POST", "/api/properties", data, true);
  };

  const testOwnerProperties = () => {
    makeApiCall("GET", "/api/properties/owner", null, true);
  };

  const testGeocode = () => {
    makeApiCall("POST", "/api/geocode", geocodeForm);
  };

  const testInquiries = () => {
    makeApiCall("GET", "/api/inquiries", null, true);
  };

  const testCreateInquiry = () => {
    makeApiCall("POST", "/api/inquiries", inquiryForm, true);
  };

  const testSavedProperties = () => {
    makeApiCall("GET", "/api/saved-properties", null, true);
  };

  const testNotifications = () => {
    makeApiCall("GET", "/api/notifications", null, true);
  };

  const testUploadSignedUrl = async () => {
    setLoading(true);
    setResponse(null);

    if (selectedFile) {
      // Use actual file data
      const data = {
        file_name: selectedFile.name,
        file_type: selectedFile.type,
        file_size: selectedFile.size,
        bucket: uploadForm.bucket,
      };

      try {
        // Get signed URL
        const signedUrlResponse = await fetch('/api/upload/signed-url', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authToken}`,
          },
          body: JSON.stringify(data),
        });

        if (!signedUrlResponse.ok) {
          setResponse({ success: false, error: 'Failed to get signed URL' });
          setLoading(false);
          return;
        }

        const { signed_url, public_url } = await signedUrlResponse.json();

        // Upload file to signed URL
        const uploadResponse = await fetch(signed_url, {
          method: 'PUT',
          body: selectedFile,
          headers: {
            'Content-Type': selectedFile.type,
          },
        });

        if (!uploadResponse.ok) {
          setResponse({ success: false, error: 'File upload failed' });
          setLoading(false);
          return;
        }

        setResponse({
          success: true,
          data: {
            message: 'File uploaded successfully',
            public_url,
            bucket: uploadForm.bucket,
          }
        });
      } catch (error) {
        setResponse({ success: false, error: 'Upload error occurred' });
      }
    } else {
      // Use form data for testing signed URL generation only
      const data = {
        ...uploadForm,
        file_size: parseInt(uploadForm.file_size),
      };
      makeApiCall("POST", "/api/upload/signed-url", data, true);
      return; // makeApiCall handles loading
    }

    setLoading(false);
  };

  const testAdminProperties = () => {
    makeApiCall(
      "GET",
      "/api/admin/properties?status=pending_vetting",
      null,
      true,
    );
  };

  const testCustomUrl = () => {
    if (!customUrl) return;
    let data = null;
    if (customMethod === "POST" || customMethod === "PUT") {
      try {
        data = customBody ? JSON.parse(customBody) : {};
      } catch (error) {
        setResponse({
          success: false,
          error: "Invalid JSON in request body",
        });
        return;
      }
    }
    makeApiCall(customMethod, customUrl, data, !!authToken);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold text-foreground">
            RealEST API Testing Suite
          </h1>
          <p className="text-lg text-muted-foreground">
            Comprehensive testing interface for all RealEST API endpoints
          </p>
          <Badge variant="secondary" className="text-sm">
            Nigerian Property Marketplace APIs
          </Badge>
        </div>

        {/* Authentication Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Authentication Setup
            </CardTitle>
            <CardDescription>
              Configure JWT token for authenticated API calls
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">JWT Token</label>
                <Textarea
                  placeholder="Paste your JWT token from browser localStorage (supabase.auth.token)"
                  value={authToken}
                  onChange={(e) => setAuthToken(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">User Type</label>
                <Select
                  value={userType}
                  onValueChange={(value: any) => setUserType(value)}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="owner">Owner</SelectItem>
                    <SelectItem value="agent">Agent</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button
                  onClick={testAuth}
                  disabled={!authToken}
                  className="w-full"
                >
                  <User className="w-4 h-4 mr-2" />
                  Test Auth
                </Button>
              </div>
            </div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Custom API URL</label>
                <div className="flex gap-2 mt-1">
                  <Select
                    value={customMethod}
                    onValueChange={(value: any) => setCustomMethod(value)}
                  >
                    <SelectTrigger className="w-24">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GET">GET</SelectItem>
                      <SelectItem value="POST">POST</SelectItem>
                      <SelectItem value="PUT">PUT</SelectItem>
                      <SelectItem value="DELETE">DELETE</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="/api/properties"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    onClick={testCustomUrl}
                    disabled={loading || !customUrl}
                  >
                    Test URL
                  </Button>
                </div>
              </div>
              {(customMethod === "POST" || customMethod === "PUT") && (
                <div>
                  <label className="text-sm font-medium">
                    Request Body (JSON)
                  </label>
                  <Textarea
                    placeholder='{"key": "value"}'
                    value={customBody}
                    onChange={(e) => setCustomBody(e.target.value)}
                    className="mt-1"
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Testing Interface */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="search">Search</TabsTrigger>
            <TabsTrigger value="inquiries">Inquiries</TabsTrigger>
            <TabsTrigger value="uploads">Uploads</TabsTrigger>
            <TabsTrigger value="admin">Admin</TabsTrigger>
            <TabsTrigger value="realtime">Real-time</TabsTrigger>
          </TabsList>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Public Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Public Properties
                  </CardTitle>
                  <CardDescription>Get all live properties</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={testProperties}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Get Properties
                  </Button>
                </CardContent>
              </Card>

              {/* Create Property */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    Create Property
                  </CardTitle>
                  <CardDescription>Create new property listing</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Title</label>
                      <Input
                        value={propertyForm.title}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            title: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Price (₦)</label>
                      <Input
                        type="number"
                        value={propertyForm.price}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            price: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      value={propertyForm.address}
                      onChange={(e) =>
                        setPropertyForm({
                          ...propertyForm,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-sm font-medium">State</label>
                      <Input
                        value={propertyForm.state}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">City</label>
                      <Input
                        value={propertyForm.city}
                        onChange={(e) =>
                          setPropertyForm({
                            ...propertyForm,
                            city: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Type</label>
                      <Select
                        value={propertyForm.property_type}
                        onValueChange={(value) =>
                          setPropertyForm({
                            ...propertyForm,
                            property_type: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="duplex">Duplex</SelectItem>
                          <SelectItem value="bungalow">Bungalow</SelectItem>
                          <SelectItem value="flat">Flat</SelectItem>
                          <SelectItem value="self_contained">
                            Self Contained
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">NEPA Status</label>
                      <Select
                        value={propertyForm.nepa_status}
                        onValueChange={(value) =>
                          setPropertyForm({
                            ...propertyForm,
                            nepa_status: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stable">Stable</SelectItem>
                          <SelectItem value="intermittent">
                            Intermittent
                          </SelectItem>
                          <SelectItem value="poor">Poor</SelectItem>
                          <SelectItem value="none">None</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Has BQ</label>
                      <Select
                        value={propertyForm.has_bq}
                        onValueChange={(value) =>
                          setPropertyForm({ ...propertyForm, has_bq: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={testCreateProperty}
                    disabled={loading || !authToken}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Create Property
                  </Button>
                </CardContent>
              </Card>

              {/* Owner Properties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Owner Properties
                  </CardTitle>
                  <CardDescription>
                    Get properties owned by current user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={testOwnerProperties}
                    disabled={loading || !authToken}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4 mr-2" />
                    )}
                    Get My Properties
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Search className="w-5 h-5" />
                    Advanced Search
                  </CardTitle>
                  <CardDescription>
                    Search properties with Nigerian market filters
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">State</label>
                      <Input
                        value={searchForm.state}
                        onChange={(e) =>
                          setSearchForm({
                            ...searchForm,
                            state: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Property Type
                      </label>
                      <Select
                        value={searchForm.property_type}
                        onValueChange={(value) =>
                          setSearchForm({ ...searchForm, property_type: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="duplex">Duplex</SelectItem>
                          <SelectItem value="bungalow">Bungalow</SelectItem>
                          <SelectItem value="flat">Flat</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">
                        Min Price (₦)
                      </label>
                      <Input
                        type="number"
                        value={searchForm.min_price}
                        onChange={(e) =>
                          setSearchForm({
                            ...searchForm,
                            min_price: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">
                        Max Price (₦)
                      </label>
                      <Input
                        type="number"
                        value={searchForm.max_price}
                        onChange={(e) =>
                          setSearchForm({
                            ...searchForm,
                            max_price: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">NEPA Status</label>
                      <Select
                        value={searchForm.nepa_status}
                        onValueChange={(value) =>
                          setSearchForm({ ...searchForm, nepa_status: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="stable">Stable</SelectItem>
                          <SelectItem value="intermittent">
                            Intermittent
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Has BQ</label>
                      <Select
                        value={searchForm.has_bq}
                        onValueChange={(value) =>
                          setSearchForm({ ...searchForm, has_bq: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="true">Yes</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button
                    onClick={testSearch}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Search className="w-4 h-4 mr-2" />
                    )}
                    Search Properties
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Geocoding
                  </CardTitle>
                  <CardDescription>
                    Convert addresses to coordinates
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Address</label>
                    <Input
                      value={geocodeForm.address}
                      onChange={(e) =>
                        setGeocodeForm({
                          ...geocodeForm,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Country</label>
                    <Input
                      value={geocodeForm.country}
                      onChange={(e) =>
                        setGeocodeForm({
                          ...geocodeForm,
                          country: e.target.value,
                        })
                      }
                    />
                  </div>
                  <Button
                    onClick={testGeocode}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MapPin className="w-4 h-4 mr-2" />
                    )}
                    Geocode Address
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Inquiries Tab */}
          <TabsContent value="inquiries" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    My Inquiries
                  </CardTitle>
                  <CardDescription>
                    Get inquiries sent/received by current user
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={testInquiries}
                    disabled={loading || !authToken}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    Get Inquiries
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5" />
                    Send Inquiry
                  </CardTitle>
                  <CardDescription>
                    Send inquiry about a property
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Property ID</label>
                    <Input
                      placeholder="Enter property ID"
                      value={inquiryForm.property_id}
                      onChange={(e) =>
                        setInquiryForm({
                          ...inquiryForm,
                          property_id: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Message</label>
                    <Textarea
                      value={inquiryForm.message}
                      onChange={(e) =>
                        setInquiryForm({
                          ...inquiryForm,
                          message: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Phone</label>
                      <Input
                        value={inquiryForm.contact_phone}
                        onChange={(e) =>
                          setInquiryForm({
                            ...inquiryForm,
                            contact_phone: e.target.value,
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Email</label>
                      <Input
                        type="email"
                        value={inquiryForm.contact_email}
                        onChange={(e) =>
                          setInquiryForm({
                            ...inquiryForm,
                            contact_email: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <Button
                    onClick={testCreateInquiry}
                    disabled={loading || !authToken}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <MessageSquare className="w-4 h-4 mr-2" />
                    )}
                    Send Inquiry
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Uploads Tab */}
          <TabsContent value="uploads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  File Upload Testing
                </CardTitle>
                <CardDescription>
                  Test signed URL generation and file uploads to all storage buckets
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Select File</label>
                  <Input
                    type="file"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setSelectedFile(file);
                        setUploadForm({
                          ...uploadForm,
                          file_name: file.name,
                          file_type: file.type,
                          file_size: file.size.toString(),
                        });
                      }
                    }}
                    accept="image/*,.pdf,.doc,.docx"
                  />
                  {selectedFile && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">File Name</label>
                    <Input
                      value={uploadForm.file_name}
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          file_name: e.target.value,
                        })
                      }
                      disabled={!!selectedFile}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">File Type</label>
                    <Input
                      value={uploadForm.file_type}
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          file_type: e.target.value,
                        })
                      }
                      disabled={!!selectedFile}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">
                      File Size (bytes)
                    </label>
                    <Input
                      type="number"
                      value={uploadForm.file_size}
                      onChange={(e) =>
                        setUploadForm({
                          ...uploadForm,
                          file_size: e.target.value,
                        })
                      }
                      disabled={!!selectedFile}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Bucket</label>
                    <Select
                      value={uploadForm.bucket}
                      onValueChange={(value) =>
                        setUploadForm({ ...uploadForm, bucket: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="property-media">
                          Property Media
                        </SelectItem>
                        <SelectItem value="property-documents">
                          Property Documents
                        </SelectItem>
                        <SelectItem value="avatars">Avatars</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={testUploadSignedUrl}
                    disabled={loading || !authToken}
                    className="flex-1"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-2" />
                    )}
                    {selectedFile ? 'Upload File' : 'Get Signed URL'}
                  </Button>
                  <Button
                    onClick={() => setSelectedFile(null)}
                    variant="outline"
                    disabled={!selectedFile}
                  >
                    Clear File
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Admin Tab */}
          <TabsContent value="admin" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Admin Tools
                </CardTitle>
                <CardDescription>
                  Admin-only property validation and management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  onClick={testAdminProperties}
                  disabled={loading || !authToken}
                  className="w-full"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Shield className="w-4 h-4 mr-2" />
                  )}
                  Get Pending Properties
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Real-time Tab */}
          <TabsContent value="realtime" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="w-5 h-5" />
                    Notifications
                  </CardTitle>
                  <CardDescription>Get user notifications</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={testNotifications}
                    disabled={loading || !authToken}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Bell className="w-4 h-4 mr-2" />
                    )}
                    Get Notifications
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Saved Properties
                  </CardTitle>
                  <CardDescription>
                    Get user's saved/favorite properties
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    onClick={testSavedProperties}
                    disabled={loading || !authToken}
                    className="w-full"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Settings className="w-4 h-4 mr-2" />
                    )}
                    Get Saved Properties
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Response Display */}
        {response && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {response.success ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-500" />
                )}
                API Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full">
                <pre className="text-sm whitespace-pre-wrap">
                  {JSON.stringify(response, null, 2)}
                </pre>
              </ScrollArea>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Alert>
          <AlertDescription>
            <strong>Instructions:</strong>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>
                Get JWT tokens by logging in to the app with the provided
                credentials
              </li>
              <li>Paste the token in the Authentication section above</li>
              <li>Test different endpoints using the tabs above</li>
              <li>Check the API Response section for results</li>
              <li>
                Use different user types (user/owner/agent/admin) to test
                role-based access
              </li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
