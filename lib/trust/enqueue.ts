import { enqueueValidationJob } from "@/lib/validation/validation-job-worker";

export async function enqueueTrustRead(propertyId: string, requestedBy?: string | null) {
  return enqueueValidationJob({
    propertyId,
    jobKind: "property",
    source: "trust-reader",
    requestPayload: { kind: "property", propertyId },
    requestedBy: requestedBy ?? null,
  });
}
