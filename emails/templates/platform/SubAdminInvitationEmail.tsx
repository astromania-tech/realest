import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface SubAdminInvitationData {
  email: string;
  full_name: string;
  inviter_name: string;
  reset_link: string;
}

const ADMIN_CAPABILITIES = [
  'Agent verification and approval workflows',
  'Property moderation and geo-verification',
  'User management and support tools',
  'Platform analytics and reporting',
];

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  heading: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    fontWeight: 700,
    color: colors.brandDark,
    margin: `0 0 ${spacing['3']}`,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.6',
    margin: `0 0 ${spacing['5']}`,
  },
  capability: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: '1.6',
    margin: `0 0 ${spacing['2']}`,
  },
  fallbackLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    margin: `0 0 ${spacing['2']}`,
  },
  fallbackLink: {
    fontFamily: fonts.mono,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    margin: `0 0 ${spacing['6']}`,
    wordBreak: 'break-all' as const,
  },
  warningSection: {
    backgroundColor: colors.warningBg,
    border: `1px solid ${colors.warningBorder}`,
    padding: `${spacing['4']} ${spacing['5']}`,
  },
  warningText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 600,
    color: colors.warning,
    margin: '0',
    lineHeight: '1.6',
  },
  warningSubText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.text,
    margin: `${spacing['1']} 0 0`,
    lineHeight: '1.6',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function SubAdminInvitationEmail({
  full_name,
  inviter_name,
  reset_link,
}: SubAdminInvitationData) {
  const firstName = full_name?.split(' ')[0] ?? '';

  return (
    <EmailLayout preview={`${inviter_name} has invited you to join the RealEST admin team.`}>
      <EmailHeader />

      <EmailSection>
        <Text style={styles.heading}>Welcome to the Admin Team, {firstName}!</Text>

        <Text style={styles.paragraph}>
          <strong>{inviter_name}</strong> has invited you to join the RealEST admin team. As an admin, you&apos;ll have access to:
        </Text>

        <Section style={{ marginBottom: spacing['4'] }}>
          {ADMIN_CAPABILITIES.map((cap, i) => (
            <Text key={i} style={styles.capability}>• {cap}</Text>
          ))}
        </Section>

        <Text style={styles.paragraph}>
          Click the button below to set your password and activate your admin account:
        </Text>

        <Section style={{ textAlign: 'center', marginBottom: spacing['6'] }}>
          <EmailButton href={reset_link} variant="primary">
            Set Your Password →
          </EmailButton>
        </Section>

        <Text style={styles.fallbackLabel}>
          If the button doesn&apos;t work, copy this link into your browser:
        </Text>
        <Text style={styles.fallbackLink}>{reset_link}</Text>

        <Section style={styles.warningSection}>
          <Text style={styles.warningText}>This invitation expires in 24 hours.</Text>
          <Text style={styles.warningSubText}>
            If you didn&apos;t expect this invitation, you can safely ignore this email.
          </Text>
        </Section>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

SubAdminInvitationEmail.subject = (_data: SubAdminInvitationData) =>
  `You've been invited to join the RealEST admin team`;

export const previewProps: SubAdminInvitationData = {
  email: 'amara@example.ng',
  full_name: 'Amara Obi',
  inviter_name: 'Super Admin',
  reset_link: `${BASE_URL}/admin/setup-password?token=preview`,
};

export default SubAdminInvitationEmail;
