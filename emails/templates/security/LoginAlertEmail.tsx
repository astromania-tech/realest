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
export interface LoginAlertEmailData {
  recipientName: string;
  email: string;
  device: string;
  browser: string;
  location: string;
  ipAddress: string;
  loginTime: string;
  secureAccountUrl?: string;
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
  notYouBox: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['5']} ${spacing['6']}`,
    marginBottom: spacing['5'],
    textAlign: 'center' as const,
  },
  notYouHeadline: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    fontWeight: 700 as const,
    color: colors.brandLight,
    margin: `0 0 ${spacing['2']}`,
  },
  notYouBody: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.accentMuted,
    lineHeight: '1.5',
    margin: 0,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function LoginAlertEmail({
  recipientName,
  email,
  device,
  browser,
  location,
  ipAddress,
  loginTime,
  secureAccountUrl,
}: LoginAlertEmailData) {
  const secureUrl = secureAccountUrl ?? `${BASE_URL}/settings/security`;

  return (
    <EmailLayout preview={`New sign-in to your RealEST account — ${device} in ${location}`}>
      <EmailHeader />

      <EmailSection>
        <Text style={s.headline}>New Sign-In Detected</Text>

        <EmailAlert variant="warning">
          We detected a sign-in to your RealEST account from a new device or location. If
          this was you, no action is needed. If not, secure your account immediately.
        </EmailAlert>

        <Text style={{ ...s.paragraph, marginTop: spacing['5'] }}>
          Hi {recipientName}, your account <strong style={{ color: colors.brandDark }}>{email}</strong>{' '}
          was accessed on <strong>{loginTime}</strong>.
        </Text>

        {/* Sign-in details */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['5'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <EmailDetailRow label="Device"   value={device} />
              <EmailDetailRow label="Browser"  value={browser} />
              <EmailDetailRow label="Location" value={location} />
              <EmailDetailRow
                label="IP Address"
                value={<span style={s.monoValue}>{ipAddress}</span>}
              />
              <EmailDetailRow label="Time"     value={loginTime} />
            </tbody>
          </table>
        </Section>

        {/* "Not you?" warning block */}
        <Section style={s.notYouBox}>
          <Text style={s.notYouHeadline}>Not you?</Text>
          <Text style={s.notYouBody}>
            Change your password and sign out of all sessions immediately.
          </Text>
        </Section>

        {/* Secure account CTA */}
        <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
          <EmailButton href={secureUrl} variant="primary">
            Secure My Account →
          </EmailButton>
        </Section>

        <Text style={{ ...s.paragraph, fontSize: fontSize.sm, color: colors.textMuted }}>
          If this was you, you can safely ignore this email. If you did not sign in,
          please{' '}
          <Link href={secureUrl} style={{ color: colors.brandDark, fontWeight: 600 }}>
            secure your account
          </Link>{' '}
          or contact{' '}
          <Link href="mailto:security@realest.ng" style={{ color: colors.brandDark, fontWeight: 600 }}>
            security@realest.ng
          </Link>
          .
        </Text>

        <Text style={{ ...s.paragraph, fontSize: fontSize.xs, color: colors.textMuted, marginTop: 0 }}>
          For your protection, this alert is sent every time your account is accessed from
          a new browser or device. You cannot unsubscribe from security emails.
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

LoginAlertEmail.subject = (data: LoginAlertEmailData) =>
  `New sign-in to your RealEST account — ${data.location}`;

export const previewProps: LoginAlertEmailData = {
  recipientName: 'Emeka Okafor',
  email: 'emeka@example.ng',
  device: 'MacBook Pro (macOS 14)',
  browser: 'Chrome 122',
  location: 'Lagos, Nigeria',
  ipAddress: '41.221.214.xxx',
  loginTime: 'March 9, 2026 at 3:47 PM WAT',
};

export default LoginAlertEmail;
