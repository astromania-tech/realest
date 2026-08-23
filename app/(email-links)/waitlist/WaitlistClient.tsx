"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  ArrowRight,
  Users,
  ShieldCheck,
} from "lucide-react";
import WaitlistModal from "@/components/shared/WaitlistModal";

export default function WaitlistClient({ initialTotal }: { initialTotal: number }) {
  const [totalCount, setTotalCount] = useState<number | null>(initialTotal);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [result, setResult] = useState<{
    position?: number;
    totalCount?: number;
    firstName?: string;
    referralCode?: string | null;
  } | null>(null);

  if (result !== null) {
    return (
      <div className="min-h-screen bg-background">
        <section className="py-32 px-4">
          <div className="container mx-auto max-w-md text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-9 h-9 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-3">
              You&apos;re on the list{result.firstName ? `, ${result.firstName}` : ""}!
            </h1>
            {result.position && (
              <div className="my-4 p-4 rounded-xl bg-muted/50 border border-border">
                <p className="text-4xl font-bold text-primary">
                  #{result.position}
                </p>
                <p className="text-sm text-muted-foreground">
                  your position out of{" "}
                  {(result.totalCount ?? totalCount)?.toLocaleString() ??
                    "thousands"}{" "}
                  people
                </p>
              </div>
            )}
            <p className="text-sm text-muted-foreground mb-8">
              We&apos;ll email you as we get closer to launch. Refer a friend to
              move up the queue.
            </p>
            <div className="flex gap-3 justify-center">
              <Button asChild>
                <Link href={result.referralCode ? `/refer?ref=${encodeURIComponent(result.referralCode)}` : "/refer"}>
                  Refer a Friend <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="py-24 px-4 text-center text-white"
        style={{ backgroundColor: "#07402F" }}
      >
        <div className="container mx-auto max-w-2xl">
          <Badge className="mb-4 uppercase tracking-widest text-xs border-white/30 bg-white/10 text-white">
            Join the Waitlist
          </Badge>
          <h1 className="text-4xl font-bold leading-tight mb-4">
            Nigeria&apos;s verified property marketplace is almost here
          </h1>
          <p className="text-white/80 text-lg mb-6">
            End duplex fraud. Find verified homes. List with confidence.
          </p>
          {totalCount !== null && (
            <p className="text-sm mb-8" style={{ color: "#ADF434" }}>
              <Users className="w-4 h-4 inline mr-1" />
              {totalCount.toLocaleString()} people already waiting
            </p>
          )}
        </div>
      </section>

      {/* Form */}
      <section className="py-16 px-4">
        <div className="container mx-auto max-w-sm">
          <Button
            className="w-full mt-5"
            size="lg"
            onClick={() => setIsModalOpen(true)}
          >
            <ArrowRight className="w-4 h-4 mr-2" />
            Join Waitlist
          </Button>
          <p className="text-xs text-muted-foreground mt-3 text-center">
            Free forever. No spam.
          </p>
        </div>
      </section>

      <WaitlistModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={(data) => {
          setIsModalOpen(false);
          setResult({
            position: data.position,
            totalCount: data.totalCount,
            firstName: data.firstName,
            referralCode: data.referralCode,
          });
        }}
      />

      {/* Social proof */}
      <section className="py-12 px-4 bg-muted/30 border-t border-border">
        <div className="container mx-auto max-w-2xl grid md:grid-cols-3 gap-6 text-center">
          {[
            { icon: ShieldCheck, label: "100% Verified Listings", sub: "Every listing is vetted before going live" },
            { icon: Users, label: "Thousands Waiting", sub: "Join a community of property seekers and owners" },
            { icon: CheckCircle, label: "Zero Duplicates", sub: "No double-listed or ghost properties" },
          ].map((item) => (
            <div key={item.label}>
              <item.icon className="w-6 h-6 text-primary mx-auto mb-2" />
              <p className="font-semibold text-sm">{item.label}</p>
              <p className="text-xs text-muted-foreground mt-1">{item.sub}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
