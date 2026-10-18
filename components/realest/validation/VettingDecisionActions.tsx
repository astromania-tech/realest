"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";

type Officer = { id: string; full_name: string | null };

export function VettingDecisionActions({
  propertyId,
  officers,
  assignedOfficerId,
  visitDay,
}: {
  propertyId: string;
  officers: Officer[];
  assignedOfficerId: string | null;
  visitDay: string | null;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [officerId, setOfficerId] = useState(assignedOfficerId ?? "");
  const [day, setDay] = useState(visitDay ?? "");
  const assigned = Boolean(assignedOfficerId && visitDay);

  async function send(action: "approve" | "reject" | "assign") {
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
      }),
    });
    const body = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(body.error || "The vetting action was refused.");
      return;
    }
    if (action === "assign") {
      router.refresh();
      return;
    }
    router.push("/admin/validation/vetting");
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
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="What the visit confirmed."
        className="min-h-20"
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <div className="flex gap-2">
        <Button className="flex-1" variant="outline" disabled={pending} onClick={() => send("reject")}>
          <XCircle className="w-4 h-4 mr-2" />
          Reject listing
        </Button>
        <Button className="flex-1" disabled={pending || !assigned} onClick={() => send("approve")}>
          <CheckCircle className="w-4 h-4 mr-2" />
          Approve visit
        </Button>
      </div>
      <p className="text-sm text-muted-foreground">
        {assigned
          ? "Approve is the only action that sets the listing live and RealEST Verified."
          : "Assign one officer and a visit day. Approve stays closed until that assignment is saved."}
      </p>
    </div>
  );
}
