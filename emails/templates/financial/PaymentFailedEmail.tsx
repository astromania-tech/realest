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
export type PaymentFailureReason =
  | 'insufficient_funds'
  | 'card_declined'
  | 'expired_card'
  | 'bank_error'
  | 'network_error'
  | 'unknown';

const failureReasonCopy: Record<PaymentFailureReason, { title: string; description: string }> = {
  insufficient_funds: {
    title: 'Insufficient funds',
    description: 'Your account did not have enough balance to complete this transaction.',
  },
  card_declined: {
    title: 'Card declined',
    description: 'Your bank declined this transaction. Please contact your bank or try a different card.',
  },
  expired_card: {
    title: 'Expired card',
    description: 'The card on file has expired. Please update your payment method and try again.',
  },
  bank_error: {
    title: 'Bank error',
    description: 'Your bank returned an error. Please try again or use a different payment method.',
  },
  network_error: {
    title: 'Network timeout',
    description: 'A network error occurred during processing. Your account has not been charged.',
  },
  unknown: {
    title: 'Payment unsuccessful',
    description: 'We were unable to process your payment. Please try again or contact support.',
  },
};

export interface PaymentFailedEmailData {
  ownerName: string;
  propertyTitle: string;
  propertyId: string;
  failureReason: PaymentFailureReason;
  attemptDate: string;
  amountAttempted: string;
  gracePeriodDate?: string;
  retryUrl?: string;
  supportUrl?: string;
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
  monoRef: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: '0.1em',
  },
  reasonTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    fontWeight: 700 as const,
    color: colors.error,
    margin: `0 0 ${spacing['1']}`,
  },
  reasonDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: '1.6',
    margin: 0,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function PaymentFailedEmail({
  ownerName,
  propertyTitle,
  propertyId,
  failureReason,
  attemptDate,
  amountAttempted,
  gracePeriodDate,
  retryUrl,
  supportUrl,
}: PaymentFailedEmailData) {
  const retUrl = retryUrl  ?? `${BASE_URL}/owner/properties/${propertyId}/renew`;
  const supUrl = supportUrl ?? `${BASE_URL}/support`;
  const reason = failureReasonCopy[failureReason] ?? failureReasonCopy.unknown;

  return (
    <EmailLayout preview={`Payment failed for "${propertyTitle}" — action required`}>
      <EmailHeader />

      <EmailSection>
        <Text style={s.headline}>Payment Failed</Text>

        <EmailAlert variant="error">
          We were unable to process your payment of <strong>{amountAttempted}</strong> for{' '}
          <strong>{propertyTitle}</strong>. Your listing visibility may be affected.
        </EmailAlert>

        <Text style={{ ...s.paragraph, marginTop: spacing['5'] }}>
          Hi {ownerName}, we attempted to process your payment for{' '}
          <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong> on{' '}
          <strong>{attemptDate}</strong>, but it was unsuccessful.
        </Text>

        {/* Failure reason card */}
        <Section style={{
          border: `1.5px solid ${colors.errorBorder}`,
          backgroundColor: colors.errorBg,
          padding: `${spacing['4']} ${spacing['5']}`,
          marginBottom: spacing['5'],
        }}>
          <Text style={s.reasonTitle}>{reason.title}</Text>
          <Text style={s.reasonDesc}>{reason.description}</Text>
        </Section>

        {/* Transaction details */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['5'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Property"       value={propertyTitle} />
              <EmailDetailRow label="Property ID"    value={<span style={s.monoRef}>{propertyId}</span>} />
              <EmailDetailRow label="Amount"         value={amountAttempted} />
              <EmailDetailRow label="Attempted On"   value={attemptDate} />
              {gracePeriodDate && (
                <EmailDetailRow label="Grace Period Until" value={gracePeriodDate} accent />
              )}
            </tbody>
          </table>
        </Section>

        {gracePeriodDate && (
          <EmailAlert variant="warning">
            You have until <strong>{gracePeriodDate}</strong> to complete payment before your
            listing is paused and removed from search results.
          </EmailAlert>
        )}

        {/* CTAs */}
        <Section style={{ textAlign: 'center', margin: `${spacing['5']} 0 ${spacing['4']}` }}>
          <EmailButton href={retUrl} variant="primary">
            Retry Payment →
          </EmailButton>
        </Section>
        <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
          <EmailButton href={supUrl} variant="secondary">
            Contact Support
          </EmailButton>
        </Section>

        <Text style={{ ...s.paragraph, fontSize: fontSize.sm, color: colors.textMuted }}>
          Your account has not been charged. If you believe this is an error, please{' '}
          <Link href={supUrl} style={{ color: colors.brandDark, fontWeight: 600 }}>
            contact our billing team
          </Link>
          {' '}or write to{' '}
          <Link href="mailto:billing@realest.ng" style={{ color: colors.brandDark, fontWeight: 600 }}>
            billing@realest.ng
          </Link>
          .
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

PaymentFailedEmail.subject = (data: PaymentFailedEmailData) =>
  `Payment failed for "${data.propertyTitle}" — please retry`;

export const previewProps: PaymentFailedEmailData = {
  ownerName: 'Ngozi Adeyemi',
  propertyTitle: 'Luxury 4-Bedroom Duplex, Victoria Island',
  propertyId: 'prop_vi_20260309_001',
  failureReason: 'insufficient_funds',
  attemptDate: 'March 9, 2026 at 2:14 PM',
  amountAttempted: '₦145,125',
  gracePeriodDate: 'March 16, 2026',
};

export default PaymentFailedEmail;
