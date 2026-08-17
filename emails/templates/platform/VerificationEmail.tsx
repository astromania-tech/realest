import * as React from 'react';
import {
  Section,
  Text,
  Link,
} from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailButton } from '../../components/EmailButton';
import { EmailSection } from '../../components/EmailUI';
import { EmailText } from '../../components/EmailUI';
import { colors, fonts, fontSize, spacing } from '../../styles/tokens';

/**
 * Props for VerificationEmail
 */
export interface VerificationEmailData {
  firstName: string;
  email: string;
  verificationUrl: string;
}

/**
 * Shared style objects
 */
const s = {
  label: {
    color: colors.brandAccent,
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    marginBottom: spacing['2'],
    marginTop: 0,
  },
  headline: {
    color: colors.brandLight,
    fontFamily: fonts.body, // Headings use body font per constraints for Grotesk look
    fontSize: fontSize['2xl'],
    fontWeight: 700,
    margin: 0,
  },
  body: {
    margin: `${spacing['4']} 0`,
  },
  linkText: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontFamily: fonts.body,
    marginTop: spacing['8'],
    lineHeight: '1.4',
  },
  url: {
    color: colors.brandDark,
    textDecoration: 'underline',
    wordBreak: 'break-all' as const,
  }
};

export function VerificationEmail({
  firstName = '',
  verificationUrl = '',
}: VerificationEmailData) {
  return (
    <EmailLayout preview="Verify your RealEST account to start exploring verified listings.">
      <EmailHeader />

      {/* Hero Section */}
      <Section style={{ backgroundColor: colors.brandDark, padding: `${spacing['8']} ${spacing['6']}` }}>
        <Text style={s.label}>Welcome to RealEST</Text>
        <Text style={s.headline}>Confirm your email address</Text>
      </Section>

      {/* Main Content */}
      <EmailSection padding={`${spacing['8']} ${spacing['6']}`} bg={colors.cardBg}>
        <EmailText>
          Hi {firstName},
        </EmailText>
        <EmailText>
          Thank you for joining RealEST. We're excited to have you on board! To ensure the security of our community and give you full access to our verified listings, please verify your email address by clicking the button below.
        </EmailText>

        <Section style={{ marginTop: spacing['6'], marginBottom: spacing['6'] }}>
          <EmailButton href={verificationUrl} variant="primary">
            Verify My Email
          </EmailButton>
        </Section>

        <EmailText>
          Physical vetting and trust are at the core of what we do. By verifying your account, you're taking the first step towards a safer Nigerian property market.
        </EmailText>

        <Text style={s.linkText}>
          If the button doesn't work, you can copy and paste this link into your browser:
          <br />
          <Link href={verificationUrl} style={s.url}>
            {verificationUrl}
          </Link>
        </Text>
      </EmailSection>

      <EmailFooter showUnsubscribe={false} />
    </EmailLayout>
  );
}

VerificationEmail.subject = (data: VerificationEmailData) => `Verify your RealEST account, ${data.firstName}`;

export const previewProps: VerificationEmailData = {
  firstName: 'Tunde',
  email: 'tunde@realest.ng',
  verificationUrl: 'https://realest.ng/verify?token=sample_hash',
};