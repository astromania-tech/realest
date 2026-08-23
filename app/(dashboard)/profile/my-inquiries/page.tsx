"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Chip } from "@heroui/react";
import Link from "next/link";
import { MessageSquare, Calendar, MapPin, Eye } from "lucide-react";

interface SentInquiry {
  id: string;
  // property_title: string; //
  property_id: string;
  message: string;
  status: string;
  created_at: string;
  owner_response?: string;
  properties: {
    address: string;
    city: string;
  }[];
}

export default function MyInquiriesPage() {
  const [inquiries, setInquiries] = useState<SentInquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInquiries = async () => {
      const supabase = createClient();
      const { data: user } = await supabase.auth.getUser();

      if (!user.user) {
        setInquiries([]);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("inquiries")
        .select(
          `
          id,
          property_id,
          message,
          status,
          created_at,
          owner_response,
          properties (
            address,
            city
          )
        `,
        )
        .eq("user_id", user.user.id)
        .order("created_at", { ascending: false });

      if (!error && data) {
        setInquiries(data);
      }
      setIsLoading(false);
    };

    fetchInquiries();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "warning";
      case "responded":
        return "success";
      case "viewed":
        return "primary";
      default:
        return "default";
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              My Inquiries
            </h1>
            <p className="text-muted-foreground">
              Messages you've sent to property owners.
            </p>
          </div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-muted rounded-2xl animate-pulse shadow-lg"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            My Inquiries
          </h1>
          <p className="text-muted-foreground">
            Messages you've sent to property owners. ({inquiries.length}{" "}
            inquiries)
          </p>
        </div>

        {inquiries.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl p-8 max-w-md mx-auto shadow-lg">
              <MessageSquare className="w-12 h-12 text-primary mx-auto mb-4" />
              <p className="text-body-m text-muted-foreground mb-2">
                No inquiries sent yet.
              </p>
              <p className="text-body-s text-muted-foreground/80">
                Start contacting property owners about listings you're
                interested in!
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Browse Properties
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {inquiries.map((inquiry) => (
              <Card.Root
                key={inquiry.id}
                className="bg-surface/90 backdrop-blur-lg border border-border/50 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <Card.Content className="p-6">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <Link
                          href={`/property/${inquiry.property_id}`}
                          className="text-h3 font-semibold hover:text-primary transition-colors line-clamp-1"
                        >
                          {/* {inquiry.property_title} */}
                        </Link>
                        <Chip
                          variant="secondary"
                          color={getStatusColor(inquiry.status) as any}
                          size="sm"
                          className="ml-2 shrink-0"
                        >
                          {inquiry.status}
                        </Chip>
                      </div>

                      <div className="flex items-center gap-1 text-body-s text-muted-foreground mb-3">
                        <MapPin className="w-4 h-4 shrink-0 text-primary" />
                        <span className="line-clamp-1">
                          {inquiry.properties[0]?.address},{" "}
                          {inquiry.properties[0]?.city}
                        </span>
                      </div>

                      <p className="text-body-m text-foreground mb-3 line-clamp-2">
                        {inquiry.message}
                      </p>

                      {inquiry.owner_response && (
                        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-3">
                          <p className="text-body-s font-medium text-primary mb-1">
                            Owner Response:
                          </p>
                          <p className="text-body-s text-foreground">
                            {inquiry.owner_response}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center gap-4 text-body-s text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>
                            Sent{" "}
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {inquiry.status === "viewed" && (
                          <div className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            <span>Viewed by owner</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0">
                      <Link
                        href={`/property/${inquiry.property_id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        View Property
                      </Link>
                    </div>
                  </div>
                </Card.Content>
              </Card.Root>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
