import { prisma } from "@/lib/prisma";
import { requireAdminPage } from "@/lib/auth/require-admin-page";
import { notFound } from "next/navigation";
import { FieldCheckIn } from "@/components/realest/validation/FieldCheckIn";
import { nextCaseState } from "@/lib/trust/case";
import { readStoredVisit, setCaseState } from "@/lib/trust/visit-store";

export default async function FieldVisitPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const admin = await requireAdminPage();
  const property = await prisma.properties.findFirst({
    where: { id, status: "pending_vetting" },
    select: { id: true, address: true, city: true, state: true, title: true },
  });
  if (!property) notFound();
  const visit = await readStoredVisit(property.id);
  if (visit.officerId !== admin.userId) {
    return (
      <div className="mx-auto max-w-md px-4 py-8">
        <h1 className="font-heading text-2xl text-[#07402F]">This visit is assigned to another officer.</h1>
      </div>
    );
  }
  if (visit.caseState === "field_assigned") {
    await setCaseState(property.id, nextCaseState(visit.caseState, "start_field"));
  }
  const address = [property.address, property.city, property.state].filter(Boolean).join(", ");
  return <FieldCheckIn propertyId={property.id} address={`${property.title}. ${address}`} />;
}
