"use client";

import { Shield } from "lucide-react";
import { BrandModalShell } from "@/components/realest/BrandModalShell";
import { Button } from "@/components/ui/button";
import { STAFF_PERMISSION_DENIED_MESSAGE } from "@/lib/auth/staff-permission-ui";

export function StaffPermissionModal({
  open,
  onClose,
  message,
}: {
  open: boolean;
  onClose: () => void;
  message?: string | null;
}) {
  const body = message?.trim() || STAFF_PERMISSION_DENIED_MESSAGE;

  return (
    <BrandModalShell
      isOpen={open}
      onClose={onClose}
      titleId="staff-permission-modal-title"
      descriptionId="staff-permission-modal-desc"
      maxWidthClass="max-w-md"
    >
      <div className="space-y-5 text-center">
        <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-md bg-primary/10">
          <Shield className="h-7 w-7 text-primary" />
        </div>
        <div className="space-y-2">
          <h2
            id="staff-permission-modal-title"
            className="text-xl font-bold text-foreground"
          >
            Permission needed
          </h2>
          <p
            id="staff-permission-modal-desc"
            className="text-sm text-muted-foreground"
          >
            {body}
          </p>
        </div>
        <Button type="button" className="w-full" onClick={onClose}>
          Got it
        </Button>
      </div>
    </BrandModalShell>
  );
}
