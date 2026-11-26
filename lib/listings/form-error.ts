import { LISTING_KYC_ERROR } from "@/lib/kyc/gate";

export function listingFormError(responseOk: boolean, body: unknown, fallback: string): string | null {
  if (responseOk) return null;
  if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
    const message = body.error.trim();
    if (message) return message;
  }
  return fallback;
}

export function listingFormErrorTitle(message: string): string {
  return message === LISTING_KYC_ERROR ? "Identity approval required" : "Could not save the listing";
}

export function propertyIdFromSaveResponse(body: unknown, existingId?: string): string | null {
  if (existingId) return existingId;
  if (!body || typeof body !== "object") return null;
  const property = (body as { property?: unknown }).property;
  if (!property || typeof property !== "object") return null;
  const id = (property as { id?: unknown }).id;
  return typeof id === "string" && id.length > 0 ? id : null;
}
