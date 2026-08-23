import { createClient, getAuthUser } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Header, Footer } from "@/components/layout"
import { HeroSection, ComingSoonHero } from "@/components/marketing"
import { FeaturedProperties } from "@/components/property"
import { getAppMode, shouldShowFullSite, shouldEnableAuthentication } from "@/lib/appMode"

export default async function HomePage() {
  const appMode = getAppMode()
  const showFullSite = shouldShowFullSite()
  const enableAuth = shouldEnableAuthentication()

  // Initialize user as null for coming-soon mode
  let user = null

  // Only fetch user data if authentication is enabled
  if (enableAuth) {
    const supabase = await createClient()
    const { data: userData } = await getAuthUser()
    user = userData.user

    // Redirect to dashboard if user is logged in and we're in full site mode
    // if (user && showFullSite) {
    //   const { data: profile } = await supabase.from("profiles").select("user_type").eq("id", user.id).single()

    //   if (profile?.user_type === "owner") {
    //     redirect("/owner")
    //   } else if (profile?.user_type === "admin") {
    //     redirect("/admin")
    //   }
    // }
  }

  // Branch-aware rendering: Show coming soon if not full site mode
  if (!showFullSite) {
    return <ComingSoonHero />
  }

  // Original full site rendering (for develop/staging/production after release)
  return (
    <div className="min-h-screen w-full bg-background">
      <Header />
      <HeroSection />
      <FeaturedProperties />
      <Footer />
    </div>
  )
}
