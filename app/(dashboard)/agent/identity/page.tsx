import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { YouverifyIdentityForm } from "@/components/realest/kyc/YouverifyIdentityForm";
import { personBadgeFromKyc, personKycReason } from "@/lib/kyc/person-badge";

export default async function AgentIdentityPage() {
  const {
    data: { user },
  } = await getAuthUser();
  if (!user) redirect("/login");

  const row = await prisma.users.findUnique({
    where: { id: user.id },
    select: { role: true },
  });
  if (row?.role !== "agent") redirect("/");

  const kycRows = await prisma.kyc_requests.findMany({
    where: { user_id: user.id, user_type: "agent" },
    select: { status: true, kyc_provider: true, user_type: true, rejection_reason: true },
    orderBy: { created_at: "desc" },
  });
  const badge = personBadgeFromKyc("agent", kycRows);
  const reason = personKycReason("agent", kycRows);

  return (
    <div className="container mx-auto max-w-xl px-4 py-8">
      <h1 className="text-3xl font-bold">Identity</h1>
      <p className="mt-2 mb-6 text-muted-foreground">
        Enter the company name on the CAC record, with the registration number. Youverify must return that same name.
      </p>
      <YouverifyIdentityForm role="agent" initialBadge={badge} initialReason={reason} />
    </div>
  );
}
