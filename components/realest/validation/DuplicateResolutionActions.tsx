"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { XCircle } from "lucide-react";

export function DuplicateResolutionActions({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function reject() {
    setPending(true);
    setError("");
    const response = await fetch(`/api/admin/validation/duplicates/${propertyId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reject", admin_notes: notes }),
    });
    const body = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(body.error || "The duplicate gate refused this action.");
      return;
    }
    router.push("/admin/validation?filter=duplicates");
    router.refresh();
  }

  return (
    <div className="space-y-4">
      <Textarea
        value={notes}
        onChange={(event) => setNotes(event.target.value)}
        placeholder="Name the listing this collides with. A note is required."
        className="min-h-24"
      />
      {error ? <p className="text-sm text-red-700">{error}</p> : null}
      <Button className="w-full" variant="outline" disabled={pending} onClick={reject}>
        <XCircle className="w-4 h-4 mr-2" />
        Reject as a duplicate
      </Button>
      <p className="text-sm text-muted-foreground">
        This does not set RealEST Verified. A hard duplicate block cannot be sent to a field visit.
      </p>
    </div>
  );
}
