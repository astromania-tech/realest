import Link from "next/link";

export function VisitRecordNote({
  propertyId,
  record,
}: {
  propertyId: string;
  record?: {
    visitedAt: string | null;
    checked: string[];
    statement: string;
  } | null;
}) {
  if (!record) return null;
  const when = record.visitedAt
    ? new Date(record.visitedAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })
    : null;
  return (
    <div className="mt-3 max-w-xl text-sm text-[#2E322E]">
      <span className="inline-flex items-center rounded-full bg-brand-accent px-3 py-1 text-xs font-medium text-[#07402F]" role="status">
        RealEST Verified
      </span>
      <p className="mt-2">{record.statement}</p>
      {record.checked.length > 0 ? <p>Checked: {record.checked.join(", ")}.</p> : null}
      {when ? <p>Officer check-in: {when} (Lagos).</p> : null}
      <Link href={`/verification/${propertyId}`} className="mt-2 inline-block underline">
        Open the verification record
      </Link>
    </div>
  );
}
