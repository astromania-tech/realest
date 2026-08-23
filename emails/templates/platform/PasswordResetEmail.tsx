import * as React from 'react';
import { Section, Text, Link, Hr } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export type OtpVerificationType = 'reset' | 'signup';

export interface PasswordResetEmailData {
  email: string;
  firstName: string;
  otpCode: string;
  resetLink: string;
  expiryMinutes?: number;
  otpFillUrl?: string;
  verificationType?: OtpVerificationType;
}

const COPY: Record<OtpVerificationType, { label: string; headline: string; linkLabel: string }> = {
  reset: {
    label: 'Password Reset',
    headline: 'Reset your password',
    linkLabel: 'Reset password →',
  },
  signup: {
    label: 'Verification Required',
    headline: 'Your sign-in code',
    linkLabel: 'Open RealEST →',
  },
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  label: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 600 as const,
    color: colors.textMuted,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  headline: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandDark,
    letterSpacing: '-0.02em',
    lineHeight: '1.2',
    margin: `0 0 ${spacing['3']}`,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.65',
    margin: `0 0 ${spacing['5']}`,
  },
  otpSection: {
    backgroundColor: colors.brandDark,
    border: `1px solid ${colors.brandDark}`,
    padding: `${spacing['8']} ${spacing['6']}`,
    textAlign: 'center' as const,
    marginBottom: spacing['6'],
  },
  otpLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 600 as const,
    color: colors.brandAccent,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['3']}`,
  },
  otpCode: {
    fontFamily: fonts.mono,
    fontSize: '42px',
    fontWeight: 700 as const,
    color: colors.brandLight,
    letterSpacing: '0.20em',
    textAlign: 'center' as const,
    margin: `0 0 ${spacing['3']}`,
    lineHeight: '1',
  },
  otpMeta: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.accentMuted,
    textAlign: 'center' as const,
    margin: '0',
    lineHeight: '1.5',
  },
  noticeSection: {
    backgroundColor: colors.infoBg,
    border: `1px solid ${colors.infoBorder}`,
    padding: spacing['5'],
    marginBottom: spacing['6'],
  },
  noticeHeading: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: 600 as const,
    color: colors.info,
    margin: `0 0 ${spacing['2']}`,
  },
  noticeText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.info,
    lineHeight: '1.6',
    margin: '0',
  },
  paragraphMuted: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center' as const,
    margin: '0',
    lineHeight: '1.6',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function PasswordResetEmail({
  email,
  firstName,
  otpCode = '',
  resetLink = '',
  expiryMinutes = 15,
  otpFillUrl,
  verificationType = 'signup',
}: PasswordResetEmailData) {
  const copy = COPY[verificationType];

  return (
    <EmailLayout preview={`${otpCode} — Your RealEST verification code`}>
      <EmailHeader />

      <EmailSection>
        <Text style={styles.label}>· {copy.label}</Text>
        <Text style={styles.headline}>{copy.headline}</Text>
        <Text style={styles.paragraph}>
          Hi {firstName}, we received a request for{' '}
          <strong style={{ color: colors.brandDark }}>{email}</strong>.
          {' '}Enter the code below — it expires in{' '}
          <strong style={{ color: colors.brandDark }}>{expiryMinutes} minutes</strong>.
        </Text>

        {/* OTP block */}
        <Section style={styles.otpSection}>
          <Text style={styles.otpLabel}>One-Time Passcode</Text>
          <Text style={styles.otpCode}>{otpCode}</Text>
        </Section>

        {/* Security notice */}
        <Section style={styles.noticeSection}>
          <Text style={styles.noticeHeading}>Never share this code</Text>
          <Text style={styles.noticeText}>
            RealEST will never ask for your OTP via phone, SMS, or chat.{' '}
            If you didn&apos;t request this,{' '}
            <Link href={`${BASE_URL}/security`} style={{ color: colors.info, fontWeight: 600, textDecoration: 'underline' }}>
              secure your account immediately
            </Link>.
          </Text>
        </Section>

        <Hr style={{ borderColor: colors.border, margin: `0 0 ${spacing['6']}` }} />

        <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
          <EmailButton href={otpFillUrl ?? resetLink} variant="primary">
            {copy.linkLabel}
          </EmailButton>
        </Section>

        <Text style={styles.paragraphMuted}>
          Code not working?{' '}
          <Link href={`${BASE_URL}/support`} style={{ color: colors.textMuted, textDecoration: 'underline' }}>
            Contact support
          </Link>
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

PasswordResetEmail.subject = (data: PasswordResetEmailData): string => {
  const type = data.verificationType ?? 'reset';
  return type === 'reset'
    ? `${data.otpCode} — Your RealEST password reset code`
    : `${data.otpCode} — Verify your RealEST account`;
};

export const previewProps: PasswordResetEmailData = {
  email: 'chidi@example.ng',
  firstName: 'Chidi',
  otpCode: '847201',
  resetLink: `${BASE_URL}/reset-password`,
  verificationType: 'signup',
  expiryMinutes: 10,
};

export default PasswordResetEmail;
