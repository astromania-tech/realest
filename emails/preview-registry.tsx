/**
 * Email Preview Registry — server-only module.
 * Imports all 34 templates + their previewProps and exposes two exports:
 *   - templateRegistry : full entries with React elements (for renderEmail calls)
 *   - templateMeta     : serializable metadata (safe to pass as Next.js page props)
 */
import React from "react";

// ─── Platform ─────────────────────────────────────────────────────────────────
import AdminNotificationEmail, {
  previewProps as adminNotifProps,
} from "./templates/platform/AdminNotificationEmail";
import InquiryNotificationEmail, {
  previewProps as inquiryNotifProps,
} from "./templates/platform/InquiryNotificationEmail";
import OnboardingReminderEmail, {
  previewProps as onboardingProps,
} from "./templates/platform/OnboardingReminderEmail";
import PasswordChangedEmail, {
  previewProps as pwChangedProps,
} from "./templates/platform/PasswordChangedEmail";
import PasswordResetEmail, {
  previewProps as pwResetProps,
} from "./templates/platform/PasswordResetEmail";
import SubAdminInvitationEmail, {
  previewProps as subAdminProps,
} from "./templates/platform/SubAdminInvitationEmail";
import WaitlistConfirmationEmail, {
  previewProps as waitlistConfirmProps,
} from "./templates/platform/WaitlistConfirmationEmail";
import WelcomeEmail, {
  previewProps as welcomeProps,
} from "./templates/platform/WelcomeEmail";

// ─── Listing ──────────────────────────────────────────────────────────────────
import ListingLiveEmail, {
  previewProps as listingLiveProps,
} from "./templates/listing/ListingLiveEmail";
import ListingRejectedEmail, {
  previewProps as listingRejectedProps,
} from "./templates/listing/ListingRejectedEmail";
import ListingSubmissionEmail, {
  previewProps as listingSubmissionProps,
} from "./templates/listing/ListingSubmissionEmail";
import MLValidationActionEmail, {
  previewProps as mlActionProps,
} from "./templates/listing/MLValidationActionEmail";
import MLValidationPassedEmail, {
  previewProps as mlPassedProps,
} from "./templates/listing/MLValidationPassedEmail";
import VettingAppointmentEmail, {
  previewProps as vettingAppointmentProps,
} from "./templates/listing/VettingAppointmentEmail";

// ─── Engagement ───────────────────────────────────────────────────────────────
import InquirySentEmail, {
  previewProps as inquirySentProps,
} from "./templates/engagement/InquirySentEmail";
import PriceDropAlertEmail, {
  previewProps as priceDropProps,
} from "./templates/engagement/PriceDropAlertEmail";
import ViewingReminderEmail, {
  previewProps as viewingReminderProps,
} from "./templates/engagement/ViewingReminderEmail";

// ─── Financial ────────────────────────────────────────────────────────────────
import InvoiceEmail, {
  previewProps as invoiceProps,
} from "./templates/financial/InvoiceEmail";
import ListingRenewalEmail, {
  previewProps as listingRenewalProps,
} from "./templates/financial/ListingRenewalEmail";
import PaymentFailedEmail, {
  previewProps as paymentFailedProps,
} from "./templates/financial/PaymentFailedEmail";
import PaymentReceiptEmail, {
  previewProps as paymentReceiptProps,
} from "./templates/financial/PaymentReceiptEmail";

// ─── Security ─────────────────────────────────────────────────────────────────
import LoginAlertEmail, {
  previewProps as loginAlertProps,
} from "./templates/security/LoginAlertEmail";
import VettingTaskEmail, {
  previewProps as vettingTaskProps,
} from "./templates/security/VettingTaskEmail";

// ─── Marketing ────────────────────────────────────────────────────────────────
import AgentVsLandlordEmail, {
  previewProps as agentVsLandlordProps,
} from "./templates/marketing/AgentVsLandlordEmail";
import AuthorityBootsGroundEmail, {
  previewProps as authorityBootsProps,
} from "./templates/marketing/AuthorityBootsGroundEmail";
import AuthorityGeotagEmail, {
  previewProps as authorityGeotagProps,
} from "./templates/marketing/AuthorityGeotagEmail";
import FrontierReengagementEmail, {
  previewProps as frontierProps,
} from "./templates/marketing/FrontierReengagementEmail";
import LaunchEveEmail, {
  previewProps as launchEveProps,
} from "./templates/marketing/LaunchEveEmail";
import LaunchWindowEmail, {
  previewProps as launchWindowProps,
} from "./templates/marketing/LaunchWindowEmail";
import PropertyCategoriesEmail, {
  previewProps as propCategoriesProps,
} from "./templates/marketing/PropertyCategoriesEmail";
import ReferralInviteEmail, {
  previewProps as referralProps,
} from "./templates/marketing/ReferralInviteEmail";
import ReferralSuccessEmail, {
  previewProps as referralSuccessProps,
} from "./templates/marketing/ReferralSuccessEmail";
import SystemUpdateEmail, {
  previewProps as systemUpdateProps,
} from "./templates/marketing/SystemUpdateEmail";
import WaitlistMilestoneEmail, {
  previewProps as waitlistMilestoneProps,
} from "./templates/marketing/WaitlistMilestoneEmail";
import WeeklyDigestEmail, {
  previewProps as weeklyDigestProps,
} from "./templates/marketing/WeeklyDigestEmail";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CategoryKey =
  | "platform"
  | "listing"
  | "engagement"
  | "financial"
  | "security"
  | "marketing";

