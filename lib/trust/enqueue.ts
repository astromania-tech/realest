import { enqueueValidationJob } from "@/lib/validation/validation-job-worker";
import { beginPrecheck } from "@/lib/trust/visit-store";

export async function enqueueTrustRead(propertyId: string, requestedBy?: string | null) {
  await beginPrecheck(propertyId);
  return enqueueValidationJob({
    propertyId,
    jobKind: "property",
    source: "trust-reader",
    requestPayload: { kind: "property", propertyId },
    requestedBy: requestedBy ?? null,
  });
}
