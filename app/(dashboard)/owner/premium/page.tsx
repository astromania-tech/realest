import { createClient, getAuthUser } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Header, Footer } from "@/components/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Star, TrendingUp, Shield, BarChart3 } from "lucide-react";

export default async function PremiumPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await getAuthUser();

  if (!user) {
    redirect("/login");
  }

  // Check if user is a property owner
  const { data: userRow } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (userRow?.role !== "owner") {
    redirect("/");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("is_premium")
    .eq("id", user.id)
    .single();

  const isPremium = profile?.is_premium || false;

  const premiumFeatures = [
    "Advanced analytics dashboard",
    "Priority customer support",
    "Featured property listings",
    "Unlimited property uploads",
    "Detailed inquiry insights",
    "Marketing tools and templates",
    "Verified badge on listings",
    "Early access to new features",
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container py-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Upgrade to Premium</h1>
          <p className="text-muted-foreground">
            Unlock advanced features to grow your property business
          </p>
          {isPremium && (
            <Badge className="mt-4 bg-green-600">
              <Star className="w-4 h-4 mr-1" />
              Premium Member
            </Badge>
          )}
        </div>

        <div className="max-w-2xl mx-auto">
          <Card className="relative overflow-hidden">
            {!isPremium && (
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground">
                  Most Popular
                </Badge>
              </div>
            )}
            <CardHeader className="text-center pb-8">
              <CardTitle className="text-2xl mb-2">Premium Plan</CardTitle>
              <div className="text-4xl font-bold mb-2">
                ₦9,999
                <span className="text-lg font-normal">/month</span>
              </div>
              <p className="text-muted-foreground">
                Cancel anytime, no setup fees
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  What's included:
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {premiumFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-600 shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Grow Faster</p>
                    <p className="text-xs text-muted-foreground">
                      Advanced marketing tools
                    </p>
                  </div>
                  <div>
                    <BarChart3 className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Data Insights</p>
                    <p className="text-xs text-muted-foreground">
                      Detailed analytics
                    </p>
                  </div>
                  <div>
                    <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
                    <p className="text-sm font-medium">Verified Trust</p>
                    <p className="text-xs text-muted-foreground">
                      Build credibility
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-6">
                {isPremium ? (
                  <div className="text-center">
                    <p className="text-green-600 font-medium mb-4">
                      You're already a premium member!
                    </p>
                    <Button variant="outline" className="w-full">
                      Manage Subscription
                    </Button>
                  </div>
                ) : (
                  <Button className="w-full" size="lg">
                    Upgrade to Premium
                  </Button>
                )}
                <p className="text-xs text-muted-foreground text-center mt-4">
                  Secure payment powered by Flutterwave. 30-day money-back
                  guarantee.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
