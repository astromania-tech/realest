import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { toOwnerListingCard } from "@/lib/listings/owner-listings";
import { OwnerListingsClient } from "@/components/dashboard/OwnerListingsClient";

export default async function OwnerListingsPage() {
  const {
    data: { user },
  } = await getAuthUser();
  if (!user) {
    redirect("/login?redirect=/owner/listings");
  }

  const userRow = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (userRow?.role !== "owner") {
    redirect("/");
  }

  const owner = await prisma.owners.findUnique({
    where: { profile_id: user.id },
    select: { id: true },
  });
  if (!owner) {
    redirect("/onboarding");
  }

  const rows = await prisma.properties.findMany({
    where: { owner_id: owner.id },
    select: {
      id: true,
      title: true,
      address: true,
      city: true,
      property_type: true,
      listing_type: true,
      price_frequency: true,
      price: true,
      status: true,
      verification_status: true,
      _count: {
        select: {
          inquiries: true,
          property_media: true,
          property_documents: true,
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  return <OwnerListingsClient properties={rows.map(toOwnerListingCard)} />;
}
