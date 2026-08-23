"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  MapPin,
  CheckCircle,
  Zap,
  Lock,
  TrendingUp,
  Eye,
  ArrowRight,
} from "lucide-react";

const FEATURES = [
  {
    icon: Shield,
    title: "Document Verification",
    description:
      "C of O, survey plans, and ID documents are verified by our vetting team before any listing goes live.",
    illustration: "/assets/undraw_document-ready_o5d5.svg",
  },
  {
    icon: MapPin,
    title: "Geo-Tagging",
    description:
      "Every property is pinned using real coordinates — no more fake addresses or wrong neighbourhoods.",
    illustration: "/assets/undraw_delivery-location_um5t.svg",
  },
  {
    icon: CheckCircle,
    title: "Zero Duplicates",
    description:
      "Our ML layer flags duplicate listings in real time. One property, one listing — always.",
    illustration: "/assets/undraw_searching-everywhere_tffi.svg",
  },
  {
    icon: Lock,
    title: "Agent Licensing",
    description:
      "All agents are verified against ESVARBON and CAC records before they can list on RealEST.",
    illustration: "/assets/undraw_certification_i2m0.svg",
  },
  {
    icon: TrendingUp,
    title: "Market Analytics",
    description:
      "Real-time price trends by LGA so buyers and owners make data-driven decisions.",
    illustration: "/assets/undraw_progress-tracking_9m3o.svg",
  },
  {
    icon: Zap,
    title: "Instant Inquiries",
    description:
      "Connect with verified owners directly — no middlemen, no ghost numbers.",
    illustration: "/assets/undraw_house-searching_g2b8.svg",
  },
];

export default function SneakPeekPage() {
  // Hero form removed. All early access signups now go through the early-access page only.

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section className="bg-(--color-brand-dark,#07402F) text-white py-24 px-4">
        <div className="container mx-auto max-w-3xl text-center">
          <Badge className="mb-6 bg-[#ADF434] text-[#07402F] font-semibold tracking-widest uppercase text-xs">
            Coming Soon
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold leading-tight mb-6">
            Nigerian real estate,{" "}
            <span className="text-[#ADF434]">finally fixed.</span>
          </h1>
          <p className="text-lg text-white/70 mb-10 leading-relaxed max-w-xl mx-auto">
            RealEST is building the first truly verified property marketplace in
            Nigeria — no fake listings, no ghost agents, no duplicates.
          </p>

          {/* Hero form removed. Only CTA below remains. */}
        </div>
      </section>

      {/* Features preview */}
      <section className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-12">
            <p className="text-xs font-bold tracking-widest uppercase text-muted-foreground mb-3">
              What we&apos;re building
            </p>
            <h2 className="text-3xl font-bold">
              Every problem in Nigerian real estate, solved.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div
                key={f.title}
                className="relative overflow-hidden bg-background rounded-xl border border-border p-6 hover:border-primary/40 transition-colors"
              >
                <img
                  src={f.illustration}
                  alt=""
                  aria-hidden="true"
                  className="pointer-events-none absolute right-3 top-3 h-14 w-14 object-contain opacity-70"
                  loading="lazy"
                />
                <f.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {f.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Teaser stats */}
      <section className="py-16 px-4 bg-background border-t border-border">
        <div className="container mx-auto max-w-3xl">
          <div className="grid grid-cols-3 gap-8 text-center">
            {[
              { value: "100%", label: "Verified Listings" },
              { value: "0", label: "Duplicate Listings" },
              { value: "24h", label: "Avg. Vetting Time" },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-4xl font-bold text-primary">{s.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-xl text-center">
          <Eye className="w-10 h-10 text-primary mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Want to see it first?</h2>
          <p className="text-muted-foreground mb-6">
            Join the waitlist and get exclusive first-access when we launch.
          </p>
          <Button asChild size="lg">
            <Link href="/early-access">
              Request Early Access
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
