"use client";

import type React from "react";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, Button, TextArea } from "@heroui/react";
import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { Mail, Phone, MessageSquare } from "lucide-react";

interface Property {
  id: string;
  title: string;
  owner_id: string;
  price: number;
}

interface Owner {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  avatar_url: string;
}

interface ContactOwnerProps {
  property: Property;
  owner: Owner;
  currentUser: User | null;
}

export default function ContactOwner({
  property,
  owner,
  currentUser,
}: ContactOwnerProps) {
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSendInquiry = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!currentUser) {
      setError("Please log in to send an inquiry");
      return;
    }

    if (!message.trim()) {
      setError("Please enter a message");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const supabase = createClient();
      const { error: inquiryError } = await supabase.from("inquiries").insert({
        property_id: property.id,
        sender_id: currentUser.id,
        owner_id: property.owner_id,
        message: message.trim(),
      });

      if (inquiryError) throw inquiryError;

      setSuccess(true);
      setMessage("");
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send inquiry");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Owner Card */}
      <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50">
        <Card.Header>
          <Card.Title>Property Owner</Card.Title>
        </Card.Header>
        <Card.Content className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white text-2xl font-bold">
              {owner.full_name?.charAt(0) || "O"}
            </div>
            <div>
              <h3 className="font-semibold">
                {owner.full_name || "Property Owner"}
              </h3>
              <p className="text-sm text-muted-foreground">Owner/Agent</p>
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t">
            {owner.email && (
              <a
                href={`mailto:${owner.email}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Mail className="w-4 h-4" />
                {owner.email}
              </a>
            )}
            {owner.phone && (
              <a
                href={`tel:${owner.phone}`}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Phone className="w-4 h-4" />
                {owner.phone}
              </a>
            )}
          </div>
        </Card.Content>
      </Card.Root>

      {/* Contact Form */}
      <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50">
        <Card.Header>
          <Card.Title className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Send Inquiry
          </Card.Title>
        </Card.Header>
        <Card.Content>
          {!currentUser ? (
            <div className="text-center py-6">
              <p className="text-muted-foreground mb-4">
                Please log in to send an inquiry
              </p>
              <Link href="/login">
                <Button className="w-full">Log In</Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSendInquiry} className="space-y-4">
              <div>
                <TextArea
                  placeholder="Tell the owner about your interest in this property..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-32"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                  Inquiry sent successfully! The owner will contact you soon.
                </div>
              )}

              <Button type="submit" className="w-full" isDisabled={isLoading}>
                {isLoading ? "Sending..." : "Send Inquiry"}
              </Button>
            </form>
          )}
        </Card.Content>
      </Card.Root>

      {/* Mortgage Calculator */}
      <Card.Root className="bg-background/80 backdrop-blur-lg border border-border/50">
        <Card.Header>
          <Card.Title>Mortgage Calculator</Card.Title>
        </Card.Header>
        <Card.Content>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Property Price</label>
              <p className="text-2xl font-bold text-primary">
                £{property.price?.toLocaleString() || "0"}
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Use a mortgage calculator to estimate your monthly payments
            </p>
          </div>
        </Card.Content>
      </Card.Root>
    </div>
  );
}
