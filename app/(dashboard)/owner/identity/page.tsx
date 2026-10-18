import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { YouverifyIdentityForm } from "@/components/realest/kyc/YouverifyIdentityForm";
import { personBadgeFromKyc, personKycReason } from "@/lib/kyc/person-badge";

export default async function OwnerIdentityPage() {
  const {
    data: { user },
  } = await getAuthUser();
  if (!user) redirect("/login");

  const row = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (row?.role !== "owner") redirect("/");

  const kycRows = await prisma.kyc_requests.findMany({
    where: { user_id: user.id, user_type: "owner" },
    select: { status: true, kyc_provider: true, user_type: true, rejection_reason: true },
    orderBy: { created_at: "desc" },
  });
  const badge = personBadgeFromKyc("owner", kycRows);
  const reason = personKycReason("owner", kycRows);

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold">Identity</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Youverify checks a NIN or BVN. A draft stays blocked until that check is approved.
      </p>
      <YouverifyIdentityForm role="owner" initialBadge={badge} initialReason={reason} />
    </div>
  );
}
