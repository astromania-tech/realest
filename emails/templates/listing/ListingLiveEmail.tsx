import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection, EmailDetailRow, VerifiedBadge } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ListingLiveEmailData {
  ownerName: string;
  ownerEmail: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyId: string;
  listingType: string;
  price: string;
  latitude?: string;
  longitude?: string;
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
  heroBg: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['10']} ${spacing['8']}`,
    textAlign: 'center' as const,
    marginBottom: spacing['6'],
  },
  heroLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    margin: `0 0 ${spacing['3']}`,
  },
  heroHeadline: {
    fontFamily: fonts.body,
    fontSize: fontSize['3xl'],
    fontWeight: 700 as const,
    color: colors.brandLight,
    letterSpacing: '-0.02em',
    lineHeight: '1.1',
    margin: `0 0 ${spacing['3']}`,
  },
  heroSubtext: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.accentMuted,
    margin: '0',
    lineHeight: '1.5',
  },
  coords: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: '0.05em',
  },
  refId: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: '0.1em',
  },
  shareRow: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center' as const,
    margin: `${spacing['4']} 0 0`,
    lineHeight: '1.6',
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
export function ListingLiveEmail({
  ownerName,
  propertyTitle,
  propertyAddress,
  propertyId,
  listingType,
  price,
  latitude,
  longitude,
  listingUrl,
  dashboardUrl,
}: ListingLiveEmailData) {
  const pubUrl  = listingUrl  ?? `${BASE_URL}/properties/${propertyId}`;
  const dashUrl = dashboardUrl ?? `${BASE_URL}/owner/properties`;
  const hasCoords = latitude && longitude;

  return (
    <EmailLayout preview={`Your property is live! "${propertyTitle}" is now RealEST Verified ✓`}>
      <EmailHeader />

      {/* Hero section */}
      <Section style={s.heroBg}>
        <Text style={s.heroLabel}>Congratulations</Text>
        <Text style={s.heroHeadline}>Your Property is Live!</Text>
        <Text style={s.heroSubtext}>
          {propertyTitle} is now{' '}
          <strong style={{ color: colors.brandAccent }}>RealEST Verified</strong>{' '}
          and publicly searchable.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>
          Hi {ownerName}, your listing has passed our dual-layer verification process — both
          ML document validation and physical on-site vetting — and is now live on RealEST.
        </Text>

        {/* Verified badge */}
        <Section style={{ marginBottom: spacing['5'] }}>
          <VerifiedBadge>✓ RealEST Verified</VerifiedBadge>
        </Section>

        {/* Listing details */}
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
              <EmailDetailRow label="Type"      value={listingType} />
              <EmailDetailRow label="Price"     value={price} accent />
              {hasCoords && (
                <EmailDetailRow label="Geo-Tag" value={
                  <span style={s.coords}>{latitude}, {longitude}</span>
                } />
              )}
              <EmailDetailRow label="Listing ID" value={
                <span style={s.refId}>{propertyId}</span>
              } />
            </tbody>
          </table>
        </Section>

        {/* Primary CTA */}
        <Section style={{ textAlign: 'center', margin: `${spacing['6']} 0 ${spacing['4']}` }}>
          <EmailButton href={pubUrl} variant="primary">
            View Your Live Listing →
          </EmailButton>
        </Section>

        {/* Secondary CTA */}
        <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
          <EmailButton href={dashUrl} variant="secondary">
            Go to Owner Dashboard
          </EmailButton>
        </Section>

        {/* Share nudge */}
        <Text style={s.shareRow}>
          Share your verified listing: copy the link below and post on WhatsApp, Instagram,
          or X to reach even more buyers and tenants.
          <br />
          <Link href={pubUrl} style={{ color: colors.brandDark, fontWeight: 600, wordBreak: 'break-all' }}>
            {pubUrl}
          </Link>
        </Text>

        <Text style={s.muted}>
          Reference: <span style={s.refId}>{propertyId}</span>
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

ListingLiveEmail.subject = (data: ListingLiveEmailData) =>
  `🎉 Your listing is LIVE — "${data.propertyTitle}" is now RealEST Verified`;

export const previewProps: ListingLiveEmailData = {
  ownerEmail: 'emeka@example.ng',
  ownerName: 'Emeka Okafor',
  propertyTitle: 'Luxury 4-Bedroom Duplex, Victoria Island',
  propertyAddress: '23 Adeola Odeku Street, Victoria Island, Lagos',
  propertyId: 'prop_vi_20260309_001',
  listingType: 'For Sale',
  price: '₦185,000,000',
  latitude: '6.4281',
  longitude: '3.4219',
  listingUrl: 'https://realest.ng/properties/prop_vi_20260309_001',
};

export default ListingLiveEmail;
