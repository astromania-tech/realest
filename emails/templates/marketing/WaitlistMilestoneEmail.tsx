import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface WaitlistMilestoneEmailData {
  firstName: string;
  /** e.g. 5000 */
  milestoneCount: number;
  /** formatted string e.g. "5,000" */
  milestoneFormatted?: string;
  /** Features being built for this milestone */
  featuresPreview?: string[];
  waitlistUrl?: string;
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
  heroMilestone: {
    fontFamily: fonts.body,
    fontSize: fontSize['3xl'],
    fontWeight: 700 as const,
    color: colors.brandAccent,
    lineHeight: '1',
    margin: `0 0 ${spacing['3']}`,
    letterSpacing: '-0.02em',
  },
  heroHeadline: {
    fontFamily: fonts.body,
    fontSize: fontSize.xl,
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
  featureCard: {
    border: `1px solid ${colors.border}`,
    borderLeft: `4px solid ${colors.brandAccent}`,
    padding: `${spacing['4']} ${spacing['5']}`,
    marginBottom: spacing['3'],
  },
  featureText: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.5',
    margin: 0,
  },
  pollLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.textMuted,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['4']}`,
  },
  pollNote: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.textLight,
    margin: `${spacing['3']} 0 0`,
  },
};

const DEFAULT_FEATURES = [
  'Geo-verified property locations — every pin confirmed on-site',
  'Real-time inquiry and offer messaging between buyer and owner',
  'ML document scanner to auto-detect title deed forgeries',
  'Physical field inspection before any listing goes live',
  'Verified Landlord Badge — searchable and filterable',
];

const POLL_CITIES = ['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt'];

// ─── Component ────────────────────────────────────────────────────────────────
export function WaitlistMilestoneEmail({
  firstName = '',
  milestoneCount = 5000,
  milestoneFormatted = '',
  featuresPreview = [],
  waitlistUrl = '',
  unsubscribeUrl = '',
}: WaitlistMilestoneEmailData) {
  const displayCount = milestoneFormatted || milestoneCount.toLocaleString('en-NG');
  const features = featuresPreview.length > 0 ? featuresPreview : DEFAULT_FEATURES;
  const ctaUrl = waitlistUrl || `${BASE_URL}/waitlist`;

  return (
    <EmailLayout preview={`We just hit ${displayCount} users! Here's what we're building for you.`}>
      <EmailHeader />

      {/* Milestone hero */}
      <Section style={s.heroBg}>
        <Text style={s.heroEyebrow}>Community Milestone</Text>
        <Text style={s.heroMilestone}>{displayCount}</Text>
        <Text style={s.heroHeadline}>
          Nigerians are done waiting for{' '}
          <span style={{ color: colors.brandAccent }}>honest real estate.</span>
        </Text>
        <Text style={s.heroSub}>
          You're one of them. And because of the demand you've shown, we're accelerating
          what we're building for launch day.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>Hi {firstName},</Text>

        <Text style={s.paragraph}>
          When we opened the waitlist, we were hoping for a few hundred early adopters. Today
          we hit <strong>{displayCount} users</strong>. That number tells us something important:
          the frustration with Nigerian real estate is not just widespread — it's ready to
          be solved.
        </Text>

        <Text style={s.paragraph}>
          Every person on this list represents someone who's been burnt by a misleading listing,
          lost money to a fake agent, or simply given up trying to find a decent place to rent or
          buy. You signed up because you deserve better. We're building that "better" right now.
        </Text>

        <Text style={{
          fontFamily: fonts.body,
          fontSize: fontSize.sm,
          fontWeight: 700 as const,
          color: colors.text,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.1em',
          margin: `0 0 ${spacing['4']}`,
        }}>
          What {displayCount} verified users unlock for everyone:
        </Text>

        {features.map((f) => (
          <Section key={f} style={s.featureCard}>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={{ width: '24px', verticalAlign: 'top', paddingTop: '1px' }}>
                    <span style={{ fontFamily: fonts.body, fontSize: fontSize.base, color: colors.brandAccent }}>→</span>
                  </td>
                  <td style={{ paddingLeft: spacing['3'] }}>
                    <p style={s.featureText}>{f}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>
        ))}

        <Text style={{ ...s.paragraph, marginTop: spacing['5'] }}>
          The bigger this community grows before launch, the more verified supply we can bring
          on board. More verified owners means more choice for seekers. Share the link below and
          help us hit the next milestone.
        </Text>

        <EmailButton href={ctaUrl} variant="primary">
          Share the Waitlist →
        </EmailButton>

        {/* Micro-poll */}
        <Section style={{
          borderTop: `1px solid ${colors.border}`,
          paddingTop: spacing['6'],
          marginTop: spacing['8'],
        }}>
          <Text style={s.pollLabel}>Which city should we verify next?</Text>
          <table cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                {POLL_CITIES.map((c) => (
                  <td key={c} style={{ paddingRight: spacing['3'] }}>
                    <Link
                      href={`${BASE_URL}/poll/city?answer=${encodeURIComponent(c)}&ref=milestone`}
                      style={{
                        display: 'inline-block',
                        padding: `${spacing['2']} ${spacing['4']}`,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '4px',
                        fontFamily: fonts.body,
                        fontSize: fontSize.sm,
                        fontWeight: 600,
                        color: colors.brandDark,
                        textDecoration: 'none',
                        whiteSpace: 'nowrap' as const,
                      }}
                    >
                      {c}
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
          <Text style={s.pollNote}>
            One tap. Helps us prioritise our field agent rollout.
          </Text>
        </Section>
      </EmailSection>

      <EmailFooter
        showUnsubscribe={true}
        unsubscribeUrl={unsubscribeUrl || undefined}
        footerNote="Verified properties only. No fake agents. No scams. No movement fees!"
      />
    </EmailLayout>
  );
}

WaitlistMilestoneEmail.subject = (data: WaitlistMilestoneEmailData) => {
  const count = data.milestoneFormatted || data.milestoneCount.toLocaleString('en-NG');
  return `We just hit ${count} users! Here's what we're building for you`;
};

export default WaitlistMilestoneEmail;

export const previewProps: WaitlistMilestoneEmailData = {
  firstName: 'Sade',
  milestoneCount: 5000,
  milestoneFormatted: '5,000',
  waitlistUrl: 'https://realest.ng/waitlist',
  unsubscribeUrl: 'https://realest.ng/unsubscribe?token=abc123',
};
