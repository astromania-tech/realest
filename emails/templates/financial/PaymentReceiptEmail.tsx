import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection, EmailDetailRow, VerifiedBadge } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PaymentReceiptEmailData {
  ownerName: string;
  ownerEmail: string;
  receiptNumber: string;
  paymentDate: string;
  paymentMethod: string;
  transactionRef: string;
  propertyTitle: string;
  propertyId: string;
  tier: string;
  amountPaid: string;
  listingUrl?: string;
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
  monoRef: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: '0.1em',
  },
  amountPaid: {
    fontFamily: fonts.body,
    fontSize: fontSize['3xl'],
    fontWeight: 700 as const,
    color: colors.brandLight,
    letterSpacing: '-0.02em',
    margin: `${spacing['1']} 0 0`,
    lineHeight: '1',
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
export function PaymentReceiptEmail({
  ownerName,
  receiptNumber,
  paymentDate,
  paymentMethod,
  transactionRef,
  propertyTitle,
  propertyId,
  tier,
  amountPaid,
  listingUrl,
  dashboardUrl,
}: PaymentReceiptEmailData) {
  const pubUrl  = listingUrl  ?? `${BASE_URL}/properties/${propertyId}`;
  const dashUrl = dashboardUrl ?? `${BASE_URL}/owner/properties`;

  return (
    <EmailLayout preview={`Payment confirmed — ${amountPaid} received for "${propertyTitle}"`}>
      <EmailHeader />

      <EmailSection>
        {/* Badge + Headline */}
        <Section style={{ marginBottom: spacing['4'] }}>
          <VerifiedBadge>✓ Payment Confirmed</VerifiedBadge>
        </Section>
        <Text style={s.headline}>Payment Received</Text>
        <Text style={s.paragraph}>
          Hi {ownerName}, thank you! We have successfully received your payment for{' '}
          <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong>. Your listing
          is now active.
        </Text>

        {/* Amount hero */}
        <Section style={{
          backgroundColor: colors.brandDark,
          padding: `${spacing['8']} ${spacing['6']}`,
          marginBottom: spacing['6'],
          textAlign: 'center' as const,
        }}>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.xs, fontWeight: 700,
            color: colors.brandAccent, textTransform: 'uppercase' as const,
            letterSpacing: '0.15em', margin: `0 0 ${spacing['2']}`,
          }}>
            Amount Paid
          </Text>
          <Text style={s.amountPaid}>{amountPaid}</Text>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.xs,
            color: colors.accentMuted, margin: `${spacing['3']} 0 0`,
          }}>
            {paymentDate}
          </Text>
        </Section>

        {/* Receipt details */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Receipt No."    value={
                <span style={s.monoRef}>{receiptNumber}</span>
              } />
              <EmailDetailRow label="Transaction Ref" value={
                <span style={s.monoRef}>{transactionRef}</span>
              } />
              <EmailDetailRow label="Payment Method" value={paymentMethod} />
              <EmailDetailRow label="Property"       value={propertyTitle} />
              <EmailDetailRow label="Plan"           value={tier} />
              <EmailDetailRow label="Amount"         value={amountPaid} accent />
            </tbody>
          </table>
        </Section>

        {/* CTAs */}
        <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
          <EmailButton href={pubUrl} variant="primary">
            View Your Live Listing →
          </EmailButton>
        </Section>
        <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
          <EmailButton href={dashUrl} variant="secondary">
            Go to Dashboard
          </EmailButton>
        </Section>

        <Text style={s.muted}>
          Keep this email as your payment record. Receipt{' '}
          <span style={s.monoRef}>{receiptNumber}</span>
          {' · '}
          <Link href="mailto:billing@realest.ng" style={{ color: colors.brandDark, fontWeight: 600 }}>
            Billing support
          </Link>
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

PaymentReceiptEmail.subject = (data: PaymentReceiptEmailData) =>
  `Payment confirmed — ${data.amountPaid} received (${data.receiptNumber})`;

export const previewProps: PaymentReceiptEmailData = {
  ownerEmail: 'emeka@example.ng',
  ownerName: 'Emeka Okafor',
  receiptNumber: 'RCT-2026-03-0042',
  paymentDate: 'March 9, 2026 at 11:32 AM',
  paymentMethod: 'Paystack — Mastercard ···4242',
  transactionRef: 'ps_txn_1R2a3b4c5d6e7f',
  propertyTitle: 'Luxury 4-Bedroom Duplex, Victoria Island',
  propertyId: 'prop_vi_20260309_001',
  tier: 'Standard Sale Listing (3 months)',
  amountPaid: '₦145,125',
};

export default PaymentReceiptEmail;
