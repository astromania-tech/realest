/**
 * RealEST Email Service
 *
 * Thin wrapper around the Resend SDK. All templates are React Email
 * components rendered server-side. The old lib/email-templates/ TS
 * string system is preserved for backward compatibility but new code
 * should only use this service.
 */

import * as React from 'react';
import { Resend } from 'resend';
import {
  // Platform (existing)
  WaitlistConfirmationEmail,
  AdminNotificationEmail,
  PasswordResetEmail,
  VerificationEmail,
  WelcomeEmail,
  OnboardingReminderEmail,
  PasswordChangedEmail,
  InquiryNotificationEmail,
  SubAdminInvitationEmail,
  // Listing lifecycle
  ListingSubmissionEmail,
  MLValidationPassedEmail,
  MLValidationActionEmail,
  VettingAppointmentEmail,
  ListingLiveEmail,
  ListingRejectedEmail,
  // Engagement
  InquirySentEmail,
  ViewingReminderEmail,
  PriceDropAlertEmail,
  // Financial
  InvoiceEmail,
  PaymentReceiptEmail,
  ListingRenewalEmail,
  PaymentFailedEmail,
  // Security & admin
  LoginAlertEmail,
  VettingTaskEmail,
  // Marketing / broadcast
  WeeklyDigestEmail,
  FrontierReengagementEmail,
  AuthorityGeotagEmail,
  AuthorityBootsGroundEmail,
  LaunchWindowEmail,
  SystemUpdateEmail,
  WaitlistMilestoneEmail,
  AgentVsLandlordEmail,
  PropertyCategoriesEmail,
  LaunchEveEmail,
  ReferralInviteEmail,
  ReferralSuccessEmail,
  PollResultsSummaryEmail,
  renderEmailFull,
  // Types — platform (existing)
  type WaitlistEmailData,
  type AdminNotificationData,
  type PasswordResetEmailData,
  type WelcomeEmailData,
  type OnboardingReminderEmailData,
  type PasswordChangedEmailData,
  type InquiryEmailData,
  type SubAdminInvitationData,
  // Types — listing lifecycle
  type ListingSubmissionEmailData,
  type MLValidationPassedEmailData,
  type MLValidationActionEmailData,
  type VettingAppointmentEmailData,
  type ListingLiveEmailData,
  type ListingRejectedEmailData,
  // Types — engagement
  type InquirySentEmailData,
  type ViewingReminderEmailData,
  type PriceDropAlertEmailData,
  // Types — financial
  type InvoiceEmailData,
  type PaymentReceiptEmailData,
  type ListingRenewalEmailData,
  type PaymentFailedEmailData,
  // Types — security & admin
  type LoginAlertEmailData,
  type VettingTaskEmailData,
  // Types — marketing
  type WeeklyDigestEmailData,
  type FrontierReengagementEmailData,
  type AuthorityGeotagEmailData,
  type AuthorityBootsGroundEmailData,
  type LaunchWindowEmailData,
  type SystemUpdateEmailData,
  type WaitlistMilestoneEmailData,
  type AgentVsLandlordEmailData,
  type PropertyCategoriesEmailData,
  type LaunchEveEmailData,
  type ReferralInviteEmailData,
  type ReferralSuccessEmailData,
  type PollResultsSummaryEmailData,
  VerificationEmailData,
} from '@/emails';
import { adminNotificationSkipReason, resendApiKey, resendSkipReason, resolveResendAction } from '@/lib/resend-key';

const FROM_EMAIL           = process.env.FROM_EMAIL            || 'RealEST Connect <info@connect.realest.ng>';
const FROM_EMAIL_AUTH      = process.env.FROM_EMAIL_AUTH       || FROM_EMAIL;
const FROM_EMAIL_INQUIRIES = process.env.FROM_EMAIL_INQUIRIES  || FROM_EMAIL;
const FROM_EMAIL_WAITLIST  = process.env.FROM_EMAIL_WAITLIST   || FROM_EMAIL;

type EmailResult = { success: boolean; error?: string; messageId?: string; quotaExceeded?: boolean };

