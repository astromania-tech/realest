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
export interface ViewingReminderEmailData {
  recipientName: string;
  recipientEmail: string;
  recipientType: 'buyer' | 'owner';
  propertyTitle: string;
  propertyAddress: string;
  propertyId: string;
  viewingDate: string;
  viewingTime: string;
  otherPartyName: string;
  otherPartyPhone?: string;
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
export function ViewingReminderEmail({
  recipientName,
  recipientType,
  propertyTitle,
  propertyAddress,
  propertyId,
  viewingDate,
  viewingTime,
  otherPartyName,
  otherPartyPhone,
  latitude,
  longitude,
  mapsUrl,
  listingUrl,
}: ViewingReminderEmailData) {
  const pubUrl = listingUrl ?? `${BASE_URL}/properties/${propertyId}`;
  const hasCoords = latitude && longitude;
  const roleContext = recipientType === 'buyer'
    ? `Your viewing of <strong style="color:${colors.brandDark}">${propertyTitle}</strong> is tomorrow.`
    : `You have a scheduled viewing for <strong style="color:${colors.brandDark}">${propertyTitle}</strong> tomorrow.`;

  return (
    <EmailLayout preview={`Viewing reminder — ${propertyTitle} tomorrow at ${viewingTime}`}>
      <EmailHeader />

      <EmailSection>
        {/* Headline */}
        <Text style={s.headline}>Viewing Reminder — Tomorrow</Text>
        <Text style={{
          ...s.paragraph,
          // Safe: we use dangerouslySetInnerHTML only for a static string with no user input reaching here
        }}>
          Hi {recipientName},{' '}
          {recipientType === 'buyer' ? (
            <>your viewing of <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong> is tomorrow.</>
          ) : (
            <>{otherPartyName} is coming to view <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong> tomorrow.</>
          )}
        </Text>

        {/* Time block */}
        <Section style={{
          backgroundColor: colors.brandDark,
          padding: `${spacing['6']} ${spacing['6']}`,
          marginBottom: spacing['6'],
          textAlign: 'center' as const,
        }}>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.xs, fontWeight: 700,
            color: colors.brandAccent, textTransform: 'uppercase' as const,
            letterSpacing: '0.15em', margin: `0 0 ${spacing['2']}`,
          }}>
            Viewing Scheduled
          </Text>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize['2xl'], fontWeight: 700,
            color: colors.brandLight, margin: `0 0 ${spacing['1']}`,
          }}>
            {viewingDate}
          </Text>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.lg,
            color: colors.brandAccent, margin: '0',
          }}>
            {viewingTime}
          </Text>
        </Section>

        {/* Details */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Property"  value={propertyTitle} />
              <EmailDetailRow label="Address"   value={propertyAddress} />
              <EmailDetailRow label={recipientType === 'buyer' ? 'Owner / Agent' : 'Viewing Guest'} value={otherPartyName} />
              {otherPartyPhone && (
                <EmailDetailRow label="Contact"   value={otherPartyPhone} />
              )}
              {hasCoords && (
                <EmailDetailRow label="Coordinates" value={
                  <span style={s.coords}>{latitude}, {longitude}</span>
                } />
              )}
            </tbody>
          </table>
        </Section>

        {/* Directions */}
        {mapsUrl && (
          <EmailAlert variant="brand">
            <Text style={{
              fontFamily: fonts.body, fontSize: fontSize.sm,
              color: colors.accentDark, margin: '0', lineHeight: '1.6',
            }}>
              <strong>Get Directions:</strong> Navigate to the verified property location.{' '}
              <Link href={mapsUrl} style={{ color: colors.accentDark, fontWeight: 700 }}>
                Open in Google Maps →
              </Link>
              {hasCoords && (
                <><br />
                  <span style={{ ...s.coords, color: colors.accentDark, fontSize: fontSize.xs }}>
                    {latitude}, {longitude}
                  </span>
                </>
              )}
            </Text>
          </EmailAlert>
        )}

        {/* CTA */}
        <Section style={{ textAlign: 'center', margin: `${spacing['8']} 0 ${spacing['4']}` }}>
          <EmailButton href={pubUrl} variant="primary">
            View Property Details →
          </EmailButton>
        </Section>

        <Text style={s.muted}>
          {recipientType === 'buyer'
            ? 'If you need to reschedule, please contact the owner directly.'
            : `Contact ${otherPartyName}${otherPartyPhone ? ` on ${otherPartyPhone}` : ''} if needed.`}
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

ViewingReminderEmail.subject = (data: ViewingReminderEmailData) =>
  `Reminder: Viewing for "${data.propertyTitle}" tomorrow at ${data.viewingTime}`;

export const previewProps: ViewingReminderEmailData = {
  recipientEmail: 'kemi@example.ng',
  recipientName: 'Kemi Adeyemi',
  recipientType: 'buyer',
  propertyTitle: '3-Bedroom Flat, Lekki Phase 1',
  propertyAddress: '14 Admiralty Way, Lekki Phase 1, Lagos',
  propertyId: 'prop_lk1_20260309_042',
  viewingDate: 'Tuesday, March 10, 2026',
  viewingTime: '11:00 AM',
  otherPartyName: 'Emeka Okafor',
  otherPartyPhone: '+2348012345678',
  latitude: '6.4281',
  longitude: '3.4568',
  mapsUrl: 'https://maps.google.com/?q=6.4281,3.4568',
};

export default ViewingReminderEmail;
