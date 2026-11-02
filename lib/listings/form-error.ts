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
