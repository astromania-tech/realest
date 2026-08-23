"use client";

import { useState } from "react";
import Link from "next/link";
import { Button, Input, Separator } from "../ui";
import {
  Mail,
  Phone,
  MapPin,
  Home,
  Building,
  TrendingUp,
  Calendar,
  Award,
  Users,
} from "lucide-react";
import { XIcon, FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from "@/lib/utils/icon";
import { FooterLogo } from "@/components/ui/RealEstLogo";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [subscribeError, setSubscribeError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) {
      setSubscribeError("Please enter a valid email address.");
      return;
    }
    // Derive a first name from the email local part so the API is satisfied
    const rawLocal = email.split("@")[0];
    const firstName =
      rawLocal.split(/[._+\-]/)[0].replace(/\d+$/, "") || "Subscriber";
    const capitalized = firstName.charAt(0).toUpperCase() + firstName.slice(1);

    setLoading(true);
    setSubscribeError(null);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          firstName: capitalized,
          source: "footer_newsletter",
        }),
      });
      const json = await res.json();
      if (res.ok || json.isExistingUser) {
        setSuccess(true);
        setEmail("");
      } else {
        setSubscribeError(json.error ?? "Subscription failed. Please try again.");
      }
    } catch {
      setSubscribeError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const footerLinks = {
    company: [
      { href: "/about", label: "About RealEST" },
      { href: "/how-it-works", label: "How It Works" },
      { href: "/careers", label: "Careers" },
      { href: "/press", label: "Press & Media" },
    ],
    services: [
      { href: "/buy", label: "Buy Property", icon: Home },
      { href: "/rent", label: "Rent Property", icon: TrendingUp },
      { href: "/sell", label: "Sell Property", icon: Building },
      { href: "/events", label: "Event Centers", icon: Calendar },
    ],
    support: [
      { href: "/help", label: "Help Center" },
      { href: "/contact", label: "Contact Us" },
      { href: "/verification", label: "Property Verification" },
      { href: "/safety", label: "Safety Guidelines" },
    ],
    legal: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cookies", label: "Cookie Policy" },
      { href: "/disclaimer", label: "Disclaimer" },
    ],
  };

  const socialLinks = [
    { href: "https://x.com/realestconnect", icon: XIcon, label: "X" },
    { href: "#", icon: FacebookIcon, label: "Facebook" },
    { href: "https://www.instagram.com/realest.connect", icon: InstagramIcon, label: "Instagram" },
    { href: "#", icon: LinkedInIcon, label: "LinkedIn" },
    { href: "#", icon: YouTubeIcon, label: "YouTube" },
  ];

  return (
    <footer className="bg-background border-t border-border/50">
      {/* Newsletter Section */}
      <div className="border-b border-border/50 bg-muted/30">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Updated</h3>
            <p className="text-muted-foreground mb-6">
              Get the latest property listings and market insights delivered to
              your inbox.
            </p>
            {success ? (
              <p className="text-sm text-green-600 font-medium">
                You&apos;re on the list! We&apos;ll be in touch soon.
              </p>
            ) : (
              <>
                <div className="flex gap-2 max-w-md mx-auto items-center">
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 ml-2"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSubscribe()}
                    disabled={loading}
                  />
                  <Button
                    variant="default"
                    className="cursor-pointer rounded-md"
                    onClick={handleSubscribe}
                    disabled={loading}
                  >
                    {loading ? "Subscribing…" : "Subscribe"}
                  </Button>
                </div>
                {subscribeError && (
                  <p className="text-sm text-destructive mt-2">{subscribeError}</p>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <Link href="/" className="mb-4 inline-block">
              <FooterLogo />
            </Link>
            <p className="text-muted-foreground mb-6 leading-relaxed">
              The most trusted platform for verified property listings. No
              duplicates, only authentic properties with complete verification.
            </p>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span>Verified Listings</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <span>50K+ Users</span>
              </div>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    <link.icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-muted-foreground hover:text-primary transition-colors text-sm"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Mail className="w-4 h-4" />
                <span>hello@realest.ng</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                <Phone className="w-4 h-4" />
                <span>+234 (815) 443-6595</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground text-sm">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>
                  RealEST Marketplace
                  <br />
                  Nigeria, 569101
                </span>
              </div>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Legal Links */}
          <div className="flex flex-wrap gap-6 text-sm">
            {footerLinks.legal.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground mr-2">
              Follow us:
            </span>
            {socialLinks.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                className="text-muted-foreground hover:text-primary transition-colors p-2 hover:bg-primary/10 rounded-lg"
                aria-label={social.label}
              >
                <social.icon className="w-5 h-5" />
              </Link>
            ))}
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-border/50 mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} RealEST. All rights reserved. Built with ❤️ for
            verified property listings.
          </p>
        </div>
      </div>
    </footer>
  );
}
