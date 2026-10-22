import { loadMarketplaceListings } from "@/lib/listings/load-marketplace-listings";
import RentPageClient from "./RentPageClient";

export default async function RentPage() {
  const properties = await loadMarketplaceListings({
    listingType: "for_rent",
    take: 12,
  });
  return <RentPageClient initialProperties={properties} />;
}
