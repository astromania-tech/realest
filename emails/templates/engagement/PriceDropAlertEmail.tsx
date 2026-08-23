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
export interface PriceDropAlertEmailData {
  recipientName: string;
  recipientEmail: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyId: string;
  listingType: string;
  previousPrice: string;
  newPrice: string;
  dropAmount: string;
  dropPercent: string;
  listingUrl?: string;
  unsubscribeUrl?: string;
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
  pricePrevious: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textDecoration: 'line-through' as const,
    margin: '0',
  },
  priceNew: {
    fontFamily: fonts.body,
    fontSize: fontSize['3xl'],
    fontWeight: 700 as const,
    color: colors.brandDark,
    letterSpacing: '-0.02em',
    margin: `0 0 ${spacing['1']}`,
    lineHeight: '1',
  },
  priceDrop: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: 700 as const,
    color: colors.success,
    margin: '0',
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
export function PriceDropAlertEmail({
  recipientName,
  propertyTitle,
  propertyAddress,
  propertyId,
  listingType,
  previousPrice,
  newPrice,
  dropAmount,
  dropPercent,
  listingUrl,
  unsubscribeUrl,
}: PriceDropAlertEmailData) {
  const pubUrl = listingUrl ?? `${BASE_URL}/properties/${propertyId}`;

  return (
    <EmailLayout preview={`Price drop alert: ${propertyTitle} is now ${newPrice}`}>
      <EmailHeader />

      <EmailSection>
        {/* Headline */}
        <Text style={s.headline}>Price Drop Alert</Text>
        <Text style={s.paragraph}>
          Hi {recipientName}, a property you saved has had its price reduced. This might be
          the right moment to make your move.
        </Text>

        {/* Price hero */}
        <Section style={{
          backgroundColor: colors.successBg,
          border: `1px solid ${colors.successBorder}`,
          padding: `${spacing['8']} ${spacing['6']}`,
          marginBottom: spacing['6'],
          textAlign: 'center' as const,
        }}>
          <Text style={s.pricePrevious}>{previousPrice}</Text>
          <Text style={s.priceNew}>{newPrice}</Text>
          <Text style={s.priceDrop}>
            ↓ {dropAmount} ({dropPercent} off)
          </Text>
        </Section>

        {/* Property card */}
        <Section style={{
          backgroundColor: colors.brandLight,
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Property" value={propertyTitle} />
              <EmailDetailRow label="Address"  value={propertyAddress} />
              <EmailDetailRow label="Type"     value={listingType} />
              <EmailDetailRow label="New Price" value={newPrice} accent />
            </tbody>
          </table>
        </Section>

        {/* Urgency callout */}
        <EmailAlert variant="brand">
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.sm,
            color: colors.accentDark, margin: '0', lineHeight: '1.6',
          }}>
            <strong>Act fast.</strong> Price drops on verified properties attract multiple
            inquiries. Contact the owner now to secure your viewing.
          </Text>
        </EmailAlert>

        {/* CTA */}
        <Section style={{ textAlign: 'center', margin: `${spacing['8']} 0 ${spacing['4']}` }}>
          <EmailButton href={pubUrl} variant="primary">
            View Property &amp; Enquire →
          </EmailButton>
        </Section>

        <Text style={s.muted}>
          You received this alert because you saved this property.{' '}
          {unsubscribeUrl && !unsubscribeUrl.startsWith('{') && (
            <Link href={unsubscribeUrl} style={{ color: colors.textMuted }}>
              Manage alerts
            </Link>
          )}
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={!!unsubscribeUrl} unsubscribeUrl={unsubscribeUrl} />
    </EmailLayout>
  );
}

PriceDropAlertEmail.subject = (data: PriceDropAlertEmailData) =>
  `Price drop: "${data.propertyTitle}" is now ${data.newPrice}`;

export const previewProps: PriceDropAlertEmailData = {
  recipientEmail: 'kemi@example.ng',
  recipientName: 'Kemi Adeyemi',
  propertyTitle: '3-Bedroom Flat, Lekki Phase 1',
  propertyAddress: '14 Admiralty Way, Lekki Phase 1, Lagos',
  propertyId: 'prop_lk1_20260309_042',
  listingType: 'For Rent',
  previousPrice: '₦2,500,000/yr',
  newPrice: '₦2,100,000/yr',
  dropAmount: '₦400,000',
  dropPercent: '16%',
};

export default PriceDropAlertEmail;
