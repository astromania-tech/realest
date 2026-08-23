import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PasswordChangedEmailData {
  email: string;
  firstName: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.6',
    margin: `0 0 ${spacing['5']}`,
  },
  noticeSection: {
    backgroundColor: colors.brandLight,
    border: `1px solid ${colors.border}`,
    padding: spacing['5'],
    marginBottom: spacing['6'],
  },
  noticeHeading: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: 600,
    color: colors.brandDark,
    margin: `0 0 ${spacing['2']}`,
  },
  noticeText: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: '1.6',
    margin: '0',
  },
  paragraphMuted: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    margin: '0',
    lineHeight: '1.6',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function PasswordChangedEmail({ firstName, email }: PasswordChangedEmailData) {
  return (
    <EmailLayout preview="Your RealEST password has been changed.">
      <EmailHeader />

      <EmailSection>
        <Text style={styles.paragraph}>Hi {firstName},</Text>
        <Text style={styles.paragraph}>
          This is a confirmation that the password for your RealEST account (
          <strong>{email}</strong>) was successfully changed.
        </Text>

        <Section style={styles.noticeSection}>
          <Text style={styles.noticeHeading}>Didn&apos;t make this change?</Text>
          <Text style={styles.noticeText}>
            If you did <strong>not</strong> change your password, your account may be at risk. Please{' '}
            <Link href={`${BASE_URL}/forgot-password`} style={{ color: colors.brandDark, fontWeight: 600, textDecoration: 'underline' }}>
              reset your password immediately
            </Link>{' '}
            and contact our support team.
          </Text>
        </Section>

        <Section style={{ textAlign: 'center', marginBottom: spacing['4'] }}>
          <EmailButton href={`${BASE_URL}/forgot-password`} variant="secondary">
            Secure My Account
          </EmailButton>
        </Section>

        <Text style={styles.paragraphMuted}>
          If you made this change yourself, no action is needed. This email is for your security records.
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

PasswordChangedEmail.subject = (_: PasswordChangedEmailData) =>
  'Your RealEST password has been changed';

export const previewProps: PasswordChangedEmailData = {
  email: 'ngozi@example.ng',
  firstName: 'Ngozi',
};

export default PasswordChangedEmail;
