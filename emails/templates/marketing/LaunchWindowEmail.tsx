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
export interface LaunchWindowEmailData {
  firstName: string;
  /** e.g. "April 2026" */
  newLaunchTarget: string;
  /** supply persona gets listing waiver copy, general does not */
  audience?: 'general' | 'supply';
  /** Number of free listings offered to early waitlist members */
  freeListingsReward?: number;
  referralUrl?: string;
  unsubscribeUrl?: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  heroBg: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['10']} ${spacing['8']}`,
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
  rewardBox: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['8']} ${spacing['8']}`,
    textAlign: 'center' as const,
  },
  rewardEyebrow: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    letterSpacing: '0.2em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['3']}`,
  },
  rewardNumber: {
    fontFamily: fonts.body,
    fontSize: fontSize['3xl'],
    fontWeight: 700 as const,
    color: colors.brandAccent,
    lineHeight: '1',
    margin: `0 0 ${spacing['3']}`,
  },
  rewardTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.lg,
    fontWeight: 700 as const,
    color: colors.brandLight,
    margin: `0 0 ${spacing['3']}`,
  },
  rewardDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.accentMuted,
    lineHeight: '1.6',
    margin: 0,
  },
  timelineItem: {
    paddingBottom: spacing['4'],
    paddingLeft: spacing['5'],
    borderLeft: `2px solid ${colors.brandAccent}`,
    marginBottom: spacing['4'],
  },
  timelineLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['1']}`,
  },
  timelineTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    fontWeight: 700 as const,
    color: colors.text,
    margin: `0 0 ${spacing['1']}`,
  },
  timelineDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: '1.5',
    margin: 0,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function LaunchWindowEmail({
  firstName = '',
  newLaunchTarget = 'Q2 2026',
  audience = 'general',
  freeListingsReward = 2,
  referralUrl = '',
  unsubscribeUrl = '',
}: LaunchWindowEmailData) {
  const ctaUrl = referralUrl || `${BASE_URL}/refer`;
  const isSupplyAudience = audience === 'supply';

  return (
    <EmailLayout preview={`${firstName}, we're taking a few more weeks. Here's the honest reason why.`}>
      <EmailHeader />

      {/* Hero */}
      <Section style={s.heroBg}>
        <Text style={s.heroEyebrow}>A Message from the RealEST Team</Text>
        <Text style={s.heroHeadline}>
          We're taking a few more weeks.{' '}
          <span style={{ color: colors.brandAccent }}>Here's the honest reason why.</span>
        </Text>
        <Text style={s.heroSub}>
          New target: <strong style={{ color: colors.brandAccent }}>{newLaunchTarget}</strong>.
          And we're bringing a gift for waiting.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>Hi {firstName},</Text>

        <Text style={s.paragraph}>
          We owe you transparency. Our original timeline was optimistic. And rather than ship
          something that embarrasses the trust you've placed in us, we've extended our launch
          window to <strong>{newLaunchTarget}</strong>.
        </Text>

        <EmailAlert variant="info">
          <p style={{ fontFamily: fonts.body, fontSize: fontSize.sm, fontWeight: 700, margin: `0 0 ${spacing['1']}`, color: colors.info }}>
            What pushed the timeline?
          </p>
          <p style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.text, margin: 0, lineHeight: '1.6' }}>
            We're in the final Stress Test phase. Our ML document scanner needs to spot even the
            most sophisticated fake title documents — not just obvious ones. We've extended the
            window to ensure it can. Your security is the only thing we will not compromise on.
          </p>
        </EmailAlert>

        <Text style={s.paragraph}>
          Here's what we've completed in the time you've been waiting — and what's left before
          we go live:
        </Text>

        {/* Timeline */}
        <Section style={s.timelineItem}>
          <Text style={s.timelineLabel}>✓ Done</Text>
          <Text style={s.timelineTitle}>Geo-verification engine</Text>
          <Text style={s.timelineDesc}>GPS coordinate validation integrated into every listing submission flow.</Text>
        </Section>

        <Section style={s.timelineItem}>
          <Text style={s.timelineLabel}>✓ Done</Text>
          <Text style={s.timelineTitle}>Field agent network — Lagos & Port Harcourt</Text>
          <Text style={s.timelineDesc}>Trained field inspectors active across both cities.</Text>
        </Section>

        <Section style={{ ...s.timelineItem, borderLeft: `2px solid ${colors.border}` }}>
          <Text style={{ ...s.timelineLabel, color: colors.textMuted }}>In Progress</Text>
          <Text style={s.timelineTitle}>ML document scanner — final calibration</Text>
          <Text style={s.timelineDesc}>Currently stress-testing against a corpus of known fraudulent title documents.</Text>
        </Section>

        <Section style={{ ...s.timelineItem, borderLeft: `2px solid ${colors.border}` }}>
          <Text style={{ ...s.timelineLabel, color: colors.textMuted }}>Final</Text>
          <Text style={s.timelineTitle}>Load testing + security audit</Text>
          <Text style={s.timelineDesc}>Full platform pen test and 10,000-user load simulation before launch.</Text>
        </Section>
      </EmailSection>

      {/* Waitlist reward (persona-segmented copy) */}
      <Section style={s.rewardBox}>
        <Text style={s.rewardEyebrow}>Waitlist Reward</Text>
        {isSupplyAudience ? (
          <>
            <Text style={s.rewardNumber}>1 Free Listing</Text>
            <Text style={s.rewardTitle}>For your first owner/agent listing.</Text>
            <Text style={s.rewardDesc}>
              Since you've been with us from the beginning, your <strong style={{ color: colors.brandAccent }}>first listing</strong>{' '}
              as an agent or property owner on RealEST will be free if used within <strong style={{ color: colors.brandAccent }}>6 months</strong>{' '}
              of launch. It's our way of honoring your early support.
            </Text>
          </>
        ) : (
          <>
            <Text style={s.rewardNumber}>Priority Waitlist Access</Text>
            <Text style={s.rewardTitle}>You still get rewarded for staying with us.</Text>
            <Text style={s.rewardDesc}>
              You're in our early cohort, so you'll continue receiving launch previews, milestone updates,
              and prioritized rollout access as we move toward launch.
            </Text>
          </>
        )}
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>
          Know someone who should join RealEST early? Send your invite link now so they can claim
          <em> their</em> pre-launch perks too. Strong referrals help us launch with better demand,
          better supply, and better trust signals for everyone.
        </Text>

        <EmailButton href={ctaUrl} variant="primary">
          Share My Invite Link →
        </EmailButton>
      </EmailSection>

      <EmailFooter
        showUnsubscribe={true}
        unsubscribeUrl={unsubscribeUrl || undefined}
        footerNote="Verified properties only. No fake agents. No scams. No movement fees!"
      />
    </EmailLayout>
  );
}

LaunchWindowEmail.subject = (data: LaunchWindowEmailData) =>
  `${data.firstName}, we're taking a few more weeks — here's why (and your reward for waiting)`;

export default LaunchWindowEmail;

export const previewProps: LaunchWindowEmailData = {
  firstName: 'Emeka',
  newLaunchTarget: 'April 2026',
  audience: 'supply',
  freeListingsReward: 1,
  referralUrl: 'https://realest.ng/refer?code=EMEKA2026',
  unsubscribeUrl: 'https://realest.ng/unsubscribe?token=abc123',
};
