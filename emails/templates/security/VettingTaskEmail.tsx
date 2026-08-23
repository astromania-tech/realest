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
export interface VettingTaskEmailData {
  /** Full name of the field agent receiving this task */
  agentName: string;
  agentEmail: string;
  taskId: string;
  propertyTitle: string;
  propertyAddress: string;
  propertyType: string;
  propertyId: string;
  /** Property owner's displayed name */
  ownerName: string;
  ownerPhone: string;
  /** ISO-8601 or human-readable deadline string */
  deadline: string;
  appointmentDate?: string;
  appointmentTime?: string;
  coordinates?: { lat: number; lng: number };
  notes?: string;
  mapsUrl?: string;
  taskUrl?: string;
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
  monoValue: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    letterSpacing: '0.08em',
  },
  checklistItem: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: '1.6',
    margin: `0 0 ${spacing['2']}`,
  },
  checkmark: {
    color: colors.brandDark,
    fontWeight: 700 as const,
    marginRight: spacing['2'],
  },
};

const CHECKLIST_ITEMS = [
  'Inspect structural condition of property (walls, roof, plumbing)',
  'Verify property dimensions match submitted floor plans',
  'Photograph all listed rooms and exterior (min. 4 angles)',
  'Cross-check ownership documents with physical access',
  'Confirm amenities claimed in listing (BQ, generator, parking)',
  'Record GPS coordinates and confirm address accuracy',
  'Complete and submit vetting report on the app before deadline',
];

