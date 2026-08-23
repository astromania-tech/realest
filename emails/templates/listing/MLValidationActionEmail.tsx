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
export type MLFlagReason =
  | 'blurry_document'
  | 'wrong_document_type'
  | 'expired_document'
  | 'mismatched_details'
  | 'incomplete_submission'
  | 'other';

export interface MLValidationActionEmailData {
  ownerName: string;
  ownerEmail: string;
  propertyTitle: string;
  propertyId: string;
  flaggedDocuments: string[];
  flagReason: MLFlagReason;
  reuploadUrl?: string;
}

const FLAG_MESSAGES: Record<MLFlagReason, { title: string; description: string }> = {
  blurry_document: {
    title: 'Poor image quality',
    description: 'One or more documents could not be read clearly. Please re-scan or photograph in good lighting at a higher resolution.',
  },
  wrong_document_type: {
    title: 'Incorrect document type',
    description: 'The uploaded file does not match the required document type for this field. Please check the submission requirements.',
  },
  expired_document: {
    title: 'Expired document',
    description: 'One or more documents appear to be past their validity date. Please provide a current version.',
  },
  mismatched_details: {
    title: 'Mismatched information',
    description: 'The details on the document do not match the information provided in your listing. Please check for consistency.',
  },
  incomplete_submission: {
    title: 'Incomplete submission',
    description: 'One or more required documents are missing. Please review the required documents list and upload all items.',
  },
  other: {
    title: 'Action required',
    description: 'Our system flagged an issue with your submission. Please review and re-upload the affected documents.',
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
  docItem: {
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.error,
    margin: `0 0 ${spacing['2']}`,
    lineHeight: '1.5',
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
export function MLValidationActionEmail({
  ownerName = '',
  propertyTitle = '',
  propertyId = '',
  flaggedDocuments = [],
  flagReason = 'other',
  reuploadUrl,
}: MLValidationActionEmailData) {
  const flag = FLAG_MESSAGES[flagReason] ?? FLAG_MESSAGES.other;
  const dashUrl = reuploadUrl ?? `${BASE_URL}/owner/properties/${propertyId}/documents`;

  return (
    <EmailLayout preview={`Action required — document update needed for "${propertyTitle}"`}>
      <EmailHeader />

      <EmailSection>
        {/* Headline */}
        <Text style={s.headline}>Action Required</Text>
        <Text style={s.paragraph}>
          Hi {ownerName}, our document validation system has reviewed the submission for{' '}
          <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong> and flagged an
          issue that needs your attention before we can proceed with physical vetting.
        </Text>

        {/* Warning callout */}
        <EmailAlert variant="warning">
          <p style={{
            fontFamily: fonts.body, fontSize: fontSize.sm, fontWeight: 700,
            color: colors.warning, margin: `0 0 ${spacing['1']}`, lineHeight: '1.4',
          }}>
            {flag.title}
          </p>
          <p style={{
            fontFamily: fonts.body, fontSize: fontSize.sm,
            color: colors.warning, margin: '0', lineHeight: '1.6',
          }}>
            {flag.description}
          </p>
        </EmailAlert>

        {/* Flagged documents */}
        {flaggedDocuments.length > 0 && (
          <Section style={{
            backgroundColor: colors.errorBg,
            border: `1px solid ${colors.errorBorder}`,
            padding: `${spacing['5']} ${spacing['6']}`,
            marginBottom: spacing['6'],
          }}>
            <Text style={{
              fontFamily: fonts.body, fontSize: fontSize.xs, fontWeight: 700,
              color: colors.error, textTransform: 'uppercase' as const,
              letterSpacing: '0.1em', margin: `0 0 ${spacing['3']}`,
            }}>
              Flagged Documents
            </Text>
            {flaggedDocuments.map((doc, i) => (
              <Text key={i} style={s.docItem}>⚠ {doc}</Text>
            ))}
          </Section>
        )}

        {/* Steps to fix */}
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
            Steps to Fix
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text, lineHeight: '1.6', margin: `0 0 ${spacing['2']}` }}>
            1. Log in to your Owner Dashboard and navigate to this listing.
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text, lineHeight: '1.6', margin: `0 0 ${spacing['2']}` }}>
            2. Open the <strong>Documents</strong> section and re-upload the flagged files.
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text, lineHeight: '1.6', margin: '0' }}>
            3. Submit again — the ML scan will restart automatically.
          </Text>
        </Section>

        {/* CTA */}
        <Section style={{ textAlign: 'center', margin: `${spacing['8']} 0 ${spacing['4']}` }}>
          <EmailButton href={dashUrl} variant="primary">
            Fix &amp; Resubmit Documents →
          </EmailButton>
        </Section>

        <Text style={s.muted}>
          Reference: <span style={s.refId}>{propertyId}</span>
          {' · '}
          <Link href={`mailto:support@realest.ng`} style={{ color: colors.brandDark, fontWeight: 600 }}>
            Contact Support
          </Link>
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

MLValidationActionEmail.subject = (data: MLValidationActionEmailData) =>
  `Action required — update documents for "${data.propertyTitle}"`;

export const previewProps: MLValidationActionEmailData = {
  ownerEmail: 'emeka@example.ng',
  ownerName: 'Emeka Okafor',
  propertyTitle: 'Luxury 4-Bedroom Duplex, Victoria Island',
  propertyId: 'prop_vi_20260309_001',
  flaggedDocuments: ['Certificate of Occupancy (C of O)', 'Survey Plan'],
  flagReason: 'blurry_document',
};

export default MLValidationActionEmail;
