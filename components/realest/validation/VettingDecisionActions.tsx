"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";

type Officer = { id: string; full_name: string | null };
type ListingFile = { id: string; document_type: string; file_name: string };

export function VettingDecisionActions({
  propertyId,
  officers,
  assignedOfficerId,
  visitDay,
  documents,
  canApprove,
  blockReason,
  conflicts,
  openIssue,
  registryReference,
  registryMatches,
}: {
  propertyId: string;
  officers: Officer[];
  assignedOfficerId: string | null;
  visitDay: string | null;
  documents: ListingFile[];
  canApprove: boolean;
  blockReason: string | null;
  conflicts: string[];
  openIssue: string | null;
  registryReference: string | null;
  registryMatches: boolean | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [issue, setIssue] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [officerId, setOfficerId] = useState(assignedOfficerId ?? "");
  const [day, setDay] = useState(visitDay ?? "");
  const [documentId, setDocumentId] = useState(documents[0]?.id ?? "");
  const [registryFile, setRegistryFile] = useState(registryReference ?? "");
  const assigned = Boolean(assignedOfficerId && visitDay);

  async function send(
    action: "approve" | "reject" | "assign" | "flag_issue" | "request_correction" | "confirm_registry",
    extra: Record<string, unknown> = {},
  ) {
    if (action === "reject") {
      const rejectNote = [notes, issue].filter((part) => part.trim()).join(" ").trim();
      if (rejectNote.length < 12) {
        setError("Write a short note (at least 12 characters) explaining the reject. The owner will see a safe version.");
        return;
      }
    }
    setPending(true);
    setError("");
    const response = await fetch(`/api/admin/validation/vetting/${propertyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action,
        notes,
        rejection_reason: action === "reject" ? "other" : undefined,
        officer_id: action === "assign" ? officerId : undefined,
        visit_day: action === "assign" ? day : undefined,
        issue_details: action === "flag_issue" || action === "request_correction" ? issue : undefined,
        document_id: action === "request_correction" ? documentId : undefined,
        ...extra,
      }),
    });
    const body = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(body.error || "The vetting action was refused.");
      return;
    }
    if (action === "assign" || action === "flag_issue" || action === "confirm_registry") {
      router.refresh();
      return;
    }
    router.push(`/admin/validation/cases/${propertyId}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm" htmlFor="vetting-officer">Officer</label>
        <select
          id="vetting-officer"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={officerId}
          onChange={(event) => setOfficerId(event.target.value)}
        >
          <option value="">Choose an officer</option>
          {officers.map((officer) => (
            <option key={officer.id} value={officer.id}>
              {officer.full_name || "Admin"}
            </option>
          ))}
        </select>
        <label className="text-sm" htmlFor="vetting-day">Visit day</label>
        <input
          id="vetting-day"
          type="date"
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          value={day}
          onChange={(event) => setDay(event.target.value)}
        />
        <Button className="w-full" variant="outline" disabled={pending} onClick={() => send("assign")}>
          Assign this visit
        </Button>
      </div>
      <div className="space-y-2">
        <p className="text-sm">The assigned officer checks in on their phone. Typed coordinates stay closed.</p>
        <Link href={`/field/visit/${propertyId}`} className="inline-flex w-full justify-center rounded-md border px-3 py-2 text-sm">
          Open the phone check-in
        </Link>
        {conflicts.map((conflict) => <p key={conflict} className="text-sm text-destructive">{conflict}</p>)}
      </div>
      <div className="space-y-2">
        <p className="text-sm">Registry file. A person checks this. A registry URL is not called.</p>
        {registryReference ? (
          <p className="text-sm">
            Saved file {registryReference}. {registryMatches === true ? "It matches the listing." : registryMatches === false ? "It does not match the listing." : "The match has not been recorded."}
          </p>
        ) : null}
        <input
          className="w-full rounded-md border bg-background px-3 py-2 text-sm font-heading"
          placeholder="Registry file number"
          value={registryFile}
          onChange={(event) => setRegistryFile(event.target.value)}
        />
        <div className="flex gap-2">
          <Button
            className="flex-1"
            variant="outline"
            disabled={pending || registryFile.trim().length < 3}
            onClick={() => send("confirm_registry", { registry_reference: registryFile, registry_matches: true })}
          >
            File matches
          </Button>
          <Button
            className="flex-1"
            variant="outline"
            disabled={pending || registryFile.trim().length < 3}
            onClick={() => send("confirm_registry", { registry_reference: registryFile, registry_matches: false })}
          >
            File does not match
          </Button>
        </div>
      </div>
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Visit notes. Required to reject: short reason the owner can understand."
        className="min-h-20"
      />
      <Textarea
        value={issue}
        onChange={(event) => setIssue(event.target.value)}
        placeholder="The issue that blocks the badge."
        className="min-h-16"
      />
      {openIssue ? <p className="text-sm">Open issue: {openIssue}</p> : null}
      <Button className="w-full" variant="outline" disabled={pending || !issue.trim()} onClick={() => send("flag_issue")}>
        Flag this issue
      </Button>
      <label className="text-sm" htmlFor="correction-file">File to send back</label>
      <select id="correction-file" className="w-full rounded-md border bg-background px-3 py-2 text-sm" value={documentId} onChange={(event) => setDocumentId(event.target.value)}>
        {documents.map((document) => (
          <option key={document.id} value={document.id}>{document.document_type}: {document.file_name}</option>
        ))}
      </select>
      <Button className="w-full" variant="outline" disabled={pending || !documentId} onClick={() => send("request_correction")}>
        Send this file back
      </Button>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          variant="outline"
          disabled={pending || [notes, issue].filter((part) => part.trim()).join(" ").trim().length < 12}
          onClick={() => send("reject")}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Reject listing
        </Button>
        <Button className="flex-1 bg-brand-accent text-[#07402F] hover:bg-brand-accent/90" disabled={pending || !canApprove} onClick={() => send("approve")}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve visit
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {canApprove
          ? "Approve is the only action that sets the listing live and RealEST Verified. The visit does not prove title."
          : blockReason || "Assign one officer and a visit day. Approve stays closed until the check-in is saved."}
      </p>
    </div>
  );
}
