import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthorityBootsGroundEmailData {
  firstName: string;
  /** Number of properties visited this period */
  propertiesVisited?: number;
  /** Number that made the cut */
  propertiesApproved?: number;
  learnMoreUrl?: string;
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
  statGrid: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['8']} ${spacing['8']}`,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.accentMuted,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  statNumber: {
    fontFamily: fonts.body,
    fontSize: fontSize['3xl'],
    fontWeight: 700 as const,
    color: colors.brandAccent,
    lineHeight: '1',
    margin: `0 0 ${spacing['1']}`,
  },
  statCaption: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.brandLight,
    lineHeight: '1.5',
    margin: 0,
  },
  checklistItem: {
    border: `1px solid ${colors.border}`,
    padding: `${spacing['4']} ${spacing['5']}`,
    marginBottom: spacing['3'],
  },
  checkTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    fontWeight: 700 as const,
    color: colors.text,
    margin: `0 0 ${spacing['1']}`,
  },
  checkDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: '1.5',
    margin: 0,
  },
};

const CHECKLIST = [
  { title: 'Physical presence confirmed', desc: 'Agent attends the property in person and photographs every room.' },
  { title: 'Address-coordinate match', desc: 'GPS coordinates pinned on-site and cross-checked against the listing.' },
  { title: 'Title document verification', desc: 'Certificate of Occupancy (C of O) or deed checked against registry records.' },
  { title: 'Owner identity verified', desc: 'Owner ID or Power of Attorney validated before approval is granted.' },
  { title: 'No active dispute', desc: 'Property screened against known court orders and community disputes in the area.' },
];

// ─── Component ────────────────────────────────────────────────────────────────
export function AuthorityBootsGroundEmail({
  firstName = '',
  propertiesVisited = 50,
  propertiesApproved = 12,
  learnMoreUrl = '',
  unsubscribeUrl = '',
}: AuthorityBootsGroundEmailData) {
  const ctaUrl = learnMoreUrl || `${BASE_URL}/how-it-works`;
  const rejectionRate = Math.round(((propertiesVisited - propertiesApproved) / propertiesVisited) * 100);

  return (
    <EmailLayout preview={`We visited ${propertiesVisited} properties this week. Only ${propertiesApproved} made the cut.`}>
      <EmailHeader />

      {/* Dark hero */}
      <Section style={s.heroBg}>
        <Text style={s.heroEyebrow}>The RealEST Standard — Part 2 of 3</Text>
        <Text style={s.heroHeadline}>
          We do the dirty work.{' '}
          <span style={{ color: colors.brandAccent }}>You get the verified results.</span>
        </Text>
        <Text style={s.heroSub}>
          Our team visited {propertiesVisited} properties this week so you don't have to.
          Only {propertiesApproved} made the cut.
        </Text>
      </Section>

      {/* Stats highlight */}
      <Section style={s.statGrid}>
        <table width="100%" cellPadding={0} cellSpacing={0}>
          <tbody>
            <tr>
              <td style={{ width: '50%', paddingRight: spacing['4'], verticalAlign: 'top' }}>
                <Text style={s.statLabel}>Visited</Text>
                <Text style={s.statNumber}>{propertiesVisited}</Text>
                <Text style={s.statCaption}>Properties physically<br />inspected this week</Text>
              </td>
              <td style={{ width: '50%', verticalAlign: 'top' }}>
                <Text style={s.statLabel}>Approved</Text>
                <Text style={s.statNumber}>{propertiesApproved}</Text>
                <Text style={s.statCaption}>{rejectionRate}% rejection rate.<br />We don't compromise.</Text>
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>Hi {firstName},</Text>

        <Text style={s.paragraph}>
          Every verified listing on RealEST carries the weight of our field agents' time and
          judgment. They travel to the property. They check every room. They pin GPS
          coordinates. They review documents on-site. And then — most importantly — they have
          the power to say <em>no</em>.
        </Text>

        <Text style={s.paragraph}>
          A {rejectionRate}% rejection rate isn't a flaw in our process. It's the whole point.
          If it was easy to get listed on RealEST, the badge would mean nothing. The strictness
          is the product.
        </Text>

        <Text style={{
          fontFamily: fonts.body,
          fontSize: fontSize.sm,
          fontWeight: 700 as const,
          color: colors.text,
          letterSpacing: '0.05em',
          textTransform: 'uppercase' as const,
          margin: `0 0 ${spacing['4']}`,
        }}>
          What our field agents verify at every visit:
        </Text>

        {CHECKLIST.map((item) => (
          <Section key={item.title} style={s.checklistItem}>
            <table width="100%" cellPadding={0} cellSpacing={0}>
              <tbody>
                <tr>
                  <td style={{ verticalAlign: 'top', width: '20px', paddingTop: '1px' }}>
                    <span style={{ fontFamily: fonts.body, fontSize: fontSize.base, color: colors.brandAccent, fontWeight: 700 }}>
                      ✓
                    </span>
                  </td>
                  <td style={{ paddingLeft: spacing['3'] }}>
                    <p style={s.checkTitle}>{item.title}</p>
                    <p style={s.checkDesc}>{item.desc}</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </Section>
        ))}

        <Text style={s.paragraph}>
          When you eventually search RealEST, every property you see has cleared this list.
          That's not a marketing promise — it's our operational standard, maintained by human
          agents on the ground.
        </Text>

        <EmailButton href={ctaUrl} variant="primary">
          See How Our Vetting Works →
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

AuthorityBootsGroundEmail.subject = (data: AuthorityBootsGroundEmailData) =>
  `We visited ${data.propertiesVisited ?? 50} properties this week. Only ${data.propertiesApproved ?? 12} made the cut.`;

export default AuthorityBootsGroundEmail;

export const previewProps: AuthorityBootsGroundEmailData = {
  firstName: 'Amaka',
  propertiesVisited: 50,
  propertiesApproved: 12,
  learnMoreUrl: 'https://realest.ng/how-it-works',
  unsubscribeUrl: 'https://realest.ng/unsubscribe?token=abc123',
};
