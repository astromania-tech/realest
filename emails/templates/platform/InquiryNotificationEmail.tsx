import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface InquiryEmailData {
  recipientName: string;
  recipientEmail: string;
  senderName: string;
  senderEmail: string;
  senderPhone?: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyId: string;
  listingType: string;
  message: string;
}

function formatListingType(type: string | undefined): string {
  if (!type) return '';
  const map: Record<string, string> = {
    for_rent: 'For Rent',
    for_sale: 'For Sale',
    for_lease: 'For Lease',
    short_let: 'Short Let',
  };
  return map[type] ?? type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

// ─── Component ────────────────────────────────────────────────────────────────
export function InquiryNotificationEmail({
  recipientName,
  senderName,
  senderEmail,
  senderPhone,
  propertyTitle,
  propertyAddress,
  propertyId,
  listingType,
  message,
}: InquiryEmailData) {
  const propertyUrl = `${BASE_URL}/properties/${propertyId}`;
  const replyUrl    = `mailto:${senderEmail}`;
  const contactRows: Array<[string, string]> = [
    ['Name',  senderName],
    ['Email', senderEmail],
    ...(senderPhone ? [['Phone', senderPhone] as [string, string]] : []),
  ];

  return (
    <EmailLayout preview={`New inquiry from ${senderName} for ${propertyTitle}`}>
      <EmailHeader />

      <EmailSection>
        <Text style={{ fontFamily: fonts.body, fontSize: fontSize.base, color: colors.text, lineHeight: '1.65', margin: `0 0 ${spacing['4']}` }}>
          Hi {recipientName},
        </Text>
        <Text style={{ fontFamily: fonts.body, fontSize: fontSize.base, color: colors.text, lineHeight: '1.65', margin: `0 0 ${spacing['6']}` }}>
          <strong style={{ color: colors.brandDark }}>{senderName}</strong> has sent an inquiry about your listing.
        </Text>

        {/* Property details */}
        <Section style={{
          backgroundColor: colors.brandLight,
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <Text style={{ fontFamily: fonts.heading, fontSize: fontSize.md, fontWeight: 700, color: colors.brandDark, margin: `0 0 ${spacing['1']}` }}>
            {propertyTitle}
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, margin: `0 0 ${spacing['4']}` }}>
            {propertyAddress} · {formatListingType(listingType)}
          </Text>
          <Link href={propertyUrl} style={{ fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.brandDark, fontWeight: 600, textDecoration: 'underline' }}>
            View listing →
          </Link>
        </Section>

        {/* Message */}
        <Section style={{
          backgroundColor: colors.pageBg,
          border: `1px solid ${colors.border}`,
          borderLeft: `4px solid ${colors.brandDark}`,
          padding: `${spacing['5']} ${spacing['5']}`,
          marginBottom: spacing['8'],
        }}>
          <Text style={{ fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, margin: `0 0 ${spacing['3']}`, textTransform: 'uppercase' as const, letterSpacing: '0.8px' }}>
            Inquiry Message
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: fontSize.base, color: colors.text, lineHeight: '1.7', margin: '0', fontStyle: 'italic' }}>
            "{message}"
          </Text>
        </Section>

        {/* Sender details */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <Text style={{ fontFamily: fonts.heading, fontSize: fontSize.sm, fontWeight: 700, color: colors.text, margin: `0 0 ${spacing['4']}`, textTransform: 'uppercase' as const, letterSpacing: '0.8px' }}>
            Contact Details
          </Text>
          {contactRows.map(([label, value]) => (
            <Text key={label} style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text, margin: `0 0 ${spacing['3']}`, paddingBottom: spacing['2'], borderBottom: `1px solid ${colors.borderLight}` }}>
              <strong style={{ fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, textTransform: 'uppercase' as const, letterSpacing: '0.8px', fontWeight: 600 }}>{label}:</strong>{' '}{value}
            </Text>
          ))}
        </Section>

        {/* CTA */}
        <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
          <EmailButton href={replyUrl} variant="primary">
            Reply to {senderName}
          </EmailButton>
        </Section>

        <Text style={{ fontFamily: fonts.body, fontSize: fontSize.xs, color: colors.textMuted, margin: '0', textAlign: 'center' as const, lineHeight: '1.6' }}>
          Replying will open your email client addressed directly to {senderEmail}.
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

InquiryNotificationEmail.subject = (data: InquiryEmailData) =>
  `New inquiry for "${data.propertyTitle}" from ${data.senderName}`;

export const previewProps: InquiryEmailData = {
  recipientEmail: 'babatunde@example.ng',
  recipientName: 'Babatunde',
  senderName: 'Kemi Adeyemi',
  senderEmail: 'kemi@example.ng',
  senderPhone: '+2348012345678',
  propertyTitle: '3-Bedroom Flat, Lekki Phase 1',
  propertyAddress: '14 Admiralty Way, Lekki Phase 1, Lagos',
  propertyId: 'prop_preview_001',
  listingType: 'for_rent',
  message: 'Hello, I am interested in the property. Is it still available? I would like to schedule a viewing this weekend.',
};

export default InquiryNotificationEmail;
