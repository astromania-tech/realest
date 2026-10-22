import { loadMarketplaceListings } from "@/lib/listings/load-marketplace-listings";
import BuyPageClient from "./BuyPageClient";

export default async function BuyPage() {
  const properties = await loadMarketplaceListings({
    listingType: "for_sale",
    take: 12,
  });
  return <BuyPageClient initialProperties={properties} />;
}
