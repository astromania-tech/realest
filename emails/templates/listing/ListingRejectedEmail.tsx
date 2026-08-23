import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection, EmailDetailRow } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { EmailAlert } from '../../components/EmailAlert';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export type RejectionReason =
  | 'duplicate_listing'
  | 'documents_failed_vetting'
  | 'property_not_found'
  | 'ownership_dispute'
  | 'fraudulent_documents'
  | 'other';

export interface ListingRejectedEmailData {
  ownerName: string;
  ownerEmail: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyId: string;
  rejectionReason: RejectionReason;
  rejectionDetail?: string;
  appealUrl?: string;
  dashboardUrl?: string;
}

const REJECTION_COPY: Record<RejectionReason, { title: string; description: string; canAppeal: boolean }> = {
  duplicate_listing: {
    title: 'Duplicate Listing Detected',
    description: 'Our system has identified that this property already exists on the RealEST platform under a different listing. Only one active listing per property is permitted.',
    canAppeal: true,
  },
  documents_failed_vetting: {
    title: 'Documents Failed Physical Vetting',
    description: 'The original documents presented during the on-site inspection could not be verified. The documents did not match the copies submitted or failed authenticity checks.',
    canAppeal: true,
  },
  property_not_found: {
    title: 'Property Not Found at Listed Address',
    description: 'Our field agent was unable to locate the property at the address provided. Please verify the address and geo-coordinates are accurate.',
    canAppeal: true,
  },
  ownership_dispute: {
    title: 'Ownership Dispute',
    description: 'A dispute exists regarding the ownership of this property. Listings cannot go live while an ownership issue is unresolved.',
    canAppeal: false,
  },
  fraudulent_documents: {
    title: 'Fraudulent Documents Detected',
    description: 'The documents submitted for this listing have been identified as fraudulent. This is a serious violation of our Terms of Service.',
    canAppeal: false,
  },
  other: {
    title: 'Listing Could Not Be Approved',
    description: 'Unfortunately your listing did not meet our verification standards at this time.',
    canAppeal: true,
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.65',
    margin: `0 0 ${spacing['5']}`,
  },
  headline: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandDark,
    letterSpacing: '-0.02em',
    lineHeight: '1.2',
    margin: `0 0 ${spacing['4']}`,
  },
  refId: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: '0.1em',
  },
  muted: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    margin: `${spacing['6']} 0 0`,
    lineHeight: '1.6',
    textAlign: 'center' as const,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function ListingRejectedEmail({
  ownerName,
  propertyTitle,
  propertyAddress,
  propertyId,
  rejectionReason,
  rejectionDetail,
  appealUrl,
  dashboardUrl,
}: ListingRejectedEmailData) {
  const copy    = REJECTION_COPY[rejectionReason] ?? REJECTION_COPY.other;
  const dashUrl = dashboardUrl ?? `${BASE_URL}/owner/properties`;
  const appUrl  = appealUrl   ?? `${BASE_URL}/owner/properties/${propertyId}/appeal`;

  return (
    <EmailLayout preview={`Listing update required — "${propertyTitle}" could not be approved`}>
      <EmailHeader />

      <EmailSection>
        {/* Headline */}
        <Text style={s.headline}>Listing Not Approved</Text>
        <Text style={s.paragraph}>
          Hi {ownerName}, we have completed the verification process for{' '}
          <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong> and unfortunately
          we are unable to approve this listing at this time.
        </Text>

        {/* Rejection reason */}
        <EmailAlert variant="error">
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.sm, fontWeight: 700,
            color: colors.error, margin: `0 0 ${spacing['2']}`,
          }}>
            {copy.title}
          </Text>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.sm,
            color: colors.error, margin: '0', lineHeight: '1.6',
          }}>
            {rejectionDetail ?? copy.description}
          </Text>
        </EmailAlert>

        {/* Property reference */}
        <Section style={{
          backgroundColor: colors.brandLight,
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Property"  value={propertyTitle} />
              <EmailDetailRow label="Address"   value={propertyAddress} />
              <EmailDetailRow label="Reference" value={
                <span style={s.refId}>{propertyId}</span>
              } />
            </tbody>
          </table>
        </Section>

        {/* What to do next */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.xs, fontWeight: 700,
            color: colors.textMuted, textTransform: 'uppercase' as const,
            letterSpacing: '0.1em', margin: `0 0 ${spacing['3']}`,
          }}>
            What you can do
          </Text>
          {copy.canAppeal ? (
            <>
              <Text style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text, lineHeight: '1.6', margin: `0 0 ${spacing['2']}` }}>
                <strong>1. Appeal this decision</strong> — if you believe this rejection is
                in error, submit an appeal with supporting documents.
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text, lineHeight: '1.6', margin: `0 0 ${spacing['2']}` }}>
                <strong>2. Correct and resubmit</strong> — address the issue identified
                above and submit a fresh listing application from your dashboard.
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text, lineHeight: '1.6', margin: '0' }}>
                <strong>3. Contact support</strong> — if you need clarification on the
                rejection, our team is available to assist.
              </Text>
            </>
          ) : (
            <Text style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text, lineHeight: '1.6', margin: '0' }}>
              Due to the nature of this rejection, an appeal is not available for this
              listing. If you believe this is an error, please contact our support team
              with your reference ID.
            </Text>
          )}
        </Section>

        {/* CTAs */}
        {copy.canAppeal && (
          <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
            <EmailButton href={appUrl} variant="primary">
              Submit an Appeal →
            </EmailButton>
          </Section>
        )}

        <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
          <EmailButton href={dashUrl} variant="secondary">
            Return to Dashboard
          </EmailButton>
        </Section>

        <Text style={s.muted}>
          Reference: <span style={s.refId}>{propertyId}</span>
          {' · '}
          <Link href="mailto:support@realest.ng" style={{ color: colors.brandDark, fontWeight: 600 }}>
            Contact Support
          </Link>
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

ListingRejectedEmail.subject = (data: ListingRejectedEmailData) =>
  `Your listing "${data.propertyTitle}" could not be approved`;

export const previewProps: ListingRejectedEmailData = {
  ownerEmail: 'emeka@example.ng',
  ownerName: 'Emeka Okafor',
  propertyTitle: 'Luxury 4-Bedroom Duplex, Victoria Island',
  propertyAddress: '23 Adeola Odeku Street, Victoria Island, Lagos',
  propertyId: 'prop_vi_20260309_001',
  rejectionReason: 'documents_failed_vetting',
};

export default ListingRejectedEmail;
