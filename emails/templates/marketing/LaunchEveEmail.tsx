import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { EmailAlert } from '../../components/EmailAlert';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export type LaunchUserType = 'owner' | 'seeker';

export interface LaunchEveEmailData {
  firstName: string;
  launchDateTime: string;
  userType?: LaunchUserType;
  earlyAccessUrl?: string;
}

// ─── Checklist data ───────────────────────────────────────────────────────────
const OWNER_CHECKLIST = [
  { item: 'Certificate of Occupancy (C of O) or Deed of Assignment', required: true },
  { item: 'Survey plan with coordinates', required: true },
  { item: 'Government-issued ID (NIN, International Passport, or Driver\'s License)', required: true },
  { item: '6–10 clear property photos (natural daylight preferred)', required: true },
  { item: 'Utility bill or tenancy agreement to confirm occupancy', required: false },
];

const SEEKER_CHECKLIST = [
  { item: 'Government-issued ID (NIN, International Passport, or Driver\'s License)', required: true },
  { item: 'Proof of current address (utility bill or bank statement)', required: true },
  { item: 'Employment letter or evidence of income (for rental applications)', required: false },
  { item: 'Emergency contact details', required: false },
  { item: 'Your preferred areas and budget range ready to set filters', required: false },
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  heroBg: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['12']} ${spacing['8']}`,
    textAlign: 'center' as const,
  },
  countdown: {
    fontFamily: fonts.mono,
    fontSize: fontSize['3xl'],
    fontWeight: 700 as const,
    color: colors.brandAccent,
    letterSpacing: '-0.03em',
    margin: `0 0 ${spacing['2']}`,
    display: 'block' as const,
  },
  heroEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.accentMuted,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['4']}`,
  },
  heroHeadline: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandLight,
    lineHeight: '1.2',
    letterSpacing: '-0.01em',
    margin: `0 0 ${spacing['4']}`,
  },
  heroTime: {
    fontFamily: fonts.mono,
    fontSize: fontSize.lg,
    color: colors.brandAccent,
    margin: `0 0 ${spacing['2']}`,
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.accentMuted,
    lineHeight: '1.6',
    margin: 0,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.65',
    margin: `0 0 ${spacing['5']}`,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['5']}`,
  },
  checklistItem: {
    display: 'flex' as const,
    alignItems: 'flex-start' as const,
    marginBottom: spacing['3'],
    gap: spacing['3'],
  },
  checkIcon: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.brandAccent,
    fontWeight: 700 as const,
    minWidth: '20px',
    margin: 0,
  },
  checkItemText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: '1.5',
    margin: 0,
  },
  checkItemOptional: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    lineHeight: '1.5',
    margin: `${spacing['1']} 0 0`,
  },
  urgencyBox: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['5']} ${spacing['6']}`,
    textAlign: 'center' as const,
    marginBottom: spacing['6'],
  },
  urgencyLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.accentMuted,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  urgencyTime: {
    fontFamily: fonts.mono,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandAccent,
    margin: 0,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function LaunchEveEmail({
  firstName = '',
  launchDateTime = 'Tomorrow at 10:00 AM',
  userType = 'seeker',
  earlyAccessUrl = '',
}: LaunchEveEmailData) {
  const ctaUrl = earlyAccessUrl || `${BASE_URL}/early-access`;
  const checklist = userType === 'owner' ? OWNER_CHECKLIST : SEEKER_CHECKLIST;
  const roleLabel = userType === 'owner' ? 'property owners' : 'property seekers';

  return (
    <EmailLayout preview={`${launchDateTime} — your early access to RealEST opens. Get your documents ready now.`}>
      <EmailHeader />

      {/* Hero */}
      <Section style={s.heroBg}>
        <Text style={s.heroEyebrow}>Early Access Launching</Text>
        <span style={s.countdown}>T – 24hrs</span>
        <Text style={s.heroHeadline}>
          Tomorrow, RealEST opens its doors.{' '}
          <span style={{ color: colors.brandAccent }}>Your spot is ready.</span>
        </Text>
        <Text style={s.heroTime}>{launchDateTime}</Text>
        <Text style={s.heroSub}>
          You're on the waitlist — which means you skip the queue.
          Here's exactly what you need to have ready before the link goes live.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>Hi {firstName},</Text>

        <Text style={s.paragraph}>
          Tomorrow is the day. Early access opens at <strong>{launchDateTime}</strong>, and
          because you're on our waitlist, you get first access — before the platform opens
          to the general public.
        </Text>

        <Text style={s.paragraph}>
          To make the most of your first session, get these documents ready tonight.
          Incomplete submissions slow down verification. Verified listings and profiles
          go live faster.
        </Text>
      </EmailSection>

      <EmailSection>
        <Text style={s.sectionLabel}>
          Your checklist — for {roleLabel}
        </Text>

        {checklist.map((item, i) => (
          <table key={i} width="100%" cellPadding={0} cellSpacing={0}
            style={{ marginBottom: spacing['3'] }}>
            <tbody>
              <tr>
                <td style={{ width: '24px', verticalAlign: 'top', paddingTop: '2px' }}>
                  <Text style={s.checkIcon}>{item.required ? '✓' : '○'}</Text>
                </td>
                <td style={{ verticalAlign: 'top', paddingLeft: spacing['2'] }}>
                  <Text style={s.checkItemText}>{item.item}</Text>
                  {!item.required && (
                    <Text style={s.checkItemOptional}>Optional — but speeds up your application</Text>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        ))}
      </EmailSection>

      <EmailSection>
        {/* Launch time reminder */}
        <div style={s.urgencyBox}>
          <Text style={s.urgencyLabel}>Your early access opens in</Text>
          <Text style={s.urgencyTime}>{launchDateTime}</Text>
        </div>

        <EmailAlert variant="info">
          <p>
            <strong>Early access link:</strong> We'll send you a direct link at{' '}
            {launchDateTime}. Keep an eye on your inbox — and check your spam folder if it
            doesn't arrive within 5 minutes of launch.
          </p>
        </EmailAlert>

        <Text style={{
          fontFamily: fonts.body,
          fontSize: fontSize.base,
          color: colors.text,
          lineHeight: '1.65',
          margin: `${spacing['5']} 0 ${spacing['6']}`,
        }}>
          Can't wait? You can already browse the platform preview below and bookmark
          the properties you want to inquire on first.
        </Text>

        <EmailButton href={ctaUrl} variant="primary">
          Preview the Platform →
        </EmailButton>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

LaunchEveEmail.subject = (data: LaunchEveEmailData) =>
  `${data.firstName}, tomorrow at ${data.launchDateTime} — your early access opens`;

export default LaunchEveEmail;

export const previewProps: LaunchEveEmailData = {
  firstName: 'Emeka',
  launchDateTime: 'Tomorrow at 10:00 AM (WAT)',
  userType: 'owner',
  earlyAccessUrl: 'https://realest.ng/early-access?token=abc123',
};
