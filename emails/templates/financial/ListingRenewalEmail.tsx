import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection, EmailDetailRow } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { EmailAlert } from '../../components/EmailAlert';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ListingRenewalEmailData {
  ownerName: string;
  propertyTitle: string;
  propertyId: string;
  expiryDate: string;
  daysRemaining: number;
  renewalPrice: string;
  currentTier: string;
  renewalUrl?: string;
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
  countdown: {
    fontFamily: fonts.body,
    fontSize: fontSize['3xl'],
    fontWeight: 700 as const,
    color: colors.brandAccent,
    lineHeight: '1',
    margin: `0 0 ${spacing['1']}`,
  },
  countdownLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.accentMuted,
    letterSpacing: '0.08em',
    textTransform: 'uppercase' as const,
    margin: 0,
  },
  monoRef: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: '0.1em',
  },
};

// urgency-aware alert variant
function urgencyVariant(days: number): 'warning' | 'error' {
  return days <= 3 ? 'error' : 'warning';
}

// ─── Component ────────────────────────────────────────────────────────────────
export function ListingRenewalEmail({
  ownerName,
  propertyTitle,
  propertyId,
  expiryDate,
  daysRemaining,
  renewalPrice,
  currentTier,
  renewalUrl,
  dashboardUrl,
}: ListingRenewalEmailData) {
  const renUrl  = renewalUrl  ?? `${BASE_URL}/owner/properties/${propertyId}/renew`;
  const dashUrl = dashboardUrl ?? `${BASE_URL}/owner/properties`;
  const variant = urgencyVariant(daysRemaining);

  return (
    <EmailLayout preview={`Your listing expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} — renew now to stay visible`}>
      <EmailHeader />

      <EmailSection>
        <Text style={s.headline}>Your Listing is Expiring Soon</Text>
        <Text style={s.paragraph}>
          Hi {ownerName}, your RealEST listing for{' '}
          <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong> will expire on{' '}
          <strong>{expiryDate}</strong>. Renew now to keep it visible and continue receiving
          enquiries from verified buyers.
        </Text>

        {/* Countdown block */}
        <Section style={{
          backgroundColor: colors.brandDark,
          padding: `${spacing['8']} ${spacing['6']}`,
          marginBottom: spacing['5'],
          textAlign: 'center' as const,
        }}>
          <Text style={s.countdown}>{daysRemaining}</Text>
          <Text style={s.countdownLabel}>
            {daysRemaining === 1 ? 'day remaining' : 'days remaining'}
          </Text>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.xs,
            color: colors.accentMuted, margin: `${spacing['3']} 0 0`,
          }}>
            Expires {expiryDate}
          </Text>
        </Section>

        {/* Urgency alert */}
        <EmailAlert variant={variant}>
          {daysRemaining <= 3
            ? `Critical: Your listing expires in ${daysRemaining} day${daysRemaining !== 1 ? 's' : ''}. Renew immediately to avoid losing your rank and visibility.`
            : `Heads up — your listing expires in ${daysRemaining} days. Renewing early preserves your listing rank and search placement.`
          }
        </EmailAlert>

        {/* Renewal details */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          margin: `${spacing['5']} 0`,
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Property" value={propertyTitle} />
              <EmailDetailRow label="Property ID" value={
                <span style={s.monoRef}>{propertyId}</span>
              } />
              <EmailDetailRow label="Current Plan" value={currentTier} />
              <EmailDetailRow label="Expiry Date"  value={expiryDate} />
              <EmailDetailRow label="Renewal Price" value={renewalPrice} accent />
            </tbody>
          </table>
        </Section>

        {/* CTAs */}
        <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
          <EmailButton href={renUrl} variant="primary">
            Renew Listing Now →
          </EmailButton>
        </Section>
        <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
          <EmailButton href={dashUrl} variant="secondary">
            View Dashboard
          </EmailButton>
        </Section>

        <Text style={{ ...s.paragraph, marginTop: spacing['4'], fontSize: fontSize.sm, color: colors.textMuted }}>
          If you no longer wish to renew this listing, you can let it expire naturally. Your
          listing will be removed from search results after the expiry date. All historical
          data and enquiry records are preserved.
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

ListingRenewalEmail.subject = (data: ListingRenewalEmailData) =>
  `Action required: "${data.propertyTitle}" expires in ${data.daysRemaining} day${data.daysRemaining !== 1 ? 's' : ''}`;

export const previewProps: ListingRenewalEmailData = {
  ownerName: 'Ngozi Adeyemi',
  propertyTitle: 'Luxury 4-Bedroom Duplex, Victoria Island',
  propertyId: 'prop_vi_20260309_001',
  expiryDate: 'March 16, 2026',
  daysRemaining: 7,
  renewalPrice: '₦145,125',
  currentTier: 'Standard Sale Listing (3 months)',
};

export default ListingRenewalEmail;
