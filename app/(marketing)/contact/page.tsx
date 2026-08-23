"use client";

import { useState } from "react";
import { Input } from "@heroui/react";
import { Button, Textarea, Card, CardContent } from "@/components/ui";
import { Header, Footer } from "@/components/layout";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  MessageSquare,
  Sparkles,
  CheckCircle,
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setIsSubmitted(true);
    setIsSubmitting(false);
    setFormData({ name: "", email: "", subject: "", message: "" });

    // Reset success message after 5 seconds
    setTimeout(() => setIsSubmitted(false), 5000);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const contactMethods = [
    {
      icon: Mail,
      title: "Email Us",
      description: "Send us an email and we'll respond within 24 hours",
      contact: "hello@realest.ng",
      action: "mailto:hello@realest.ng",
    },
    {
      icon: Phone,
      title: "Call Us",
      description: "Speak directly with our support team",
      contact: "+1 (555) 123-4567",
      action: "tel:+15551234567",
    },
    {
      icon: MessageSquare,
      title: "Live Chat",
      description: "Chat with us instantly during business hours",
      contact: "Available 9 AM - 6 PM EST",
      action: "#",
    },
  ];

  const officeInfo = {
    address: "123 Property Street, Real Estate City, RC 12345",
    phone: "+1 (555) 123-4567",
    email: "hello@realest.ng",
    hours: "Monday - Friday: 9:00 AM - 6:00 PM EST",
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-linear-to-br from-primary/10 via-primary/5 to-secondary/20" />
        <div className="absolute inset-0 bg-linear-to-t from-background via-background/50 to-transparent" />

        {/* Floating Elements */}
        <div className="absolute top-10 right-10 w-16 h-16 bg-primary/10 rounded-full blur-xl animate-pulse" />
        <div className="absolute bottom-10 left-10 w-20 h-20 bg-secondary/10 rounded-full blur-xl animate-pulse delay-500" />

        <div className="relative z-10 container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
              <MessageSquare className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-primary">
                Contact Us
              </span>
            </div>

            {/* Main Heading */}
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-linear-to-r from-foreground via-foreground to-primary bg-clip-text text-transparent leading-tight">
              Get in Touch
              <br />
              <span className="text-primary">We're Here to Help</span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed">
              Have questions about our platform? Need help with your property
              listing? Our team is ready to assist you.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Contact Methods
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Choose the best way to reach us. We're here to help with any
              questions or concerns.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {contactMethods.map((method, index) => (
              <Card
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6 text-center hover:shadow-lg transition-shadow cursor-pointer group"
                onClick={() => {
                  if (
                    method.action.startsWith("mailto:") ||
                    method.action.startsWith("tel:")
                  ) {
                    window.location.href = method.action;
                  }
                }}
              >
                <CardContent className="space-y-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mx-auto group-hover:bg-primary/20 transition-colors">
                    <method.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-lg">{method.title}</h3>
                  <p className="text-muted-foreground text-sm">
                    {method.description}
                  </p>
                  <div className="font-medium text-primary">
                    {method.contact}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Send us a Message</h2>
              <p className="text-muted-foreground mb-8">
                Fill out the form below and we'll get back to you as soon as
                possible.
              </p>

              {isSubmitted ? (
                <Card className="bg-green-50 border border-green-200 rounded-2xl p-6">
                  <CardContent className="text-center space-y-4">
                    <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
                    <h3 className="text-lg font-semibold text-green-800">
                      Message Sent Successfully!
                    </h3>
                    <p className="text-green-700">
                      Thank you for contacting us. We'll respond to your message
                      within 24 hours.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <Card className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6">
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Full Name *
                          </label>
                          <Input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Your full name"
                            required
                            className="w-full"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium mb-2 block">
                            Email Address *
                          </label>
                          <Input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="your@email.com"
                            required
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Subject *
                        </label>
                        <Input
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          placeholder="What's this about?"
                          required
                          className="w-full"
                        />
                      </div>

                      <div>
                        <label className="text-sm font-medium mb-2 block">
                          Message *
                        </label>
                        <Textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          placeholder="Tell us how we can help you..."
                          required
                          className="w-full min-h-32"
                        />
                      </div>

                      <Button
                        type="submit"
                        size="lg"
                        className="w-full bg-primary hover:bg-primary/90"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          "Sending..."
                        ) : (
                          <>
                            <Send className="w-5 h-5 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Office Information */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Visit Our Office</h2>
              <p className="text-muted-foreground mb-8">
                Prefer to meet in person? Visit our office during business
                hours.
              </p>

              <div className="space-y-6">
                <Card className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6">
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <MapPin className="w-6 h-6 text-primary mt-1 shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Address</h3>
                        <p className="text-muted-foreground">
                          {officeInfo.address}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6">
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Phone className="w-6 h-6 text-primary mt-1 shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Phone</h3>
                        <p className="text-muted-foreground">
                          {officeInfo.phone}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6">
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Mail className="w-6 h-6 text-primary mt-1 shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Email</h3>
                        <p className="text-muted-foreground">
                          {officeInfo.email}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6">
                  <CardContent className="space-y-4">
                    <div className="flex items-start gap-4">
                      <Clock className="w-6 h-6 text-primary mt-1 shrink-0" />
                      <div>
                        <h3 className="font-semibold mb-1">Business Hours</h3>
                        <p className="text-muted-foreground">
                          {officeInfo.hours}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Quick answers to common questions about RealEST
            </p>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                question: "How does property verification work?",
                answer:
                  "Our team conducts thorough verification including document checks, property inspections, and owner confirmation to ensure every listing is legitimate.",
              },
              {
                question: "Is there a fee for listing my property?",
                answer:
                  "Basic listings are free. Premium features and advertising options are available for a fee. Contact us for detailed pricing.",
              },
              {
                question: "How quickly can I expect a response?",
                answer:
                  "We typically respond to all inquiries within 24 hours during business days. For urgent property-related matters, we aim to respond within 4 hours.",
              },
            ].map((faq, index) => (
              <Card
                key={index}
                className="bg-background/80 backdrop-blur-lg border border-border/50 rounded-2xl p-6"
              >
                <CardContent>
                  <h3 className="font-semibold text-lg mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
