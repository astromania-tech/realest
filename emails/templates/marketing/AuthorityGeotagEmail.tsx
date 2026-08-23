import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface AuthorityGeotagEmailData {
  firstName: string;
  searchUrl?: string;
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
  coordBlock: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['6']} ${spacing['8']}`,
    textAlign: 'center' as const,
  },
  coordLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    color: colors.accentMuted,
    letterSpacing: '0.15em',
    textTransform: 'uppercase' as const,
    margin: `0 0 ${spacing['2']}`,
  },
  coordValue: {
    fontFamily: fonts.mono,
    fontSize: fontSize.base,
    color: colors.brandAccent,
    letterSpacing: '0.08em',
    margin: `0 0 ${spacing['2']}`,
  },
  coordAddress: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.accentMuted,
    margin: 0,
  },
  statRow: {
    backgroundColor: colors.pageBg,
    border: `1px solid ${colors.border}`,
    padding: `${spacing['5']} ${spacing['6']}`,
    marginBottom: spacing['4'],
  },
  statNumber: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandDark,
    margin: `0 0 ${spacing['1']}`,
  },
  statCaption: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: '1.5',
    margin: 0,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function AuthorityGeotagEmail({
  firstName = '',
  searchUrl = '',
  unsubscribeUrl = '',
}: AuthorityGeotagEmailData) {
  const ctaUrl = searchUrl || `${BASE_URL}/search`;

  return (
    <EmailLayout preview="If you can't navigate to it, it doesn't exist on RealEST.">
      <EmailHeader />

      {/* Dark hero */}
      <Section style={s.heroBg}>
        <Text style={s.heroEyebrow}>The RealEST Standard — Part 1 of 3</Text>
        <Text style={s.heroHeadline}>
          Getting lost looking for a house is a{' '}
          <span style={{ color: colors.brandAccent }}>thing of the past.</span>
        </Text>
        <Text style={s.heroSub}>
          Every property on RealEST is geotagged first. If you can't navigate to it, it doesn't
          exist on our platform. Period.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>Hi {firstName},</Text>

        <Text style={s.paragraph}>
          Tell me if this sounds familiar. A listing says "Lekki Phase 1." You go there. The
          agent can't tell you which street. You walk up and down in the heat. Two hours gone.
          The property doesn't exist at that address. Or worse — it does exist, but it belongs
          to somebody else entirely.
        </Text>

        <Text style={s.paragraph}>
          This happens because Nigerian property listings have{' '}
          <strong>never been anchored to a real physical location</strong>. An address is just
          words. We decided to fix that at the foundation level.
        </Text>
      </EmailSection>

      {/* Coordinate display */}
      <Section style={s.coordBlock}>
        <Text style={s.coordLabel}>Example — Verified Property Coordinates</Text>
        <Text style={s.coordValue}>6.4281° N, 3.4219° E</Text>
        <Text style={s.coordAddress}>
          14 Akin Adesola Street, Victoria Island, Lagos · 3BD / 2BA
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>
          Before any property appears on RealEST, the owner must confirm GPS coordinates against
          the stated address. Our system cross-checks those coordinates against satellite imagery
          and street-view data. If the pin doesn't match the address, the listing is rejected —
          no debate, no override.
        </Text>

        {/* Stats */}
        <Section style={s.statRow}>
          <Text style={s.statNumber}>100%</Text>
          <Text style={s.statCaption}>
            of RealEST listings include verified GPS coordinates before going live.
          </Text>
        </Section>

        <Section style={s.statRow}>
          <Text style={s.statNumber}>0 listings</Text>
          <Text style={s.statCaption}>
            have been approved with a mismatched address-coordinate pair. Not one.
          </Text>
        </Section>

        <Text style={s.paragraph}>
          When you find a property on RealEST, the pin on the map is the exact location. You
          open Google Maps, paste the coordinates, and you're there in minutes. No guesswork.
          No agent running you around town.
        </Text>

        <Text style={s.paragraph}>
          That's what "geotagged first" actually means in practice.
        </Text>

        <EmailButton href={ctaUrl} variant="primary">
          Explore Verified Listings →
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

AuthorityGeotagEmail.subject = (_data: AuthorityGeotagEmailData) =>
  `If you can't navigate to it, it doesn't exist on RealEST`;

export default AuthorityGeotagEmail;

export const previewProps: AuthorityGeotagEmailData = {
  firstName: 'Chidi',
  searchUrl: 'https://realest.ng/search',
  unsubscribeUrl: 'https://realest.ng/unsubscribe?token=abc123',
};
