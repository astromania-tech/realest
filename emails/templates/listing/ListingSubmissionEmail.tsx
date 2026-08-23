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
export interface ListingSubmissionEmailData {
  ownerName: string;
  ownerEmail: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyId: string;
  listingType: string;
  submittedAt: string;
  dashboardUrl?: string;
}

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
  subheading: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: 700 as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    margin: `0 0 ${spacing['3']}`,
  },
  stepRow: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: '1.6',
    margin: `0 0 ${spacing['3']}`,
    paddingLeft: spacing['2'],
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
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function ListingSubmissionEmail({
  ownerName,
  propertyTitle,
  propertyAddress,
  propertyId,
  listingType,
  submittedAt,
  dashboardUrl,
}: ListingSubmissionEmailData) {
  const dashUrl = dashboardUrl ?? `${BASE_URL}/owner/properties`;

  return (
    <EmailLayout preview={`Listing received — "${propertyTitle}" is now in review`}>
      <EmailHeader />

      <EmailSection>
        {/* Headline */}
        <Text style={s.headline}>Listing Received</Text>
        <Text style={s.paragraph}>
          Hi {ownerName}, we&apos;ve successfully received your property submission and the
          automated document validation has begun.
        </Text>

        {/* Property summary card */}
        <Section style={{
          backgroundColor: colors.brandLight,
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Property"   value={propertyTitle} />
              <EmailDetailRow label="Address"    value={propertyAddress} />
              <EmailDetailRow label="Type"       value={listingType} />
              <EmailDetailRow label="Submitted"  value={submittedAt} />
              <EmailDetailRow label="Reference"  value={
                <span style={s.refId}>{propertyId}</span>
              } />
            </tbody>
          </table>
        </Section>

        {/* What happens next */}
        <Text style={s.subheading}>What happens next</Text>
        <Text style={s.stepRow}>
          <strong style={{ color: colors.brandDark }}>Step 1 — ML Document Check (Now):</strong>{' '}
          Our system is scanning your submitted documents for authenticity and completeness.
        </Text>
        <Text style={s.stepRow}>
          <strong style={{ color: colors.brandDark }}>Step 2 — Team Physical Vetting (1–3 days):</strong>{' '}
          A RealEST field agent will schedule a visit to verify the property on-site.
        </Text>
        <Text style={s.stepRow}>
          <strong style={{ color: colors.brandDark }}>Step 3 — Listing Goes Live:</strong>{' '}
          Once approved, your property receives a{' '}
          <strong style={{ color: colors.accentDark }}>RealEST Verified</strong> badge and becomes
          publicly searchable.
        </Text>

        {/* Info callout */}
        <EmailAlert variant="info">
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.sm,
            color: colors.info, margin: '0', lineHeight: '1.6',
          }}>
            <strong>Keep your original documents ready.</strong> The field vetting team will
            contact you to arrange a suitable time for the on-site inspection.
          </Text>
        </EmailAlert>

        {/* CTA */}
        <Section style={{ textAlign: 'center', margin: `${spacing['8']} 0 ${spacing['4']}` }}>
          <EmailButton href={dashUrl} variant="primary">
            Track Listing Status →
          </EmailButton>
        </Section>

        <Text style={s.muted}>
          Questions? Reply to this email or visit your{' '}
          <Link href={dashUrl} style={{ color: colors.brandDark, fontWeight: 600 }}>Owner Dashboard</Link>.
          Your reference ID is <span style={s.refId}>{propertyId}</span>.
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

ListingSubmissionEmail.subject = (data: ListingSubmissionEmailData) =>
  `We've received your listing — "${data.propertyTitle}"`;

export const previewProps: ListingSubmissionEmailData = {
  ownerEmail: 'emeka@example.ng',
  ownerName: 'Emeka Okafor',
  propertyTitle: 'Luxury 4-Bedroom Duplex, Victoria Island',
  propertyAddress: '23 Adeola Odeku Street, Victoria Island, Lagos',
  propertyId: 'prop_vi_20260309_001',
  listingType: 'For Sale',
  submittedAt: 'March 9, 2026 at 10:45 AM',
  dashboardUrl: 'https://realest.ng/owner/properties',
};

export default ListingSubmissionEmail;
