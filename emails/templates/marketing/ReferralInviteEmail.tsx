import * as React from 'react';
import { Link, Section, Text, Hr } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface ReferralInviteEmailData {
  /** The invitee's first name (person receiving the invite) */
  firstName: string;
  /** The referrer's display name (person who sent the invite) */
  inviterName: string;
  /** The referrer's referral code */
  referralCode: string;
  /** Full referral URL with code pre-appended */
  referralUrl?: string;
  /** What the invitee gets for signing up via this link */
  rewardDescription?: string;
  /** What the referrer gets for a successful sign-up */
  rewardForReferrer?: string;
  unsubscribeUrl?: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  heroBg: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['12']} ${spacing['8']}`,
    textAlign: 'center' as const,
  },
  heroEyebrow: {
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
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    letterSpacing: '0.18em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['4']}`,
  },
  inviterCard: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['5']} ${spacing['6']}`,
    marginBottom: spacing['6'],
    textAlign: 'center' as const,
  },
  inviterLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.accentMuted,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  inviterName: {
    fontFamily: fonts.body,
    fontSize: fontSize.xl,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    margin: `0 0 ${spacing['1']}`,
  },
  inviterSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.brandLight,
    margin: 0,
  },
  rewardBox: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['6']} ${spacing['8']}`,
    textAlign: 'center' as const,
    marginBottom: spacing['6'],
  },
  rewardEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.accentMuted,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  rewardValue: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandAccent,
    margin: `0 0 ${spacing['1']}`,
    lineHeight: '1.1',
  },
  rewardSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.brandLight,
    margin: 0,
  },
  refLinkBox: {
    backgroundColor: colors.pageBg,
    border: `1px solid ${colors.border}`,
    padding: `${spacing['3']} ${spacing['4']}`,
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    wordBreak: 'break-all' as const,
    textDecoration: 'none',
    marginBottom: spacing['6'],
  },
  disclaimer: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: '1.5',
    margin: `${spacing['2']} 0 ${spacing['6']}`,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function ReferralInviteEmail({
  firstName = '',
  inviterName = 'A RealEST member',
  referralCode = '',
  referralUrl = '',
  rewardDescription = 'priority early access when we launch',
  unsubscribeUrl = '',
}: ReferralInviteEmailData) {
  const joinUrl = referralUrl || (referralCode
    ? `${BASE_URL}/refer?ref=${referralCode}`
    : `${BASE_URL}/waitlist`);

  return (
    <EmailLayout preview={`${inviterName} invited you to join RealEST early — and there's a reward waiting for you.`}>
      <EmailHeader />

      {/* Hero */}
      <Section style={s.heroBg}>
        <Text style={s.heroEyebrow}>You've been invited</Text>
        <Text style={s.heroHeadline}>
          {inviterName} saved you a spot{' '}
          <span style={{ color: colors.brandAccent }}>
            on Nigeria's most trusted property marketplace.
          </span>
        </Text>
        <Text style={s.heroSub}>
          RealEST is launching soon — verified properties, zero fake listings, no
          movement fees. Join early and get rewarded.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>Hi {firstName || 'there'},</Text>

        <Text style={s.paragraph}>
          <strong>{inviterName}</strong> thinks you'd be a great fit for RealEST —
          Nigeria's first geo-verified property marketplace where every listing is
          physically confirmed before it goes live.
        </Text>

        <Text style={s.paragraph}>
          Because you were personally invited, you get to skip the general queue
          and join the early access waitlist with a reward attached.
        </Text>
      </EmailSection>

      {/* Inviter attribution card */}
      <EmailSection>
        <div style={s.inviterCard}>
          <Text style={s.inviterLabel}>Invited by</Text>
          <Text style={s.inviterName}>{inviterName}</Text>
          <Text style={s.inviterSub}>RealEST early member</Text>
        </div>
      </EmailSection>

      {/* Invitee reward */}
      <EmailSection>
        <Text style={s.sectionLabel}>What you get</Text>
        <div style={s.rewardBox}>
          <Text style={s.rewardEyebrow}>Your reward for joining early</Text>
          <Text style={s.rewardValue}>{rewardDescription}</Text>
          <Text style={s.rewardSub}>automatically applied to your account on launch</Text>
        </div>

        <Text style={s.sectionLabel}>Your invite link</Text>
        <div style={s.refLinkBox}>
          <Link href={joinUrl} style={{ color: colors.brandDark, textDecoration: 'none' }}>
            {joinUrl}
          </Link>
        </div>

        <EmailButton href={joinUrl} variant="primary">
          Accept Invite & Join Early →
        </EmailButton>
      </EmailSection>

      <EmailSection>
        <Text style={s.sectionLabel}>What is RealEST?</Text>
        <Text style={s.paragraph}>
          RealEST is Nigeria's first verified property marketplace — built to end
          the cycle of fake listings, landlord fraud, and wasted inspection fees.
          Every property is geo-tagged and physically verified before it appears
          on the platform. No duplicates. No ghost agents. No movement fees.
        </Text>
        <Text style={s.disclaimer}>
          This invite was sent because {inviterName} shared your email as someone
          who might benefit from early access. If you'd rather not receive these
          emails, you can unsubscribe below — no hard feelings.
        </Text>
      </EmailSection>

      <EmailFooter
        showUnsubscribe={true}
        unsubscribeUrl={unsubscribeUrl || undefined}
        footerNote="Verified properties only. No fake agents. No scams. No movement fees!"
      />
    </EmailLayout>
  );
}

ReferralInviteEmail.subject = (data: ReferralInviteEmailData) =>
  `${data.inviterName} invited you to join RealEST early`;

export default ReferralInviteEmail;

export const previewProps: ReferralInviteEmailData = {
  firstName: 'Adaeze',
  inviterName: 'Nkechi Okafor',
  referralCode: 'NKECHI01',
  referralUrl: 'https://realest.ng/refer?ref=NKECHI01',
  rewardDescription: 'priority early access + 1 month free premium visibility',
  unsubscribeUrl: 'https://realest.ng/unsubscribe?token=abc123',
};
