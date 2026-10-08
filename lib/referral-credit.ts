export const REFERRAL_CREDIT_EVENT_TYPES = [
  "waitlist_referral_attributed",
  "registration_referral_attributed",
] as const;

export function isReferralCreditEvent(eventType: string | null | undefined): boolean {
  return REFERRAL_CREDIT_EVENT_TYPES.some((type) => type === eventType);
}

export function referralAlreadyCredited(
  events: Array<{ event_type?: string | null }>,
): boolean {
  return events.some((event) => isReferralCreditEvent(event.event_type));
}