// ─── Component ────────────────────────────────────────────────────────────────
export function VettingTaskEmail({
  agentName,
  taskId,
  propertyTitle,
  propertyAddress,
  propertyType,
  propertyId,
  ownerName,
  ownerPhone,
  deadline,
  appointmentDate,
  appointmentTime,
  coordinates,
  notes,
  mapsUrl,
  taskUrl,
}: VettingTaskEmailData) {
  const tUrl = taskUrl ?? `${BASE_URL}/admin/vetting/tasks/${taskId}`;
  const gMapsUrl = mapsUrl ?? (coordinates
    ? `https://www.google.com/maps?q=${coordinates.lat},${coordinates.lng}`
    : undefined
  );

  return (
    <EmailLayout preview={`New vetting task assigned: ${propertyTitle} — deadline ${deadline}`}>
      <EmailHeader />

      <EmailSection>
        <Text style={s.headline}>New Vetting Task Assigned</Text>

        <EmailAlert variant="info">
          You have been assigned a new field vetting task. Please review the details and
          complete all checks before the deadline.
        </EmailAlert>

        <Text style={{ ...s.paragraph, marginTop: spacing['5'] }}>
          Hi {agentName}, you have been assigned the field inspection for{' '}
          <strong style={{ color: colors.brandDark }}>{propertyTitle}</strong>. The
          vetting report must be submitted by{' '}
          <strong style={{ color: colors.error }}>{deadline}</strong>.
        </Text>

        {/* Appointment time block — only if scheduled */}
        {(appointmentDate && appointmentTime) && (
          <Section style={{
            backgroundColor: colors.brandDark,
            padding: `${spacing['6']} ${spacing['6']}`,
            marginBottom: spacing['5'],
            textAlign: 'center' as const,
          }}>
            <Text style={{
              fontFamily: fonts.body,
              fontSize: fontSize.xs,
              fontWeight: 700,
              color: colors.brandAccent,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.15em',
              margin: `0 0 ${spacing['2']}`,
            }}>
              Appointment Scheduled
            </Text>
            <Text style={{
              fontFamily: fonts.body,
              fontSize: fontSize['2xl'],
              fontWeight: 700 as const,
              color: colors.brandLight,
              margin: `0 0 ${spacing['1']}`,
              lineHeight: '1.2',
            }}>
              {appointmentDate}
            </Text>
            <Text style={{
              fontFamily: fonts.body,
              fontSize: fontSize.lg,
              color: colors.accentMuted,
              margin: 0,
            }}>
              {appointmentTime}
            </Text>
          </Section>
        )}

        {/* Property & owner details */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['5'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Task ID"       value={<span style={s.monoValue}>{taskId}</span>} />
              <EmailDetailRow label="Property"      value={propertyTitle} />
              <EmailDetailRow label="Property ID"   value={<span style={s.monoValue}>{propertyId}</span>} />
              <EmailDetailRow label="Type"          value={propertyType} />
              <EmailDetailRow label="Address"       value={propertyAddress} />
              {coordinates && (
                <EmailDetailRow
                  label="Coordinates"
                  value={
                    <span style={s.monoValue}>
                      {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                    </span>
                  }
                />
              )}
              <EmailDetailRow label="Owner Name"    value={ownerName} />
              <EmailDetailRow label="Owner Phone"   value={
                <Link href={`tel:${ownerPhone}`} style={{ color: colors.brandDark, fontWeight: 600 }}>
                  {ownerPhone}
                </Link>
              } />
              <EmailDetailRow label="Deadline"      value={deadline} accent />
            </tbody>
          </table>
        </Section>

        {/* Navigation alert with maps link */}
        {gMapsUrl && (
          <EmailAlert variant="brand">
            Navigate to the property →{' '}
            <Link href={gMapsUrl} style={{ color: colors.brandDark, fontWeight: 700, textDecoration: 'underline' }}>
              Open in Google Maps
            </Link>
            {coordinates && (
              <span style={{ ...s.monoValue, marginLeft: spacing['2'] }}>
                ({coordinates.lat.toFixed(5)}, {coordinates.lng.toFixed(5)})
              </span>
            )}
          </EmailAlert>
        )}

        {/* Internal notes */}
        {notes && (
          <Section style={{
            borderLeft: `3px solid ${colors.brandDark}`,
            paddingLeft: spacing['4'],
            margin: `${spacing['5']} 0`,
          }}>
            <Text style={{
              fontFamily: fonts.body,
              fontSize: fontSize.xs,
              fontWeight: 700,
              color: colors.textMuted,
              textTransform: 'uppercase' as const,
              letterSpacing: '0.1em',
              margin: `0 0 ${spacing['1']}`,
            }}>
              Admin Notes
            </Text>
            <Text style={{
              fontFamily: fonts.body,
              fontSize: fontSize.sm,
              color: colors.text,
              lineHeight: '1.6',
              margin: 0,
            }}>
              {notes}
            </Text>
          </Section>
        )}

        {/* Checklist */}
        <Text style={{
          fontFamily: fonts.body,
          fontSize: fontSize.sm,
          fontWeight: 700,
          color: colors.brandDark,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.08em',
          margin: `${spacing['5']} 0 ${spacing['3']}`,
        }}>
          Field Inspection Checklist
        </Text>
        {CHECKLIST_ITEMS.map((item, i) => (
          <Text key={i} style={s.checklistItem}>
            <span style={s.checkmark}>☐</span>
            {item}
          </Text>
        ))}

        {/* CTA */}
        <Section style={{ textAlign: 'center', margin: `${spacing['6']} 0 ${spacing['4']}` }}>
          <EmailButton href={tUrl} variant="primary">
            Open Task in Portal →
          </EmailButton>
        </Section>

        <Text style={{ ...s.paragraph, fontSize: fontSize.sm, color: colors.textMuted }}>
          This is an internal task notification. Do not forward this email. Contact your
          supervisor or reply to{' '}
          <Link href="mailto:ops@realest.ng" style={{ color: colors.brandDark, fontWeight: 600 }}>
            ops@realest.ng
          </Link>{' '}
          if you have questions.
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

VettingTaskEmail.subject = (data: VettingTaskEmailData) =>
  `New vetting task [${data.taskId}]: ${data.propertyTitle}`;

export const previewProps: VettingTaskEmailData = {
  agentName: 'Chidi Okeke',
  agentEmail: 'chidi.okeke@realest.ng',
  taskId: 'VET-2026-0042',
  propertyTitle: 'Luxury 4-Bedroom Duplex, Victoria Island',
  propertyAddress: '12 Akin Adesola Street, Victoria Island, Lagos',
  propertyType: '4-Bedroom Duplex with BQ',
  propertyId: 'prop_vi_20260309_001',
  ownerName: 'Emeka Okafor',
  ownerPhone: '+2348012345678',
  deadline: 'March 14, 2026 at 5:00 PM',
  appointmentDate: 'March 12, 2026',
  appointmentTime: '10:00 AM WAT',
  coordinates: { lat: 6.42827, lng: 3.42005 },
  notes: 'Owner mentioned the BQ entrance is around the back. Security gate code: 4421.',
};

export default VettingTaskEmail;
