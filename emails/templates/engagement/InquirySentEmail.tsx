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
export interface InquirySentEmailData {
  buyerName: string;
  buyerEmail: string;
  ownerName: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyId: string;
  listingType: string;
  message: string;
  latitude?: string;
  longitude?: string;
  mapsUrl?: string;
  listingUrl?: string;
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
  coords: {
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.brandDark,
    fontWeight: 600 as const,
    letterSpacing: '0.05em',
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
export function InquirySentEmail({
  buyerName,
  ownerName,
  propertyTitle,
  propertyAddress,
  propertyId,
  listingType,
  message,
  latitude,
  longitude,
  mapsUrl,
  listingUrl,
}: InquirySentEmailData) {
  const pubUrl  = listingUrl ?? `${BASE_URL}/properties/${propertyId}`;
  const hasCoords = latitude && longitude;

  return (
    <EmailLayout preview={`Inquiry sent to ${ownerName} — we'll notify you when they respond`}>
      <EmailHeader />

      <EmailSection>
        {/* Headline */}
        <Text style={s.headline}>Inquiry Sent!</Text>
        <Text style={s.paragraph}>
          Hi {buyerName}, your inquiry for{' '}
          <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong> has been
          delivered to the owner. We&apos;ll notify you as soon as they respond.
        </Text>

        {/* Property card */}
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
              {hasCoords && (
                <EmailDetailRow label="Coordinates" value={
                  <span style={s.coords}>{latitude}, {longitude}</span>
                } />
              )}
            </tbody>
          </table>
        </Section>

        {/* Your message */}
        <Section style={{
          backgroundColor: colors.pageBg,
          border: `1px solid ${colors.border}`,
          borderLeft: `4px solid ${colors.brandDark}`,
          padding: `${spacing['5']} ${spacing['5']}`,
          marginBottom: spacing['6'],
        }}>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted,
            margin: `0 0 ${spacing['3']}`, textTransform: 'uppercase' as const, letterSpacing: '0.8px',
          }}>
            Your message
          </Text>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.base,
            color: colors.text, lineHeight: '1.7', margin: '0', fontStyle: 'italic',
          }}>
            &ldquo;{message}&rdquo;
          </Text>
        </Section>

        {/* Directions callout */}
        {mapsUrl && (
          <EmailAlert variant="brand">
            <Text style={{
              fontFamily: fonts.body, fontSize: fontSize.sm,
              color: colors.accentDark, margin: '0', lineHeight: '1.6',
            }}>
              <strong>Get Directions:</strong> Explore the verified location now.{' '}
              <Link href={mapsUrl} style={{ color: colors.accentDark, fontWeight: 700 }}>
                Open in Google Maps →
              </Link>
            </Text>
          </EmailAlert>
        )}

        {/* CTA */}
        <Section style={{ textAlign: 'center', margin: `${spacing['8']} 0 ${spacing['4']}` }}>
          <EmailButton href={pubUrl} variant="primary">
            View Property Listing →
          </EmailButton>
        </Section>

        <Text style={s.muted}>
          The owner will reply directly to your registered email address.
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

InquirySentEmail.subject = (data: InquirySentEmailData) =>
  `Your inquiry for "${data.propertyTitle}" has been sent`;

export const previewProps: InquirySentEmailData = {
  buyerEmail: 'kemi@example.ng',
  buyerName: 'Kemi Adeyemi',
  ownerName: 'Emeka Okafor',
  propertyTitle: '3-Bedroom Flat, Lekki Phase 1',
  propertyAddress: '14 Admiralty Way, Lekki Phase 1, Lagos',
  propertyId: 'prop_lk1_20260309_042',
  listingType: 'For Rent',
  message: 'Hello, I am very interested in this property. Is it still available? I would like to schedule a viewing this weekend if possible.',
  latitude: '6.4281',
  longitude: '3.4568',
  mapsUrl: 'https://maps.google.com/?q=6.4281,3.4568',
};

export default InquirySentEmail;