export interface CategoryMeta {
  key: CategoryKey;
  label: string;
  description: string;
  color: string; // tailwind bg class
  textColor: string; // tailwind text class
}

export interface TemplateRegistryEntry {
  name: string;
  label: string;
  category: CategoryKey;
  description: string;
  subject: string;
  element: React.ReactElement;
}

export interface TemplateMeta {
  name: string;
  label: string;
  category: CategoryKey;
  description: string;
  subject: string;
}

// ─── Category definitions ─────────────────────────────────────────────────────

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "platform",
    label: "Platform",
    description: "Auth, onboarding, account events",
    color: "bg-blue-100",
    textColor: "text-blue-700",
  },
  {
    key: "listing",
    label: "Listing",
    description: "Property submission & verification",
    color: "bg-emerald-100",
    textColor: "text-emerald-700",
  },
  {
    key: "engagement",
    label: "Engagement",
    description: "Inquiries, viewings, alerts",
    color: "bg-amber-100",
    textColor: "text-amber-700",
  },
  {
    key: "financial",
    label: "Financial",
    description: "Invoices, payments, renewals",
    color: "bg-purple-100",
    textColor: "text-purple-700",
  },
  {
    key: "security",
    label: "Security",
    description: "Login alerts, vetting tasks",
    color: "bg-red-100",
    textColor: "text-red-700",
  },
  {
    key: "marketing",
    label: "Marketing",
    description: "Waitlist, launch, warm-up series",
    color: "bg-lime-100",
    textColor: "text-lime-800",
  },
];

// ─── Registry ─────────────────────────────────────────────────────────────────

