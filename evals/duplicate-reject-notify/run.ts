import assert from "node:assert/strict";
import { buildDuplicateRejectOwnerNotify } from "../../lib/trust/duplicate-reject-notify.ts";
import { duplicateRejectAllowed } from "../../lib/trust/matches.ts";

const cases = [
  {
    id: "note-required-before-notify",
    ok: () => duplicateRejectAllowed("").ok === false,
  },
  {
    id: "owner-gets-reviewer-note",
    ok: () => {
      const payload = buildDuplicateRejectOwnerNotify({
        propertyId: "p1",
        propertyTitle: "Flat in Ikeja",
        propertyAddress: "5 Allen Avenue",
        city: "Ikeja",
        state: "Lagos",
        ownerProfileId: "u1",
        ownerName: "Tunde",
        ownerEmail: "tunde@example.ng",
        reviewerNotes: "Collides with live listing at 5 Allen Avenue.",
      });
      return (
        payload.notification.data.admin_notes.includes("5 Allen Avenue") &&
        payload.email.rejectionReason === "duplicate_listing" &&
        payload.email.rejectionDetail?.includes("Collides with live") === true
      );
    },
  },
  {
    id: "notify-targets-profile-not-owners-row",
    ok: () => {
      const payload = buildDuplicateRejectOwnerNotify({
        propertyId: "p2",
        propertyTitle: "Duplex",
        propertyAddress: "1 Road",
        city: "Abuja",
        state: "FCT",
        ownerProfileId: "profile-uuid",
        ownerName: null,
        ownerEmail: "a@b.ng",
        reviewerNotes: "Duplicate photo hash.",
      });
      return payload.notification.userId === "profile-uuid";
    },
  },
];

let failed = 0;
for (const item of cases) {
  if (!item.ok()) {
    failed += 1;
    console.error(`fail ${item.id}`);
  } else {
    console.log(`pass ${item.id}`);
  }
}

assert.equal(failed, 0);
console.log(`duplicate-reject-notify eval ${cases.length - failed}/${cases.length}`);