function isQuotaError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  return (
    e.name === 'daily_quota_exceeded' ||
    e.name === 'monthly_quota_exceeded' ||
    String(e.message ?? '').toLowerCase().includes('quota')
  );
}

async function sendReactEmail({
  from, to, subject, component, replyTo,
}: {
  from: string;
  to: string | string[];
  subject: string;
  component: React.ReactElement;
  replyTo?: string;
}): Promise<EmailResult> {
  const action = resolveResendAction();
  const apiKey = resendApiKey();
  if (action !== "send" || !apiKey) {
    const skip = resendSkipReason();
    if (action === "missing-on-production") {
      console.error(skip ?? "RESEND_API_KEY not configured");
    } else {
      console.warn(skip ?? "RESEND_API_KEY not configured — email sending disabled.");
    }
    return { success: false, error: skip ?? "Email service not configured" };
  }
  const resend = new Resend(apiKey);
  try {
    const { html, text } = await renderEmailFull(component);
    const { data, error } = await resend.emails.send({
      from,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      text,
      ...(replyTo ? { replyTo } : {}),
    });
    if (error) {
      console.error('❌ Email send failed:', error);
      return { success: false, error: error.message, quotaExceeded: isQuotaError(error) };
    }
    return { success: true, messageId: data?.id };
  } catch (err) {
    console.error('❌ Unexpected email error:', err);
    return { success: false, error: err instanceof Error ? err.message : 'Unknown email error' };
  }
}

export async function sendWaitlistConfirmationEmail(data: WaitlistEmailData): Promise<EmailResult> {
  console.log(`📧 Sending waitlist confirmation to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: data.email,
    subject: WaitlistConfirmationEmail.subject(data),
    component: React.createElement(WaitlistConfirmationEmail, data),
  });
}

export async function sendWaitlistAdminNotification(data: AdminNotificationData): Promise<EmailResult> {
  const skip = adminNotificationSkipReason();
  if (skip) {
    return { success: false, error: skip };
  }
  console.log(`📧 Sending admin notification for ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: process.env.ADMIN_EMAIL as string,
    subject: AdminNotificationEmail.subject(data),
    component: React.createElement(AdminNotificationEmail, data),
  });
}

export async function sendHybridPasswordResetEmail(data: PasswordResetEmailData): Promise<EmailResult> {
  if (!data.email || !data.firstName || !data.otpCode || !data.resetLink) {
    return { success: false, error: 'Invalid password reset data' };
  }
  console.log(`📧 Sending password reset to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: PasswordResetEmail.subject(data),
    component: React.createElement(PasswordResetEmail, data),
  });
}

export async function sendVerificationEmail(data: VerificationEmailData): Promise<EmailResult> {
  if (!data.email || !data.firstName || !data.verificationUrl) {
    return { success: false, error: 'Invalid verification email data' };
  }
  console.log(`📧 Sending verification email to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: VerificationEmail.subject(data),
    component: React.createElement(VerificationEmail, data),
  });
}

export async function sendWelcomeEmail(data: WelcomeEmailData): Promise<EmailResult> {
  if (!data.email || !data.firstName || !data.userType || !data.dashboardUrl) {
    return { success: false, error: 'Invalid welcome email data' };
  }
  console.log(`📧 Sending welcome email to ${data.email} (${data.userType})`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: WelcomeEmail.subject(data),
    component: React.createElement(WelcomeEmail, data),
  });
}

export async function sendOnboardingReminderEmail(data: OnboardingReminderEmailData): Promise<EmailResult> {
  if (!data.email || !data.firstName || !data.userType || !data.onboardingUrl) {
    return { success: false, error: 'Invalid onboarding reminder data' };
  }
  console.log(`📧 Sending onboarding reminder to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: OnboardingReminderEmail.subject(data),
    component: React.createElement(OnboardingReminderEmail, data),
  });
}

export async function sendPasswordChangedEmail(data: PasswordChangedEmailData): Promise<EmailResult> {
  if (!data.email || !data.firstName) {
    return { success: false, error: 'Invalid data for password-changed notification' };
  }
  console.log(`📧 Sending password-changed notification to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: PasswordChangedEmail.subject(data),
    component: React.createElement(PasswordChangedEmail, data),
  });
}

