/**
 * Email template barrel export
 *
 * Import everything you need from '@/emails':
 *
 *   import { WelcomeEmail, renderEmail } from '@/emails'
 */

// ── Layouts ───────────────────────────────────────────────────────────────────
export { EmailLayout } from './layouts/EmailLayout';

// ── Reusable components ───────────────────────────────────────────────────────
export { EmailHeader }    from './components/EmailHeader';
export { EmailFooter }    from './components/EmailFooter';
export { EmailButton }    from './components/EmailButton';
export { EmailAlert }     from './components/EmailAlert';
export {
  EmailSection,
  EmailDivider,
  EmailDetailRow,
  EmailHeading,
  EmailText,
  OtpBlock,
  VerifiedBadge,
} from './components/EmailUI';

// ── Templates ─────────────────────────────────────────────────────────────────

// Platform
export { WaitlistConfirmationEmail }  from './templates/platform/WaitlistConfirmationEmail';
export { AdminNotificationEmail }     from './templates/platform/AdminNotificationEmail';
export { PasswordResetEmail }         from './templates/platform/PasswordResetEmail';
export { WelcomeEmail }               from './templates/platform/WelcomeEmail';
export { OnboardingReminderEmail }    from './templates/platform/OnboardingReminderEmail';
export { PasswordChangedEmail }       from './templates/platform/PasswordChangedEmail';
export { InquiryNotificationEmail }   from './templates/platform/InquiryNotificationEmail';
export { SubAdminInvitationEmail }    from './templates/platform/SubAdminInvitationEmail';
export { VerificationEmail }          from './templates/platform/VerificationEmail';

// Listing lifecycle
export { ListingSubmissionEmail }     from './templates/listing/ListingSubmissionEmail';
export { MLValidationPassedEmail }    from './templates/listing/MLValidationPassedEmail';
export { MLValidationActionEmail }    from './templates/listing/MLValidationActionEmail';
export { VettingAppointmentEmail }    from './templates/listing/VettingAppointmentEmail';
export { ListingLiveEmail }           from './templates/listing/ListingLiveEmail';
export { ListingRejectedEmail }       from './templates/listing/ListingRejectedEmail';

// Engagement
export { InquirySentEmail }           from './templates/engagement/InquirySentEmail';
export { ViewingReminderEmail }       from './templates/engagement/ViewingReminderEmail';
export { PriceDropAlertEmail }        from './templates/engagement/PriceDropAlertEmail';

// Financial
export { InvoiceEmail }               from './templates/financial/InvoiceEmail';
export { PaymentReceiptEmail }        from './templates/financial/PaymentReceiptEmail';
export { ListingRenewalEmail }        from './templates/financial/ListingRenewalEmail';
export { PaymentFailedEmail }         from './templates/financial/PaymentFailedEmail';

// Security & admin
export { LoginAlertEmail }            from './templates/security/LoginAlertEmail';
export { VettingTaskEmail }           from './templates/security/VettingTaskEmail';

// Marketing
export { WeeklyDigestEmail }          from './templates/marketing/WeeklyDigestEmail';
export { FrontierReengagementEmail }  from './templates/marketing/FrontierReengagementEmail';
export { AuthorityGeotagEmail }       from './templates/marketing/AuthorityGeotagEmail';
export { AuthorityBootsGroundEmail }  from './templates/marketing/AuthorityBootsGroundEmail';
export { LaunchWindowEmail }          from './templates/marketing/LaunchWindowEmail';
export { SystemUpdateEmail }          from './templates/marketing/SystemUpdateEmail';
export { WaitlistMilestoneEmail }     from './templates/marketing/WaitlistMilestoneEmail';
export { AgentVsLandlordEmail }       from './templates/marketing/AgentVsLandlordEmail';
export { PropertyCategoriesEmail }    from './templates/marketing/PropertyCategoriesEmail';
export { LaunchEveEmail }             from './templates/marketing/LaunchEveEmail';
export { ReferralInviteEmail }        from './templates/marketing/ReferralInviteEmail';
export { ReferralSuccessEmail }       from './templates/marketing/ReferralSuccessEmail';
export { PollResultsSummaryEmail }    from './templates/marketing/PollResultsSummaryEmail';

