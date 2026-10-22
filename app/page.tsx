import { Header, Footer } from "@/components/layout"
import { HeroSection, ComingSoonHero, MarketingTrackingScripts } from "@/components/marketing"
import { FeaturedProperties } from "@/components/property"
import { shouldShowFullSite } from "@/lib/appMode"

export default async function HomePage() {
  const showFullSite = shouldShowFullSite()

  // Branch-aware rendering: Show coming soon if not full site mode
  if (!showFullSite) {
    return (
      <>
        <MarketingTrackingScripts />
        <ComingSoonHero />
      </>
    )
  }

  // Original full site rendering (for develop/staging/production after release)
  return (
    <div className="min-h-screen w-full bg-background">
      <MarketingTrackingScripts />
      <Header />
      <HeroSection />
      <FeaturedProperties />
      <Footer />
    </div>
  )
}
