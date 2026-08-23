import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export type OnboardingUserType = 'agent' | 'owner' | 'user';

export interface WelcomeEmailData {
  email: string;
  firstName: string;
  lastName?: string;
  userType: OnboardingUserType;
  dashboardUrl: string;
}

const ROLE_LABELS: Record<OnboardingUserType, string> = {
  agent: 'Property Agent',
  owner: 'Property Owner',
  user:  'Property Seeker',
};

const ROLE_CTA: Record<OnboardingUserType, string> = {
  agent: 'Go to Agent Dashboard',
  owner: 'Go to Owner Dashboard',
  user:  'Start Searching',
};

const ROLE_BENEFITS: Record<OnboardingUserType, string[]> = {
  agent: [
    'List and manage properties on behalf of owners',
    'Receive inquiries directly from verified buyers and tenants',
    'Build your professional profile and grow your network',
  ],
  owner: [
    'List your properties and reach thousands of verified seekers',
    'Manage inquiries and track listing performance',
    'Get your listings verified for maximum trust and visibility',
  ],
  user: [
    'Browse verified properties across Nigeria',
    'Send inquiries directly to owners and agents',
    'Save your favourite listings and get price alerts',
  ],
};

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = {
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.6',
    margin: `0 0 ${spacing['5']}`,
  },
  feature: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: '1.6',
    margin: `0 0 ${spacing['2']}`,
  },
  noticeSection: {
    backgroundColor: colors.infoBg,
    border: `1px solid ${colors.infoBorder}`,
    padding: spacing['5'],
    marginBottom: spacing['4'],
  },
  noticeHeading: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: 600,
    color: colors.info,
    margin: `0 0 ${spacing['2']}`,
  },
  noticeText: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.info,
    margin: '0',
    lineHeight: '1.6',
  },
  paragraphMuted: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    margin: '0',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function WelcomeEmail({ firstName, userType, dashboardUrl }: WelcomeEmailData) {
  const roleLabel = ROLE_LABELS[userType];
  const ctaLabel  = ROLE_CTA[userType];
  const benefits  = ROLE_BENEFITS[userType] ?? [];

  return (
    <EmailLayout preview={`Welcome to RealEST, ${firstName}! Your account is now active.`}>
      <EmailHeader />

      <EmailSection>
        <Text style={styles.paragraph}>Hi {firstName},</Text>
        <Text style={styles.paragraph}>
          Welcome to RealEST! Here&apos;s what you can do as a{' '}
          <strong style={{ color: colors.brandDark }}>{roleLabel}</strong>:
        </Text>

        <Section style={{ marginBottom: spacing['6'] }}>
          {benefits.map((benefit, i) => (
            <Text key={i} style={styles.feature}>• {benefit}</Text>
          ))}
        </Section>

        <Section style={{ textAlign: 'center', margin: `${spacing['8']} 0` }}>
          <EmailButton href={dashboardUrl} variant="primary">
            {ctaLabel} →
          </EmailButton>
        </Section>

        {userType !== 'user' && (
          <Section style={styles.noticeSection}>
            <Text style={styles.noticeHeading}>Verification Coming Soon</Text>
            <Text style={styles.noticeText}>
              Our team will review your profile for the trust badge on your listings. We&apos;ll notify you once complete.
            </Text>
          </Section>
        )}

        <Text style={styles.paragraphMuted}>
          Questions? Email us at{' '}
          <Link href="mailto:hello@realest.ng" style={{ color: colors.brandDark, fontWeight: 500 }}>
            hello@realest.ng
          </Link>
        </Text>
      </EmailSection>

      <EmailFooter />
    </EmailLayout>
  );
}

WelcomeEmail.subject = (data: WelcomeEmailData) =>
  `Welcome to RealEST, ${data.firstName}!`;

export const previewProps: WelcomeEmailData = {
  email: 'emeka@example.ng',
  firstName: 'Emeka',
  lastName: 'Nwosu',
  userType: 'owner',
  dashboardUrl: `${BASE_URL}/owner`,
};

export default WelcomeEmail;
