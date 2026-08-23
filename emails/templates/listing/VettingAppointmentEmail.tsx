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
export interface VettingAppointmentEmailData {
  ownerName: string;
  ownerEmail: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyId: string;
  appointmentDate: string;
  appointmentTime: string;
  agentName: string;
  agentPhone?: string;
  mapsUrl?: string;
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
  checklistItem: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: '1.6',
    margin: `0 0 ${spacing['2']}`,
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

const checklist = [
  'Original Certificate of Occupancy (C of O) or Governor\'s Consent',
  'Original Survey Plan stamped by a registered surveyor',
  'Valid government-issued photo ID (National ID, Int\'l Passport, or Driver\'s Licence)',
  'Proof of ownership (Deed of Assignment, Sales Agreement, etc.)',
  'Utility bills dated within the last 3 months (electricity or water)',
];

// ─── Component ────────────────────────────────────────────────────────────────
export function VettingAppointmentEmail({
  ownerName,
  propertyTitle,
  propertyAddress,
  propertyId,
  appointmentDate,
  appointmentTime,
  agentName,
  agentPhone,
  mapsUrl,
  dashboardUrl,
}: VettingAppointmentEmailData) {
  const dashUrl = dashboardUrl ?? `${BASE_URL}/owner/properties`;

  return (
    <EmailLayout preview={`Vetting appointment confirmed — ${appointmentDate} at ${appointmentTime}`}>
      <EmailHeader />

      <EmailSection>
        {/* Headline */}
        <Text style={s.headline}>Vetting Appointment Confirmed</Text>
        <Text style={s.paragraph}>
          Hi {ownerName}, your physical site inspection for{' '}
          <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong> has been scheduled.
          Our certified field agent will visit the property at the time below.
        </Text>

        {/* Appointment card */}
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
            Appointment Scheduled
          </Text>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize['2xl'], fontWeight: 700,
            color: colors.brandLight, margin: `0 0 ${spacing['1']}`,
          }}>
            {appointmentDate}
          </Text>
          <Text style={{
            fontFamily: fonts.body, fontSize: fontSize.lg,
            color: colors.brandAccent, margin: '0',
          }}>
            {appointmentTime}
          </Text>
        </Section>

        {/* Property + Agent details */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['6'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Property"   value={propertyTitle} />
              <EmailDetailRow label="Address"    value={propertyAddress} />
              <EmailDetailRow label="Field Agent" value={agentName} />
              {agentPhone && (
                <EmailDetailRow label="Agent Phone" value={agentPhone} />
              )}
              <EmailDetailRow label="Reference"  value={
                <span style={s.refId}>{propertyId}</span>
              } />
            </tbody>
          </table>
        </Section>

        {/* Preparation checklist */}
        <Text style={{
          fontFamily: fonts.body, fontSize: fontSize.sm, fontWeight: 700,
          color: colors.text, textTransform: 'uppercase' as const,
          letterSpacing: '0.08em', margin: `0 0 ${spacing['3']}`,
        }}>
          Preparation Checklist
        </Text>
        {checklist.map((item, i) => (
          <Text key={i} style={s.checklistItem}>
            <strong style={{ color: colors.brandDark }}>☑</strong> {item}
          </Text>
        ))}

        {/* Location alert */}
        {mapsUrl && (
          <EmailAlert variant="brand">
            <Text style={{
              fontFamily: fonts.body, fontSize: fontSize.sm,
              color: colors.accentDark, margin: '0', lineHeight: '1.6',
            }}>
              <strong>Property Location:</strong>{' '}
              <Link href={mapsUrl} style={{ color: colors.accentDark, fontWeight: 600 }}>
                Open in Google Maps →
              </Link>
            </Text>
          </EmailAlert>
        )}

        {/* CTA */}
        <Section style={{ textAlign: 'center', margin: `${spacing['8']} 0 ${spacing['4']}` }}>
          <EmailButton href={dashUrl} variant="primary">
            View Listing Dashboard →
          </EmailButton>
        </Section>

        <Text style={s.muted}>
          Need to reschedule? Contact your field agent:{' '}
          {agentPhone ? (
            <Link href={`tel:${agentPhone}`} style={{ color: colors.brandDark, fontWeight: 600 }}>{agentPhone}</Link>
          ) : (
            <Link href="mailto:support@realest.ng" style={{ color: colors.brandDark, fontWeight: 600 }}>support@realest.ng</Link>
          )}
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

VettingAppointmentEmail.subject = (data: VettingAppointmentEmailData) =>
  `Vetting appointment confirmed — ${data.appointmentDate} for "${data.propertyTitle}"`;

export const previewProps: VettingAppointmentEmailData = {
  ownerEmail: 'emeka@example.ng',
  ownerName: 'Emeka Okafor',
  propertyTitle: 'Luxury 4-Bedroom Duplex, Victoria Island',
  propertyAddress: '23 Adeola Odeku Street, Victoria Island, Lagos',
  propertyId: 'prop_vi_20260309_001',
  appointmentDate: 'Monday, March 11, 2026',
  appointmentTime: '10:00 AM – 12:00 PM',
  agentName: 'Chidi Nwosu',
  agentPhone: '+2348098765432',
  mapsUrl: 'https://maps.google.com/?q=6.4281,3.4219',
};

export default VettingAppointmentEmail;