export const templateRegistry: TemplateRegistryEntry[] = [
  // ── Platform (8) ──────────────────────────────────────────────────────────
  {
    name: "AdminNotificationEmail",
    label: "Admin Notification",
    category: "platform",
    description: "Internal alert sent to admins when action is required",
    subject: AdminNotificationEmail.subject(adminNotifProps),
    element: <AdminNotificationEmail {...adminNotifProps} />,
  },
  {
    name: "InquiryNotificationEmail",
    label: "Inquiry Notification",
    category: "platform",
    description: "Notifies property owner of a new tenant inquiry",
    subject: InquiryNotificationEmail.subject(inquiryNotifProps),
    element: <InquiryNotificationEmail {...inquiryNotifProps} />,
  },
  {
    name: "OnboardingReminderEmail",
    label: "Onboarding Reminder",
    category: "platform",
    description: "Nudges new users to complete their profile setup",
    subject: OnboardingReminderEmail.subject(onboardingProps),
    element: <OnboardingReminderEmail {...onboardingProps} />,
  },
  {
    name: "PasswordChangedEmail",
    label: "Password Changed",
    category: "platform",
    description: "Confirms a successful password change",
    subject: PasswordChangedEmail.subject(pwChangedProps),
    element: <PasswordChangedEmail {...pwChangedProps} />,
  },
  {
    name: "PasswordResetEmail",
    label: "Password Reset",
    category: "platform",
    description: "Delivers a magic link to reset forgotten password",
    subject: PasswordResetEmail.subject(pwResetProps),
    element: <PasswordResetEmail {...pwResetProps} />,
  },
  {
    name: "SubAdminInvitationEmail",
    label: "Sub-Admin Invitation",
    category: "platform",
    description: "Invites a new sub-admin to manage the platform",
    subject: SubAdminInvitationEmail.subject(subAdminProps),
    element: <SubAdminInvitationEmail {...subAdminProps} />,
  },
  {
    name: "WaitlistConfirmationEmail",
    label: "Waitlist Confirmation",
    category: "platform",
    description: "Confirms a spot on the pre-launch waitlist",
    subject: WaitlistConfirmationEmail.subject(waitlistConfirmProps),
    element: <WaitlistConfirmationEmail {...waitlistConfirmProps} />,
  },
  {
    name: "WelcomeEmail",
    label: "Welcome",
    category: "platform",
    description: "First email after account creation",
    subject: WelcomeEmail.subject(welcomeProps),
    element: <WelcomeEmail {...welcomeProps} />,
  },

  // ── Listing (6) ───────────────────────────────────────────────────────────
  {
    name: "ListingLiveEmail",
    label: "Listing Live",
    category: "listing",
    description: "Confirms that a property listing is now published",
    subject: ListingLiveEmail.subject(listingLiveProps),
    element: <ListingLiveEmail {...listingLiveProps} />,
  },
  {
    name: "ListingRejectedEmail",
    label: "Listing Rejected",
    category: "listing",
    description: "Notifies owner of a rejected listing with reasons",
    subject: ListingRejectedEmail.subject(listingRejectedProps),
    element: <ListingRejectedEmail {...listingRejectedProps} />,
  },
  {
    name: "ListingSubmissionEmail",
    label: "Listing Submitted",
    category: "listing",
    description: "Acknowledges receipt of a new property submission",
    subject: ListingSubmissionEmail.subject(listingSubmissionProps),
    element: <ListingSubmissionEmail {...listingSubmissionProps} />,
  },
  {
    name: "MLValidationActionEmail",
    label: "ML Validation — Action Required",
    category: "listing",
    description: "Requests manual review after ML validation flags an issue",
    subject: MLValidationActionEmail.subject(mlActionProps),
    element: <MLValidationActionEmail {...mlActionProps} />,
  },
  {
    name: "MLValidationPassedEmail",
    label: "ML Validation Passed",
    category: "listing",
    description: "Confirms automated listing validation succeeded",
    subject: MLValidationPassedEmail.subject(mlPassedProps),
    element: <MLValidationPassedEmail {...mlPassedProps} />,
  },
  {
    name: "VettingAppointmentEmail",
    label: "Vetting Appointment",
    category: "listing",
    description: "Schedules an on-site property vetting appointment",
    subject: VettingAppointmentEmail.subject(vettingAppointmentProps),
    element: <VettingAppointmentEmail {...vettingAppointmentProps} />,
  },

  // ── Engagement (3) ────────────────────────────────────────────────────────
  {
    name: "InquirySentEmail",
    label: "Inquiry Sent",
    category: "engagement",
    description: "Confirms to the tenant that their inquiry was sent",
    subject: InquirySentEmail.subject(inquirySentProps),
    element: <InquirySentEmail {...inquirySentProps} />,
  },
  {
    name: "PriceDropAlertEmail",
    label: "Price Drop Alert",
    category: "engagement",
    description: "Alerts saved-search users of a price reduction",
    subject: PriceDropAlertEmail.subject(priceDropProps),
    element: <PriceDropAlertEmail {...priceDropProps} />,
  },
  {
    name: "ViewingReminderEmail",
    label: "Viewing Reminder",
    category: "engagement",
    description: "Reminds a tenant of an upcoming property viewing",
    subject: ViewingReminderEmail.subject(viewingReminderProps),
    element: <ViewingReminderEmail {...viewingReminderProps} />,
  },

  // ── Financial (4) ─────────────────────────────────────────────────────────
  {
    name: "InvoiceEmail",
    label: "Invoice",
    category: "financial",
    description: "Delivers a payment invoice to the property owner",
    subject: InvoiceEmail.subject(invoiceProps),
    element: <InvoiceEmail {...invoiceProps} />,
  },
  {
    name: "ListingRenewalEmail",
    label: "Listing Renewal",
    category: "financial",
    description: "Prompts owner to renew an expiring listing",
    subject: ListingRenewalEmail.subject(listingRenewalProps),
    element: <ListingRenewalEmail {...listingRenewalProps} />,
  },
  {
    name: "PaymentFailedEmail",
    label: "Payment Failed",
    category: "financial",
    description: "Alerts owner of a failed payment attempt",
    subject: PaymentFailedEmail.subject(paymentFailedProps),
    element: <PaymentFailedEmail {...paymentFailedProps} />,
  },
  {
    name: "PaymentReceiptEmail",
    label: "Payment Receipt",
    category: "financial",
    description: "Confirms a successful payment transaction",
    subject: PaymentReceiptEmail.subject(paymentReceiptProps),
    element: <PaymentReceiptEmail {...paymentReceiptProps} />,
  },

  // ── Security (2) ──────────────────────────────────────────────────────────
  {
    name: "LoginAlertEmail",
    label: "Login Alert",
    category: "security",
    description: "Warns user of a new device or suspicious login",
    subject: LoginAlertEmail.subject(loginAlertProps),
    element: <LoginAlertEmail {...loginAlertProps} />,
  },
  {
    name: "VettingTaskEmail",
    label: "Vetting Task Assignment",
    category: "security",
    description: "Assigns an on-site vetting task to a field agent",
    subject: VettingTaskEmail.subject(vettingTaskProps),
    element: <VettingTaskEmail {...vettingTaskProps} />,
  },

  // ── Marketing (11) ────────────────────────────────────────────────────────
  {
    name: "AgentVsLandlordEmail",
    label: "Agent vs Landlord",
    category: "marketing",
    description: "Educational email explaining the agent vs. owner roles",
    subject: AgentVsLandlordEmail.subject(agentVsLandlordProps),
    element: <AgentVsLandlordEmail {...agentVsLandlordProps} />,
  },
  {
    name: "AuthorityBootsGroundEmail",
    label: "Authority: Boots on the Ground",
    category: "marketing",
    description: "Warm-up email on RealEST's physical verification process",
    subject: AuthorityBootsGroundEmail.subject(authorityBootsProps),
    element: <AuthorityBootsGroundEmail {...authorityBootsProps} />,
  },
  {
    name: "AuthorityGeotagEmail",
    label: "Authority: Geotag Verified",
    category: "marketing",
    description: "Warm-up email introducing GPS-level geotag verification",
    subject: AuthorityGeotagEmail.subject(authorityGeotagProps),
    element: <AuthorityGeotagEmail {...authorityGeotagProps} />,
  },
  {
    name: "FrontierReengagementEmail",
    label: "Frontier Re-engagement",
    category: "marketing",
    description: "Re-engages cold waitlist leads before launch",
    subject: FrontierReengagementEmail.subject(frontierProps),
    element: <FrontierReengagementEmail {...frontierProps} />,
  },
  {
    name: "LaunchEveEmail",
    label: "Launch Eve",
    category: "marketing",
    description: "Final countdown email sent the day before launch",
    subject: LaunchEveEmail.subject(launchEveProps),
    element: <LaunchEveEmail {...launchEveProps} />,
  },
  {
    name: "LaunchWindowEmail",
    label: "Launch Window",
    category: "marketing",
    description: "Announces the platform is now live to waitlist members",
    subject: LaunchWindowEmail.subject(launchWindowProps),
    element: <LaunchWindowEmail {...launchWindowProps} />,
  },
  {
    name: "PropertyCategoriesEmail",
    label: "Property Categories Guide",
    category: "marketing",
    description: "Explains the different property types on the platform",
    subject: PropertyCategoriesEmail.subject(propCategoriesProps),
    element: <PropertyCategoriesEmail {...propCategoriesProps} />,
  },
  {
    name: "ReferralInviteEmail",
    label: "Referral Invite",
    category: "marketing",
    description: "Encourages users to refer friends for waitlist rewards",
    subject: ReferralInviteEmail.subject(referralProps),
    element: <ReferralInviteEmail {...referralProps} />,
  },
  {
    name: "ReferralSuccessEmail",
    label: "Referral Success",
    category: "marketing",
    description: "Notifies referrer when someone joins via their referral link",
    subject: ReferralSuccessEmail.subject(referralSuccessProps),
    element: <ReferralSuccessEmail {...referralSuccessProps} />,
  },
  {
    name: "SystemUpdateEmail",
    label: "System Update",
    category: "marketing",
    description: "Informs waitlist members of a new platform feature",
    subject: SystemUpdateEmail.subject(systemUpdateProps),
    element: <SystemUpdateEmail {...systemUpdateProps} />,
  },
  {
    name: "WaitlistMilestoneEmail",
    label: "Waitlist Milestone",
    category: "marketing",
    description: "Celebrates a waitlist signups milestone with community",
    subject: WaitlistMilestoneEmail.subject(waitlistMilestoneProps),
    element: <WaitlistMilestoneEmail {...waitlistMilestoneProps} />,
  },
  {
    name: "WeeklyDigestEmail",
    label: "Weekly Digest",
    category: "marketing",
    description: "Weekly property digest for active waitlist members",
    subject: WeeklyDigestEmail.subject(weeklyDigestProps),
    element: <WeeklyDigestEmail {...weeklyDigestProps} />,
  },
];

/**
 * Serialisable metadata — safe to pass as Next.js Server Component props.
 * Strips the `element` field so no React elements cross the server/client boundary.
 */
export const templateMeta: TemplateMeta[] = templateRegistry.map(
  ({ element: _el, ...meta }) => meta
);
