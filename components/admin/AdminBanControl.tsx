"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/** Ban or unban. Render this only on admin screens. */
export function AdminBanControl({
  userId,
  isActive,
  fullWidth = false,
}: {
  userId: string;
  isActive: boolean;
  fullWidth?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const action = isActive ? "ban" : "unban";
  const label = isActive ? "Ban" : "Unban";

  async function submit(event: FormEvent) {
    event.preventDefault();
    const note = reason.trim();
    if (note.length < 10) {
      setError("Write a reason of at least 10 characters.");
      return;
    }
    setPending(true);
    setError("");
    const response = await fetch(`/api/admin/users/${userId}/suspend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, reason: note }),
    });
    const body = await response.json().catch(() => ({}));
    setPending(false);
    if (!response.ok) {
      setError(body.error || "The account could not be updated.");
      return;
    }
    setOpen(false);
    setReason("");
    router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        size={fullWidth ? "default" : "sm"}
        variant={isActive ? "destructive" : "outline"}
        className={fullWidth ? "w-full" : ""}
        onClick={() => {
          setError("");
          setOpen(true);
        }}
      >
        {fullWidth ? `${label} user` : label}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{label} this account</DialogTitle>
            <DialogDescription>
              {isActive
                ? "They lose staff access. The account stays so past actions still show their name. Open visits are released."
                : "They can sign in to staff tools again. Past actions stay on the record."}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <label className="text-sm font-medium" htmlFor={`ban-reason-${userId}`}>
              Reason
            </label>
            <Textarea
              id={`ban-reason-${userId}`}
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              placeholder="Why this account is banned or restored"
              className="min-h-24"
            />
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
                {pending ? "Saving" : label}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
