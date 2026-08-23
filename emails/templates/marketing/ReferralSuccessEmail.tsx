import * as React from 'react';
import { Link, Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReferralSuccessEmailData {
  /** Referrer's first name */
  referrerFirstName: string;
  /** First name of the person who just joined via the referral link */
  referredFirstName: string;
  /** Referrer's updated total referral count (post-attribution) */
  referralCount: number;
  /** Referrer's code */
  referralCode: string;
  /** Full referral URL to show in email */
  referralUrl?: string;
  /** Whether the referred person joined the waitlist or registered a full account */
  contextType?: 'waitlist' | 'registration';
  unsubscribeUrl?: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s = {
  heroBg: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['12']} ${spacing['8']}`,
    textAlign: 'center' as const,
  },
  eyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['3']}`,
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
  countBox: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['6']} ${spacing['8']}`,
    textAlign: 'center' as const,
    marginBottom: spacing['6'],
  },
  countBoxEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.accentMuted,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  countValue: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandAccent,
    margin: `0 0 ${spacing['1']}`,
    lineHeight: '1.1',
  },
  countSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.brandLight,
    margin: 0,
  },
  codeContainer: {
    border: `2px dashed ${colors.brandAccent}`,
    padding: `${spacing['4']} ${spacing['6']}`,
    textAlign: 'center' as const,
    marginBottom: spacing['6'],
  },
  codeLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.textMuted,
    letterSpacing: '0.16em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  code: {
    fontFamily: fonts.mono,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandDark,
    letterSpacing: '0.12em',
    margin: 0,
  },
  linkBox: {
    border: `1px solid ${colors.brandAccent}40`,
    backgroundColor: `${colors.brandAccent}10`,
    padding: `${spacing['3']} ${spacing['4']}`,
    marginBottom: spacing['6'],
    overflowWrap: 'break-word' as const,
    wordBreak: 'break-all' as const,
  },
  nudge: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.65',
    margin: `0 0 ${spacing['6']}`,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function ReferralSuccessEmail({
  referrerFirstName = 'there',
  referredFirstName = 'Someone',
  referralCount = 1,
  referralCode = 'A3F9KX2B',
  referralUrl = '',
  contextType = 'waitlist',
  unsubscribeUrl = '',
}: ReferralSuccessEmailData) {
  const shareUrl = referralUrl || `${BASE_URL}/refer?ref=${referralCode}`;

  const joinedVia =
    contextType === 'registration'
      ? 'just created a RealEST account'
      : 'just joined the RealEST waitlist';

  const milestone =
    contextType === 'registration'
      ? 'That is a verified member to your name.'
      : 'That is one more spot secured — and one step closer to launch perks.';

  return (
    <EmailLayout
      preview={`${referredFirstName} just joined using your referral link — you now have ${referralCount} referral${referralCount !== 1 ? 's' : ''}`}
    >
      <EmailHeader />

      {/* Hero */}
      <Section style={s.heroBg}>
        <Text style={s.eyebrow}>Referral Confirmed</Text>
        <Text style={s.heroHeadline}>
          Your referral link is working.{' '}
          <span style={{ color: colors.brandAccent }}>Keep sharing.</span>
        </Text>
        <Text style={s.heroSub}>
          Every person you bring into RealEST helps us build Nigeria's most
          trusted property platform — and moves you further up the queue.
        </Text>
      </Section>

      {/* Body copy */}
      <EmailSection>
        <Text style={s.paragraph}>Hi {referrerFirstName},</Text>
        <Text style={s.paragraph}>
          Great news — <strong>{referredFirstName}</strong> {joinedVia} using
          your referral link. {milestone}
        </Text>
        <Text style={s.paragraph}>
          Here's a snapshot of your referral progress so far:
        </Text>
      </EmailSection>

      {/* Count badge */}
      <EmailSection>
        <div style={s.countBox}>
          <Text style={s.countBoxEyebrow}>Total referrals</Text>
          <Text style={s.countValue}>{referralCount}</Text>
          <Text style={s.countSub}>
            {referralCount === 1 ? 'person referred so far' : 'people referred so far'}
          </Text>
        </div>

        {/* Referral code */}
        <div style={s.codeContainer}>
          <Text style={s.codeLabel}>Your referral code</Text>
          <Text style={s.code}>{referralCode}</Text>
        </div>

        {/* Shareable link */}
        <Text
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.xs,
            fontWeight: 700,
            color: colors.textMuted,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            margin: `0 0 ${spacing['2']}`,
          }}
        >
          Your shareable link
        </Text>
        <div style={s.linkBox}>
          <Link
            href={shareUrl}
            style={{ color: colors.brandDark, textDecoration: 'none', fontFamily: fonts.body, fontSize: fontSize.sm }}
          >
            {shareUrl}
          </Link>
        </div>
      </EmailSection>

      {/* Nudge to keep sharing */}
      <EmailSection>
        <Text style={s.nudge}>
          The more you share, the higher you move. Send your link to anyone who
          cares about honest, verified property listings in Nigeria — landlords,
          agents, buyers, or just friends who are tired of rental scams.
        </Text>

        <EmailButton href={shareUrl} variant="primary">
          Share My Referral Link →
        </EmailButton>
      </EmailSection>

      <EmailFooter
        showUnsubscribe={true}
        unsubscribeUrl={unsubscribeUrl || undefined}
        footerNote="You're receiving this because someone used your referral link."
      />
    </EmailLayout>
  );
}

ReferralSuccessEmail.subject = (_data: ReferralSuccessEmailData) =>
  `Someone just joined using your referral link 🎉`;

export default ReferralSuccessEmail;

export const previewProps: ReferralSuccessEmailData = {
  referrerFirstName: 'Amaka',
  referredFirstName: 'Chidi',
  referralCount: 3,
  referralCode: 'AMAKA9K2',
  referralUrl: 'https://realest.ng/refer?ref=AMAKA9K2',
  contextType: 'waitlist',
};
