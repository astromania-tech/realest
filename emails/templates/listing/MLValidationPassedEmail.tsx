import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection, EmailDetailRow, VerifiedBadge } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { EmailAlert } from '../../components/EmailAlert';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface MLValidationPassedEmailData {
  ownerName: string;
  ownerEmail: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyId: string;
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
  stepActive: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: '1.6',
    margin: `0 0 ${spacing['3']}`,
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
export function MLValidationPassedEmail({
  ownerName,
  propertyTitle,
  propertyAddress,
  propertyId,
  dashboardUrl,
}: MLValidationPassedEmailData) {
  const dashUrl = dashboardUrl ?? `${BASE_URL}/owner/properties`;

  return (
    <EmailLayout preview={`Step 1 complete — documents verified for "${propertyTitle}"`}>
      <EmailHeader />

      <EmailSection>
        {/* Badge + Headline */}
        <Section style={{ marginBottom: spacing['4'] }}>
          <VerifiedBadge>✓ Step 1 Complete</VerifiedBadge>
        </Section>
        <Text style={s.headline}>Documents Verified</Text>
        <Text style={s.paragraph}>
          Hi {ownerName}, great news! Our ML document validation system has analysed the
          documents for <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong> and
          everything checks out.
        </Text>

        {/* Property card */}
        <Section style={{
          backgroundColor: colors.successBg,
          border: `1px solid ${colors.successBorder}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Property"  value={propertyTitle} />
              <EmailDetailRow label="Address"   value={propertyAddress} />
              <EmailDetailRow label="ML Status" value="Passed — All documents verified" accent />
              <EmailDetailRow label="Reference" value={
                <span style={s.refId}>{propertyId}</span>
              } />
            </tbody>
          </table>
        </Section>

        {/* Progress steps */}
        <Text style={s.stepActive}>
          <strong style={{ color: colors.success }}>✓ Step 1 — ML Document Check:</strong>{' '}
          Complete. Documents are authentic and complete.
        </Text>
        <Text style={s.stepActive}>
          <strong style={{ color: colors.brandDark }}>→ Step 2 — Physical Vetting:</strong>{' '}
          A RealEST field agent will contact you shortly to schedule an on-site inspection.
        </Text>
        <Text style={s.stepActive}>
          <strong style={{ color: colors.textMuted }}>Step 3 — Listing Goes Live:</strong>{' '}
          Pending physical vetting approval.
        </Text>

        {/* Info callout */}
        <EmailAlert variant="brand">
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.sm,
            color: colors.accentDark, margin: '0', lineHeight: '1.6',
          }}>
            <strong>Prepare for the on-site visit.</strong> Have your original title documents,
            survey plan, and government ID ready for the field agent&apos;s inspection.
          </Text>
        </EmailAlert>

        {/* CTA */}
        <Section style={{ textAlign: 'center', margin: `${spacing['8']} 0 ${spacing['4']}` }}>
          <EmailButton href={dashUrl} variant="primary">
            View Listing Status →
          </EmailButton>
        </Section>

        <Text style={s.muted}>
          Reference: <span style={s.refId}>{propertyId}</span>
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

MLValidationPassedEmail.subject = (data: MLValidationPassedEmailData) =>
  `✓ Documents verified — "${data.propertyTitle}" moves to physical vetting`;

export const previewProps: MLValidationPassedEmailData = {
  ownerEmail: 'emeka@example.ng',
  ownerName: 'Emeka Okafor',
  propertyTitle: 'Luxury 4-Bedroom Duplex, Victoria Island',
  propertyAddress: '23 Adeola Odeku Street, Victoria Island, Lagos',
  propertyId: 'prop_vi_20260309_001',
};

export default MLValidationPassedEmail;
