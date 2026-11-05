"use client";

import { Users2 } from "lucide-react";
import { BrandModalShell } from "@/components/realest/BrandModalShell";
import { FieldTeamPanel } from "@/components/realest/validation/FieldTeamPanel";

/**
 * Branded popup for assign-leader / confirm-team (Connect field ops).
 * Same form as the case Field visit panel; used from Field ops for quick action.
 */
export function FieldTeamManageModal({
  isOpen,
  onClose,
  propertyId,
  propertyTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  propertyId: string | null;
  propertyTitle?: string | null;
}) {
  if (!propertyId) return null;

  return (
    <BrandModalShell
      isOpen={isOpen}
      onClose={onClose}
      titleId="field-team-modal-title"
      descriptionId="field-team-modal-desc"
      maxWidthClass="max-w-xl"
    >
      <div className="space-y-4 pr-2 sm:pr-6">
        <div className="text-center sm:text-left">
          <div className="mx-auto mb-3 inline-flex h-14 w-14 items-center justify-center rounded-md bg-linear-to-tl from-primary/20 to-accent/20 sm:mx-0">
            <Users2 className="h-7 w-7 text-accent/80" />
          </div>
          <h2
            id="field-team-modal-title"
            className="text-2xl font-bold bg-linear-to-l from-primary to-accent bg-clip-text text-transparent"
          >
            Field team
          </h2>
          <p id="field-team-modal-desc" className="mt-1.5 break-words text-sm text-muted-foreground">
            {propertyTitle
              ? `Assign a leader and confirm who checks in for “${propertyTitle}”.`
              : "Assign a leader and confirm who checks in at the pin."}
          </p>
        </div>

        <FieldTeamPanel propertyId={propertyId} onCompleted={onClose} />
      </div>
    </BrandModalShell>
  );
}
