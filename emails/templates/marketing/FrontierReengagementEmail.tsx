import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FrontierReengagementEmailData {
  firstName: string;
  city?: string;
  teaserUrl?: string;
  unsubscribeUrl?: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  heroBg: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['12']} ${spacing['8']}`,
    textAlign: 'center' as const,
  },
  heroLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.brandAccent,
    letterSpacing: '0.22em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['4']}`,
  },
  heroHeadline: {
    fontFamily: fonts.body,
    fontSize: fontSize['3xl'],
    fontWeight: 700 as const,
    color: colors.brandLight,
    lineHeight: '1.15',
    letterSpacing: '-0.02em',
    margin: `0 0 ${spacing['4']}`,
  },
  heroSub: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.accentMuted,
    lineHeight: '1.65',
    margin: 0,
  },
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.65',
    margin: `0 0 ${spacing['5']}`,
  },
  badgePreview: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['10']} ${spacing['8']}`,
    textAlign: 'center' as const,
    margin: `0`,
  },
  badgeChip: {
    display: 'inline-block' as const,
    backgroundColor: colors.brandAccent,
    color: colors.brandDark,
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    fontWeight: 700 as const,
    letterSpacing: '0.12em',
    textTransform: 'uppercase' as const,
    padding: `${spacing['2']} ${spacing['5']}`,
    marginBottom: spacing['6'],
  },
  badgeTitle: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandLight,
    margin: `0 0 ${spacing['3']}`,
  },
  badgeDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.accentMuted,
    lineHeight: '1.6',
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

const POLL_CITIES = ['Lagos', 'Abuja', 'Ibadan', 'Port Harcourt'];

// ─── Component ────────────────────────────────────────────────────────────────
export function FrontierReengagementEmail({
  firstName = '',
  city = 'Lagos',
  teaserUrl = '',
  unsubscribeUrl = '',
}: FrontierReengagementEmailData) {
  const ctaUrl = teaserUrl || `${BASE_URL}/sneak-peek`;

  return (
    <EmailLayout preview={`${firstName}, real estate in Nigeria is finally getting a "Verify" button.`}>
      <EmailHeader />

      {/* Dark hero */}
      <Section style={s.heroBg}>
        <Text style={s.heroLabel}>An update from RealEST</Text>
        <Text style={s.heroHeadline}>
          Real estate in Nigeria is finally getting a{' '}
          <span style={{ color: colors.brandAccent }}>"Verify"</span> button.
        </Text>
        <Text style={s.heroSub}>
          We've been quiet. That silence has a reason — and it's very good news for you.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>Hi {firstName},</Text>

        <Text style={s.paragraph}>
          You joined the RealEST waitlist because you're tired of the chaos — the quack agents,
          the duplicate listings, the "pay first, view later" con that has burned too many
          Nigerians. <strong>We haven't forgotten.</strong>
        </Text>

        <Text style={s.paragraph}>
          In fact, we spent the last several months on the ground in {city}, fine-tuning the{' '}
          <strong>dual-layer verification system</strong> that will protect every property search
          you make on RealEST. We aren't building another property website. We're building a{' '}
          <em>trust engine</em>.
        </Text>

        <Text style={s.paragraph}>
          Every listing on our platform must pass two gates before it ever reaches your screen:
        </Text>

        {/* Two-gate list */}
        <Section style={{
          border: `1px solid ${colors.border}`,
          padding: `${spacing['5']} ${spacing['6']}`,
          marginBottom: spacing['5'],
        }}>
          <table width="100%" cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                <td style={{ verticalAlign: 'top', paddingRight: spacing['4'], width: '28px' }}>
                  <span style={{ fontFamily: fonts.body, fontSize: fontSize.base, color: colors.brandAccent, fontWeight: 700 }}>01</span>
                </td>
                <td>
                  <p style={{ fontFamily: fonts.body, fontSize: fontSize.base, color: colors.text, margin: `0 0 ${spacing['1']}`, fontWeight: 700 }}>
                    ML Document Scanner
                  </p>
                  <p style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, margin: 0, lineHeight: '1.55' }}>
                    Our AI cross-references title documents against CAC and land registry data to catch fakes before a human ever sees them.
                  </p>
                </td>
              </tr>
              <tr>
                <td colSpan={2} style={{ height: spacing['4'] }} />
              </tr>
              <tr>
                <td style={{ verticalAlign: 'top', paddingRight: spacing['4'], width: '28px' }}>
                  <span style={{ fontFamily: fonts.body, fontSize: fontSize.base, color: colors.brandAccent, fontWeight: 700 }}>02</span>
                </td>
                <td>
                  <p style={{ fontFamily: fonts.body, fontSize: fontSize.base, color: colors.text, margin: `0 0 ${spacing['1']}`, fontWeight: 700 }}>
                    Physical Field Inspection
                  </p>
                  <p style={{ fontFamily: fonts.body, fontSize: fontSize.sm, color: colors.textMuted, margin: 0, lineHeight: '1.55' }}>
                    A trained RealEST field agent physically visits the property, verifies the address coordinates match, and signs off on the listing.
                  </p>
                </td>
              </tr>
            </tbody>
          </table>
        </Section>
      </EmailSection>

      {/* Verified badge sneak peek */}
      <Section style={s.badgePreview}>
        <div style={s.badgeChip}>Sneak Peek</div>
        <Text style={s.badgeTitle}>✓ RealEST Verified</Text>
        <Text style={s.badgeDesc}>
          This badge only appears on a listing after it clears both gates. No badge = not on
          the platform. It's that simple — and that strict.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>
          We're getting close. And when we open the doors, you'll have first access — because
          you believed in this before it existed.
        </Text>

        <EmailButton href={ctaUrl} variant="primary">
          See the Verified Badge in Action →
        </EmailButton>

        {/* Micro-poll */}
        <Section style={{
          borderTop: `1px solid ${colors.border}`,
          paddingTop: spacing['6'],
          marginTop: spacing['8'],
        }}>
          <Text style={s.pollLabel}>Quick Poll — Which city should we verify first?</Text>
          <table cellPadding={0} cellSpacing={0}>
            <tbody>
              <tr>
                {POLL_CITIES.map((c) => (
                  <td key={c} style={{ paddingRight: spacing['3'] }}>
                    <Link
                      href={`${BASE_URL}/poll/city?answer=${encodeURIComponent(c)}&ref=frontier`}
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
            One click. Your vote shapes our verification rollout order.
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

FrontierReengagementEmail.subject = (data: FrontierReengagementEmailData) =>
  `${data.firstName}, we've been building something you asked for`;

export default FrontierReengagementEmail;

export const previewProps: FrontierReengagementEmailData = {
  firstName: 'Tunde',
  city: 'Lagos',
  teaserUrl: 'https://realest.ng/sneak-peek',
  unsubscribeUrl: 'https://realest.ng/unsubscribe?token=abc123',
};