export async function sendInquiryEmail(data: InquiryEmailData): Promise<EmailResult> {
  console.log(`📧 Sending inquiry email to ${data.recipientEmail} for "${data.propertyTitle}"`);
  return sendReactEmail({
    from: FROM_EMAIL_INQUIRIES,
    to: data.recipientEmail,
    replyTo: data.senderEmail,
    subject: InquiryNotificationEmail.subject(data),
    component: React.createElement(InquiryNotificationEmail, data),
  });
}

export async function sendSubAdminInvitationEmail(data: SubAdminInvitationData): Promise<EmailResult> {
  console.log(`📧 Sending sub-admin invitation to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: SubAdminInvitationEmail.subject(data),
    component: React.createElement(SubAdminInvitationEmail, data),
  });
}

// ─── Listing lifecycle ────────────────────────────────────────────────────────

export async function sendListingSubmissionEmail(data: ListingSubmissionEmailData): Promise<EmailResult> {
  console.log(`📧 Sending listing submission confirmation to ${data.ownerEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: data.ownerEmail,
    subject: ListingSubmissionEmail.subject(data),
    component: React.createElement(ListingSubmissionEmail, data),
  });
}

export async function sendMLValidationPassedEmail(data: MLValidationPassedEmailData): Promise<EmailResult> {
  console.log(`📧 Sending ML validation passed to ${data.ownerEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: data.ownerEmail,
    subject: MLValidationPassedEmail.subject(data),
    component: React.createElement(MLValidationPassedEmail, data),
  });
}

export async function sendMLValidationActionEmail(data: MLValidationActionEmailData): Promise<EmailResult> {
  console.log(`📧 Sending ML validation action required to ${data.ownerEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: data.ownerEmail,
    subject: MLValidationActionEmail.subject(data),
    component: React.createElement(MLValidationActionEmail, data),
  });
}

export async function sendVettingAppointmentEmail(data: VettingAppointmentEmailData): Promise<EmailResult> {
  console.log(`📧 Sending vetting appointment to ${data.ownerEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: data.ownerEmail,
    subject: VettingAppointmentEmail.subject(data),
    component: React.createElement(VettingAppointmentEmail, data),
  });
}

export async function sendListingLiveEmail(data: ListingLiveEmailData): Promise<EmailResult> {
  console.log(`📧 Sending listing-live notification to ${data.ownerEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: data.ownerEmail,
    subject: ListingLiveEmail.subject(data),
    component: React.createElement(ListingLiveEmail, data),
  });
}

export async function sendListingRejectedEmail(data: ListingRejectedEmailData): Promise<EmailResult> {
  console.log(`📧 Sending listing-rejected notification to ${data.ownerEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: data.ownerEmail,
    subject: ListingRejectedEmail.subject(data),
    component: React.createElement(ListingRejectedEmail, data),
  });
}

// ─── Engagement ───────────────────────────────────────────────────────────────

export async function sendInquirySentEmail(data: InquirySentEmailData): Promise<EmailResult> {
  console.log(`📧 Sending inquiry-sent confirmation to ${data.buyerEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL_INQUIRIES,
    to: data.buyerEmail,
    subject: InquirySentEmail.subject(data),
    component: React.createElement(InquirySentEmail, data),
  });
}

export async function sendViewingReminderEmail(data: ViewingReminderEmailData): Promise<EmailResult> {
  console.log(`📧 Sending viewing reminder to ${data.recipientEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: data.recipientEmail,
    subject: ViewingReminderEmail.subject(data),
    component: React.createElement(ViewingReminderEmail, data),
  });
}

export async function sendPriceDropAlertEmail(data: PriceDropAlertEmailData): Promise<EmailResult> {
  console.log(`📧 Sending price-drop alert to ${data.recipientEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: data.recipientEmail,
    subject: PriceDropAlertEmail.subject(data),
    component: React.createElement(PriceDropAlertEmail, data),
  });
}

// ─── Financial ────────────────────────────────────────────────────────────────

