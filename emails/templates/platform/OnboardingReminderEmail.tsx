import * as React from 'react';
import { Section, Row, Column, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';
import type { OnboardingUserType } from './WelcomeEmail';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface OnboardingReminderEmailData {
  email: string;
  firstName: string;
  lastName?: string;
  userType: OnboardingUserType;
  onboardingUrl: string;
  daysElapsed?: number;
}

const ROLE_LABELS: Record<OnboardingUserType, string> = {
  agent: 'Property Agent',
  owner: 'Property Owner',
  user:  'Property Seeker',
};

const ROLE_PITCH: Record<OnboardingUserType, string> = {
  agent: 'Complete your agent profile to start listing properties and receiving verified leads from buyers and tenants across Nigeria.',
  owner: 'Complete your owner profile to list your properties and connect with thousands of verified seekers.',
  user:  'Finish setting up your account to unlock personalised property recommendations and direct messaging with owners.',
};

const ROLE_CTA: Record<OnboardingUserType, string> = {
  agent: 'Complete Agent Profile',
  owner: 'Complete Owner Profile',
  user:  'Finish Setup',
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
  progressSection: {
    backgroundColor: colors.pageBg,
    border: `1px solid ${colors.border}`,
    padding: `${spacing['5']} ${spacing['6']}`,
    marginBottom: spacing['6'],
  },
  progressLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    margin: `0 0 ${spacing['2']}`,
    letterSpacing: '0.5px',
    textTransform: 'uppercase' as const,
  },
  progressCaption: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    margin: '0',
  },
  paragraphMuted: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    margin: '0',
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function OnboardingReminderEmail({
  firstName,
  userType,
  onboardingUrl,
  daysElapsed,
}: OnboardingReminderEmailData) {
  const roleLabel = ROLE_LABELS[userType];
  const pitch     = ROLE_PITCH[userType];
  const cta       = ROLE_CTA[userType];
  const daysCopy  = daysElapsed && daysElapsed > 0
    ? `It's been ${daysElapsed} day${daysElapsed === 1 ? '' : 's'} since you signed up.`
    : "You signed up recently but haven't finished yet.";

  return (
    <EmailLayout preview={`${firstName}, finish setting up your RealEST account`}>
      <EmailHeader />

      <EmailSection>
        <Text style={styles.paragraph}>Hi {firstName},</Text>
        <Text style={styles.paragraph}>
          {daysCopy} Your <strong style={{ color: colors.brandDark }}>{roleLabel}</strong> profile is not yet complete.
        </Text>

        <Section style={styles.progressSection}>
          <Text style={styles.progressLabel}>Setup Progress</Text>
          <Row style={{ marginBottom: spacing['2'] }}>
            <Column style={{ width: '75%', backgroundColor: colors.brandAccent, fontSize: '0', lineHeight: '0', padding: '4px 0' }}>&nbsp;</Column>
            <Column style={{ width: '25%', backgroundColor: colors.border, fontSize: '0', lineHeight: '0', padding: '4px 0' }}>&nbsp;</Column>
          </Row>
          <Text style={styles.progressCaption}>75% complete — just a few more steps!</Text>
        </Section>

        <Text style={styles.paragraph}>{pitch}</Text>

        <Section style={{ textAlign: 'center', marginBottom: spacing['6'] }}>
          <EmailButton href={onboardingUrl} variant="primary">
            {cta} →
          </EmailButton>
        </Section>

        <Text style={styles.paragraphMuted}>
          Need help?{' '}
          <a href="mailto:hello@realest.ng" style={{ color: colors.brandDark, fontWeight: 500 }}>
            hello@realest.ng
          </a>
        </Text>
      </EmailSection>

      <EmailFooter />
    </EmailLayout>
  );
}

OnboardingReminderEmail.subject = (data: OnboardingReminderEmailData) =>
  `${data.firstName}, finish setting up your RealEST account`;

export const previewProps: OnboardingReminderEmailData = {
  email: 'fatima@example.ng',
  firstName: 'Fatima',
  lastName: 'Abubakar',
  userType: 'agent',
  onboardingUrl: `${BASE_URL}/onboarding`,
  daysElapsed: 3,
};

export default OnboardingReminderEmail;
