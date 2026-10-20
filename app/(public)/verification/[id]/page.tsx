import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { evidenceLines } from "@/lib/trust/case";
import { claimsBrief, type ClaimFinding } from "@/lib/trust/claims";
import { publicListingPath } from "@/lib/listings/public-listing";
import { VISIT_TITLE_STATEMENT } from "@/lib/trust/visit";
import { readPublicCase } from "@/lib/trust/visit-store";

export default async function VerificationRecordPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const property = await prisma.properties.findFirst({
    where: { id, status: "live", verification_status: "verified" },
    select: { id: true, title: true, address: true, city: true, listing_source: true },
  });
  if (!property) notFound();
  const record = await readPublicCase(property.id);
  const claims = record.claims as ClaimFinding[];
  return (
    <div className="mx-auto max-w-2xl bg-[#F8F9F7] px-4 py-10 text-[#2E322E]">
      <Link href={publicListingPath(property.id, property.listing_source)} className="text-sm text-[#07402F] underline">Back to the listing</Link>
      <h1 className="mt-4 font-heading text-3xl text-[#07402F]">Verification record</h1>
      <p className="mt-3">
        <span className="inline-flex items-center rounded-full bg-brand-accent px-3 py-1 text-xs font-medium text-[#07402F]" role="status">
          RealEST Verified
        </span>
      </p>
      <p className="mt-2">{property.title}</p>
      <p className="mt-4">{VISIT_TITLE_STATEMENT}</p>
      {record.judgment ? <p className="mt-4">{record.judgment}</p> : null}
      <p className="mt-2 text-sm">{claimsBrief(Array.isArray(claims) ? claims : [])}</p>
      <div className="mt-8 space-y-6">
        {record.evidence.map((item) => (
          <section key={`${item.layer}-${item.recordedAt}`} className="rounded-lg border border-[#07402F]/15 bg-white p-4">
            <h2 className="font-heading capitalize text-[#07402F]">{item.layer} evidence</h2>
            <p className="text-sm">{new Date(item.recordedAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })} Lagos</p>
            <ul className="mt-2 space-y-1 text-sm">
              {evidenceLines(item.layer, item.body).map((line) => (
                <li key={line.label}>{line.label}: {line.value}</li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
