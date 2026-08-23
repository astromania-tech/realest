import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export type ListingUserType = 'owner' | 'agent';

export interface AgentVsLandlordEmailData {
  firstName: string;
  userType?: ListingUserType;
  listingUrl?: string;
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
  comparisonHeader: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: 700 as const,
    color: colors.brandLight,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    padding: `${spacing['3']} ${spacing['4']}`,
  },
  comparisonCell: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    padding: `${spacing['3']} ${spacing['4']}`,
    borderTop: `1px solid ${colors.border}`,
    verticalAlign: 'top' as const,
  },
  highlight: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.brandDark,
    fontWeight: 700 as const,
    padding: `${spacing['3']} ${spacing['4']}`,
    borderTop: `1px solid ${colors.border}`,
    verticalAlign: 'top' as const,
  },
  feeChip: {
    display: 'inline-block' as const,
    backgroundColor: colors.brandAccent,
    color: colors.brandDark,
    fontFamily: fonts.mono,
    fontSize: fontSize.sm,
    fontWeight: 700 as const,
    padding: `${spacing['1']} ${spacing['3']}`,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function AgentVsLandlordEmail({
  firstName = '',
  userType = 'owner',
  listingUrl = '',
  unsubscribeUrl = '',
}: AgentVsLandlordEmailData) {
  const ctaUrl = listingUrl || `${BASE_URL}/list`;
  const isAgent = userType === 'agent';

  return (
    <EmailLayout preview="1% vs 2% — understanding RealEST listing fees and why they're structured this way.">
      <EmailHeader />

      {/* Hero */}
      <Section style={s.heroBg}>
        <Text style={s.heroEyebrow}>Know Your Numbers</Text>
        <Text style={s.heroHeadline}>
          Agent or Landlord? The fee that applies to you —{' '}
          <span style={{ color: colors.brandAccent }}>and exactly what you get for it.</span>
        </Text>
        <Text style={s.heroSub}>
          RealEST has two listing fee structures. Here's why they're different, and why both
          represent exceptional value compared to traditional agency commissions in Nigeria.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>Hi {firstName},</Text>

        <Text style={s.paragraph}>
          One of the most common questions we're asked is: "How much does it cost to list on
          RealEST?" The honest answer is: it depends on whether you're a{' '}
          <strong>property owner listing your own property</strong>, or a{' '}
          <strong>licensed agent listing on behalf of an owner</strong>. Let's break it down.
        </Text>

        {/* Comparison table */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{
          border: `1px solid ${colors.border}`,
          marginBottom: spacing['6'],
        }}>
          <thead>
            <tr>
              <th style={{ ...s.comparisonHeader as React.CSSProperties, backgroundColor: colors.brandNeutral, width: '30%', textAlign: 'left' }}>
                Feature
              </th>
              <th style={{ ...s.comparisonHeader as React.CSSProperties, backgroundColor: colors.brandDark, textAlign: 'center' }}>
                Private Landlord
              </th>
              <th style={{ ...s.comparisonHeader as React.CSSProperties, backgroundColor: colors.brandNeutral, textAlign: 'center' }}>
                Licensed Agent
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ ...s.comparisonCell as React.CSSProperties, fontWeight: 700, color: colors.text }}>Listing fee</td>
              <td style={{ ...s.highlight as React.CSSProperties, textAlign: 'center', backgroundColor: colors.pageBg }}>
                <span style={s.feeChip}>1%</span>
              </td>
              <td style={{ ...s.comparisonCell as React.CSSProperties, textAlign: 'center' }}>
                2%
              </td>
            </tr>
            <tr>
              <td style={{ ...s.comparisonCell as React.CSSProperties, fontWeight: 700, color: colors.text }}>Verified badge</td>
              <td style={{ ...s.comparisonCell as React.CSSProperties, textAlign: 'center', backgroundColor: colors.pageBg }}>✓</td>
              <td style={{ ...s.comparisonCell as React.CSSProperties, textAlign: 'center' }}>✓</td>
            </tr>
            <tr>
              <td style={{ ...s.comparisonCell as React.CSSProperties, fontWeight: 700, color: colors.text }}>Field inspection</td>
              <td style={{ ...s.comparisonCell as React.CSSProperties, textAlign: 'center', backgroundColor: colors.pageBg }}>✓ Included</td>
              <td style={{ ...s.comparisonCell as React.CSSProperties, textAlign: 'center' }}>✓ Included</td>
            </tr>
            <tr>
              <td style={{ ...s.comparisonCell as React.CSSProperties, fontWeight: 700, color: colors.text }}>Multiple properties</td>
              <td style={{ ...s.comparisonCell as React.CSSProperties, textAlign: 'center', backgroundColor: colors.pageBg }}>Up to 5</td>
              <td style={{ ...s.comparisonCell as React.CSSProperties, textAlign: 'center' }}>Unlimited</td>
            </tr>
            <tr>
              <td style={{ ...s.comparisonCell as React.CSSProperties, fontWeight: 700, color: colors.text }}>Client management</td>
              <td style={{ ...s.comparisonCell as React.CSSProperties, textAlign: 'center', backgroundColor: colors.pageBg }}>—</td>
              <td style={{ ...s.comparisonCell as React.CSSProperties, textAlign: 'center' }}>✓ Full dashboard</td>
            </tr>
            <tr>
              <td style={{ ...s.comparisonCell as React.CSSProperties, fontWeight: 700, color: colors.text }}>Priority support</td>
              <td style={{ ...s.comparisonCell as React.CSSProperties, textAlign: 'center', backgroundColor: colors.pageBg }}>—</td>
              <td style={{ ...s.comparisonCell as React.CSSProperties, textAlign: 'center' }}>✓</td>
            </tr>
          </tbody>
        </table>

        <Text style={s.paragraph}>
          {isAgent
            ? 'As a licensed agent, your 2% fee covers unlimited listings, full client management tools, and priority support from our platform team. Compare that to the 10–15% traditional agency commission — you\'re offering verified listings to clients at a fraction of the overhead.'
            : 'As a private landlord, your 1% fee is the most affordable path to a verified listing in Nigeria. You\'re paying for the field inspection, the geo-verification, the digital title check, and the trust badge that puts your property in front of serious, pre-screened buyers and tenants.'}
        </Text>

        <Text style={s.paragraph}>
          Traditional agency commissions in Nigeria run between <strong>10–15% of annual rent</strong>.
          On RealEST, you pay <strong>1–2% per successful transaction</strong>. The verification isn't
          an added cost — it's what makes the transaction possible in the first place.
        </Text>

        <EmailButton href={ctaUrl} variant="primary">
          {isAgent ? 'Register as an Agent →' : 'List My Property →'}
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

AgentVsLandlordEmail.subject = (data: AgentVsLandlordEmailData) =>
  data.userType === 'agent'
    ? `${data.firstName}, the agent fee structure that actually works for you`
    : `${data.firstName}, why your listing fee on RealEST is just 1%`;

export default AgentVsLandlordEmail;

export const previewProps: AgentVsLandlordEmailData = {
  firstName: 'Biodun',
  userType: 'owner',
  listingUrl: 'https://realest.ng/list',
  unsubscribeUrl: 'https://realest.ng/unsubscribe?token=abc123',
};