export async function sendInvoiceEmail(data: InvoiceEmailData): Promise<EmailResult> {
  console.log(`📧 Sending invoice ${data.invoiceNumber} to ${data.ownerEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: data.ownerEmail,
    subject: InvoiceEmail.subject(data),
    component: React.createElement(InvoiceEmail, data),
  });
}

export async function sendPaymentReceiptEmail(data: PaymentReceiptEmailData): Promise<EmailResult> {
  console.log(`📧 Sending payment receipt ${data.receiptNumber} to ${data.ownerEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: data.ownerEmail,
    subject: PaymentReceiptEmail.subject(data),
    component: React.createElement(PaymentReceiptEmail, data),
  });
}

export async function sendListingRenewalEmail(email: string, data: ListingRenewalEmailData): Promise<EmailResult> {
  console.log(`📧 Sending listing renewal reminder to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: email,
    subject: ListingRenewalEmail.subject(data),
    component: React.createElement(ListingRenewalEmail, data),
  });
}

export async function sendPaymentFailedEmail(email: string, data: PaymentFailedEmailData): Promise<EmailResult> {
  console.log(`📧 Sending payment-failed notification to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: email,
    subject: PaymentFailedEmail.subject(data),
    component: React.createElement(PaymentFailedEmail, data),
  });
}

// ─── Security & admin ─────────────────────────────────────────────────────────

export async function sendLoginAlertEmail(data: LoginAlertEmailData): Promise<EmailResult> {
  console.log(`📧 Sending login alert to ${data.email}`);
  return sendReactEmail({
    from: FROM_EMAIL_AUTH,
    to: data.email,
    subject: LoginAlertEmail.subject(data),
    component: React.createElement(LoginAlertEmail, data),
  });
}

export async function sendVettingTaskEmail(data: VettingTaskEmailData): Promise<EmailResult> {
  console.log(`📧 Sending vetting task ${data.taskId} to ${data.agentEmail}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: data.agentEmail,
    subject: VettingTaskEmail.subject(data),
    component: React.createElement(VettingTaskEmail, data),
  });
}

// ─── Marketing / broadcast ────────────────────────────────────────────────────

export async function sendWeeklyDigestEmail(email: string, data: WeeklyDigestEmailData): Promise<EmailResult> {
  console.log(`📧 Sending weekly digest to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: email,
    subject: WeeklyDigestEmail.subject(data),
    component: React.createElement(WeeklyDigestEmail, data),
  });
}

export async function sendFrontierReengagementEmail(email: string, data: FrontierReengagementEmailData): Promise<EmailResult> {
  console.log(`📧 Sending frontier re-engagement to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: email,
    subject: FrontierReengagementEmail.subject(data),
    component: React.createElement(FrontierReengagementEmail, data),
  });
}

export async function sendAuthorityGeotagEmail(email: string, data: AuthorityGeotagEmailData): Promise<EmailResult> {
  console.log(`📧 Sending authority geotag to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: email,
    subject: AuthorityGeotagEmail.subject(data),
    component: React.createElement(AuthorityGeotagEmail, data),
  });
}

export async function sendAuthorityBootsGroundEmail(email: string, data: AuthorityBootsGroundEmailData): Promise<EmailResult> {
  console.log(`📧 Sending authority boots-on-ground to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: email,
    subject: AuthorityBootsGroundEmail.subject(data),
    component: React.createElement(AuthorityBootsGroundEmail, data),
  });
}

export async function sendLaunchWindowEmail(email: string, data: LaunchWindowEmailData): Promise<EmailResult> {
  console.log(`📧 Sending launch window to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: email,
    subject: LaunchWindowEmail.subject(data),
    component: React.createElement(LaunchWindowEmail, data),
  });
}

export async function sendSystemUpdateEmail(email: string, data: SystemUpdateEmailData): Promise<EmailResult> {
  console.log(`📧 Sending system update to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: email,
    subject: SystemUpdateEmail.subject(data),
    component: React.createElement(SystemUpdateEmail, data),
  });
}

export async function sendWaitlistMilestoneEmail(email: string, data: WaitlistMilestoneEmailData): Promise<EmailResult> {
  console.log(`📧 Sending waitlist milestone to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: email,
    subject: WaitlistMilestoneEmail.subject(data),
    component: React.createElement(WaitlistMilestoneEmail, data),
  });
}

