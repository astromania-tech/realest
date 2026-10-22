"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle, XCircle } from "lucide-react";

export function TrustReviewActions({
  propertyId,
  allowsVetting,
}: {
  propertyId: string;
  allowsVetting: boolean;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function send(action: "approve" | "reject" | "flag_duplicate") {
    if (action === "reject" && notes.trim().length < 12) {
      setError("Write a short note (at least 12 characters) explaining the reject. The owner will see a safe version.");
      return;
    }
    setPending(true);
    setError("");
    const response = await fetch(`/api/admin/validation/ml/${propertyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, admin_notes: notes }),
    });
    const body = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      const blocks = Array.isArray(body.hardBlocks) ? body.hardBlocks.join(", ") : "";
      setError(blocks ? `${body.error} ${blocks}` : body.error || "The gate refused this action.");
      return;
    }
    router.push(`/admin/validation/cases/${propertyId}`);
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Required to reject: short reason the owner can understand (no detector codes)."
        className="min-h-20"
      />
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button
          className="flex-1"
          variant="outline"
          disabled={pending || notes.trim().length < 12}
          onClick={() => send("reject")}
        >
          <XCircle className="w-4 h-4 mr-2" />
          Reject
        </Button>
        <Button className="flex-1" variant="outline" disabled={pending} onClick={() => send("flag_duplicate")}>
          Flag duplicate
        </Button>
      </div>
      <Button className="w-full bg-brand-accent text-[#07402F] hover:bg-brand-accent/90" disabled={pending || !allowsVetting} onClick={() => send("approve")}>
        <CheckCircle className="w-4 h-4 mr-2" />
        Send to physical vetting
      </Button>
    </div>
  );
}