// ── Data types ────────────────────────────────────────────────────────────────

// Platform
export type { WaitlistEmailData }           from './templates/platform/WaitlistConfirmationEmail';
export type { AdminNotificationData }       from './templates/platform/AdminNotificationEmail';
export type { PasswordResetEmailData, OtpVerificationType } from './templates/platform/PasswordResetEmail';
export type { WelcomeEmailData, OnboardingUserType }        from './templates/platform/WelcomeEmail';
export type { OnboardingReminderEmailData } from './templates/platform/OnboardingReminderEmail';
export type { PasswordChangedEmailData }    from './templates/platform/PasswordChangedEmail';
export type { InquiryEmailData }            from './templates/platform/InquiryNotificationEmail';
export type { SubAdminInvitationData }      from './templates/platform/SubAdminInvitationEmail';
export type { VerificationEmailData }       from './templates/platform/VerificationEmail';

// Listing lifecycle
export type { ListingSubmissionEmailData }  from './templates/listing/ListingSubmissionEmail';
export type { MLValidationPassedEmailData } from './templates/listing/MLValidationPassedEmail';
export type { MLValidationActionEmailData, MLFlagReason } from './templates/listing/MLValidationActionEmail';
export type { VettingAppointmentEmailData } from './templates/listing/VettingAppointmentEmail';
export type { ListingLiveEmailData }        from './templates/listing/ListingLiveEmail';
export type { ListingRejectedEmailData, RejectionReason } from './templates/listing/ListingRejectedEmail';

// Engagement
export type { InquirySentEmailData }        from './templates/engagement/InquirySentEmail';
export type { ViewingReminderEmailData }    from './templates/engagement/ViewingReminderEmail';
export type { PriceDropAlertEmailData }     from './templates/engagement/PriceDropAlertEmail';

// Financial
export type { InvoiceEmailData }                    from './templates/financial/InvoiceEmail';
export type { PaymentReceiptEmailData }     from './templates/financial/PaymentReceiptEmail';
export type { ListingRenewalEmailData }     from './templates/financial/ListingRenewalEmail';
export type { PaymentFailedEmailData, PaymentFailureReason } from './templates/financial/PaymentFailedEmail';

// Security & admin
export type { LoginAlertEmailData }         from './templates/security/LoginAlertEmail';
export type { VettingTaskEmailData }        from './templates/security/VettingTaskEmail';

// Marketing
export type { WeeklyDigestEmailData, DigestListing } from './templates/marketing/WeeklyDigestEmail';
export type { FrontierReengagementEmailData }   from './templates/marketing/FrontierReengagementEmail';
export type { AuthorityGeotagEmailData }         from './templates/marketing/AuthorityGeotagEmail';
export type { AuthorityBootsGroundEmailData }    from './templates/marketing/AuthorityBootsGroundEmail';
export type { LaunchWindowEmailData }            from './templates/marketing/LaunchWindowEmail';
export type { SystemUpdateEmailData, SystemUpdateSeverity } from './templates/marketing/SystemUpdateEmail';
export type { WaitlistMilestoneEmailData }       from './templates/marketing/WaitlistMilestoneEmail';
export type { AgentVsLandlordEmailData, ListingUserType } from './templates/marketing/AgentVsLandlordEmail';
export type { PropertyCategoriesEmailData, PropertyCategory } from './templates/marketing/PropertyCategoriesEmail';
export type { LaunchEveEmailData, LaunchUserType } from './templates/marketing/LaunchEveEmail';
export type { ReferralInviteEmailData }          from './templates/marketing/ReferralInviteEmail';
export type { ReferralSuccessEmailData }         from './templates/marketing/ReferralSuccessEmail';
export type { PollResultsSummaryEmailData }      from './templates/marketing/PollResultsSummaryEmail';

// ── Render utilities ──────────────────────────────────────────────────────────
export { renderEmail, renderEmailText, renderEmailFull } from './utils/renderEmail';

// ── Design tokens (useful for mobile app) ────────────────────────────────────
export { default as emailTheme, colors, fonts, fontSize, spacing, radius, shadows } from './styles/tokens';
