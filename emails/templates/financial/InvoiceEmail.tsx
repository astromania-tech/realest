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
export interface InvoiceEmailData {
  ownerName: string;
  ownerEmail: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyId: string;
  listingType: string;
  tier: string;
  subtotal: string;
  vatAmount: string;
  totalDue: string;
  paymentUrl?: string;
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
  invoiceRef: {
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    letterSpacing: '0.1em',
  },
  totalLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    margin: '0',
  },
  totalValue: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandDark,
    letterSpacing: '-0.02em',
    margin: `${spacing['1']} 0 0`,
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
export function InvoiceEmail({
  ownerName,
  invoiceNumber,
  invoiceDate,
  dueDate,
  propertyTitle,
  propertyAddress,
  propertyId,
  listingType,
  tier,
  subtotal,
  vatAmount,
  totalDue,
  paymentUrl,
}: InvoiceEmailData) {
  const payUrl = paymentUrl ?? `${BASE_URL}/owner/billing/${invoiceNumber}`;

  return (
    <EmailLayout preview={`Invoice ${invoiceNumber} — ₦${totalDue} due for "${propertyTitle}"`}>
      <EmailHeader />

      <EmailSection>
        {/* Headline */}
        <Text style={s.headline}>Your Invoice</Text>
        <Text style={s.paragraph}>
          Hi {ownerName}, please find your invoice below for the listing fee associated with{' '}
          <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong>. Payment is
          required to publish your listing.
        </Text>

        {/* Invoice meta */}
        <Section style={{
          backgroundColor: colors.brandLight,
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Invoice No."  value={
                <span style={s.invoiceRef}>{invoiceNumber}</span>
              } />
              <EmailDetailRow label="Issue Date"   value={invoiceDate} />
              <EmailDetailRow label="Due Date"     value={dueDate} />
            </tbody>
          </table>
        </Section>

        {/* Line items */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.xs, fontWeight: 700,
            color: colors.textMuted, textTransform: 'uppercase' as const,
            letterSpacing: '0.1em', margin: `0 0 ${spacing['4']}`,
          }}>
            Line Items
          </Text>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Property"      value={propertyTitle} />
              <EmailDetailRow label="Address"       value={propertyAddress} />
              <EmailDetailRow label="Listing Type"  value={listingType} />
              <EmailDetailRow label="Plan"          value={tier} />
              <EmailDetailRow label="Subtotal"      value={subtotal} />
              <EmailDetailRow label="VAT (7.5%)"    value={vatAmount} />
              <EmailDetailRow label="Total Due"     value={totalDue} accent />
            </tbody>
          </table>
        </Section>

        {/* Total hero */}
        <Section style={{
          backgroundColor: colors.brandDark,
          padding: `${spacing['6']}`,
          textAlign: 'center' as const,
          marginBottom: spacing['6'],
        }}>
          <Text style={s.totalLabel}>Total Due</Text>
          <Text style={{ ...s.totalValue, color: colors.brandAccent }}>{totalDue}</Text>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.xs,
            color: colors.accentMuted, margin: `${spacing['1']} 0 0`,
          }}>
            Due: {dueDate}
          </Text>
        </Section>

        {/* Due date alert */}
        <EmailAlert variant="info">
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.sm,
            color: colors.info, margin: '0', lineHeight: '1.6',
          }}>
            Your listing will only go live after payment is confirmed. Pay before{' '}
            <strong>{dueDate}</strong> to avoid delays.
          </Text>
        </EmailAlert>

        {/* CTA */}
        <Section style={{ textAlign: 'center', margin: `${spacing['8']} 0 ${spacing['4']}` }}>
          <EmailButton href={payUrl} variant="primary">
            Pay Now →
          </EmailButton>
        </Section>

        <Text style={s.muted}>
          Invoice{' '}
          <span style={s.invoiceRef}>{invoiceNumber}</span>
          {' · '}
          <Link href="mailto:billing@realest.ng" style={{ color: colors.brandDark, fontWeight: 600 }}>
            Billing questions?
          </Link>
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

InvoiceEmail.subject = (data: InvoiceEmailData) =>
  `Invoice ${data.invoiceNumber} — ${data.totalDue} due for "${data.propertyTitle}"`;

export const previewProps: InvoiceEmailData = {
  ownerEmail: 'emeka@example.ng',
  ownerName: 'Emeka Okafor',
  invoiceNumber: 'INV-2026-03-0042',
  invoiceDate: 'March 9, 2026',
  dueDate: 'March 16, 2026',
  propertyTitle: 'Luxury 4-Bedroom Duplex, Victoria Island',
  propertyAddress: '23 Adeola Odeku Street, Victoria Island, Lagos',
  propertyId: 'prop_vi_20260309_001',
  listingType: 'For Sale',
  tier: 'Standard Sale Listing (3 months)',
  subtotal: '₦135,000',
  vatAmount: '₦10,125',
  totalDue: '₦145,125',
};

export default InvoiceEmail;