export async function sendAgentVsLandlordEmail(email: string, data: AgentVsLandlordEmailData): Promise<EmailResult> {
  console.log(`📧 Sending agent-vs-landlord to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: email,
    subject: AgentVsLandlordEmail.subject(data),
    component: React.createElement(AgentVsLandlordEmail, data),
  });
}

export async function sendPropertyCategoriesEmail(email: string, data: PropertyCategoriesEmailData): Promise<EmailResult> {
  console.log(`📧 Sending property categories to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: email,
    subject: PropertyCategoriesEmail.subject(data),
    component: React.createElement(PropertyCategoriesEmail, data),
  });
}

export async function sendLaunchEveEmail(email: string, data: LaunchEveEmailData): Promise<EmailResult> {
  console.log(`📧 Sending launch-eve to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: email,
    subject: LaunchEveEmail.subject(data),
    component: React.createElement(LaunchEveEmail, data),
  });
}

export async function sendReferralInviteEmail(email: string, data: ReferralInviteEmailData): Promise<EmailResult> {
  console.log(`📧 Sending referral invite to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL,
    to: email,
    subject: ReferralInviteEmail.subject(data),
    component: React.createElement(ReferralInviteEmail, data),
  });
}

export async function sendReferralSuccessEmail(email: string, data: ReferralSuccessEmailData): Promise<EmailResult> {
  console.log(`📧 Sending referral success notification to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: email,
    subject: ReferralSuccessEmail.subject(data),
    component: React.createElement(ReferralSuccessEmail, data),
  });
}

export async function sendPollResultsSummaryEmail(email: string, data: PollResultsSummaryEmailData): Promise<EmailResult> {
  console.log(`📧 Sending poll summary to ${email}`);
  return sendReactEmail({
    from: FROM_EMAIL_WAITLIST,
    to: email,
    subject: PollResultsSummaryEmail.subject(data),
    component: React.createElement(PollResultsSummaryEmail, data),
  });
}

export async function testEmailConfiguration(): Promise<{ success: boolean; error?: string }> {
  const apiKey = resendApiKey();
  const skip = resendSkipReason();
  if (!apiKey || skip) {
    return { success: false, error: skip ?? "RESEND_API_KEY not configured" };
  }
  try {
    const response = await fetch('https://api.resend.com/domains', {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    return response.ok
      ? { success: true }
      : { success: false, error: 'Invalid API key or configuration' };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
}

export type {
  // Platform
  WaitlistEmailData,
  VerificationEmail,
  AdminNotificationData,
  PasswordResetEmailData,
  WelcomeEmailData,
  OnboardingReminderEmailData,
  PasswordChangedEmailData,
  InquiryEmailData,
  SubAdminInvitationData,
  // Listing lifecycle
  ListingSubmissionEmailData,
  MLValidationPassedEmailData,
  MLValidationActionEmailData,
  VettingAppointmentEmailData,
  ListingLiveEmailData,
  ListingRejectedEmailData,
  // Engagement
  InquirySentEmailData,
  ViewingReminderEmailData,
  PriceDropAlertEmailData,
  // Financial
  InvoiceEmailData,
  PaymentReceiptEmailData,
  ListingRenewalEmailData,
  PaymentFailedEmailData,
  // Security & admin
  LoginAlertEmailData,
  VettingTaskEmailData,
  // Marketing
  WeeklyDigestEmailData,
  FrontierReengagementEmailData,
  AuthorityGeotagEmailData,
  AuthorityBootsGroundEmailData,
  LaunchWindowEmailData,
  SystemUpdateEmailData,
  WaitlistMilestoneEmailData,
  AgentVsLandlordEmailData,
  PropertyCategoriesEmailData,
  LaunchEveEmailData,
  ReferralInviteEmailData,
  ReferralSuccessEmailData,
  PollResultsSummaryEmailData,
} from '@/emails';
