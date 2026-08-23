import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface PropertyCategory {
  name: string;
  description: string;
  emoji?: string;
}

export interface PropertyCategoriesEmailData {
  firstName: string;
  browseUrl?: string;
  unsubscribeUrl?: string;
  categories?: PropertyCategory[];
}

// ─── Defaults ─────────────────────────────────────────────────────────────────
const DEFAULT_CATEGORIES: PropertyCategory[] = [
  { name: 'Apartments & Flats', description: 'From studio to 5-bedroom — every unit GPS tagged', emoji: '🏢' },
  { name: 'Detached Houses', description: 'Bungalows, duplexes, and mansions with verified C of O', emoji: '🏠' },
  { name: 'Boys Quarters (BQ)', description: 'Nigeria\'s most underrated housing category, verified', emoji: '🏘️' },
  { name: 'Commercial Spaces', description: 'Shops, offices, showrooms — with geotag and survey plan', emoji: '🏬' },
  { name: 'Event Centers', description: 'Real locations, real capacity, real photos — no scams', emoji: '🎪' },
  { name: 'Educational Facilities', description: 'Schools and training centers mapped to the meter', emoji: '🏫' },
  { name: 'Short Lets', description: 'Verified short-stay properties for business and leisure', emoji: '🛎️' },
];

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
    margin: `0 0 ${spacing['5']}`,
  },
  categoryRow: {
    borderBottom: `1px solid ${colors.border}`,
    paddingBottom: spacing['4'],
    marginBottom: spacing['4'],
  },
  categoryEmoji: {
    fontFamily: fonts.body,
    fontSize: fontSize.xl,
    margin: `0 0 ${spacing['1']}`,
    display: 'block' as const,
  },
  categoryName: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    fontWeight: 700 as const,
    color: colors.text,
    margin: `0 0 ${spacing['1']}`,
  },
  categoryDesc: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.textMuted,
    margin: 0,
    lineHeight: '1.5',
  },
  statBox: {
    backgroundColor: colors.brandDark,
    padding: `${spacing['5']} ${spacing['6']}`,
    textAlign: 'center' as const,
    marginBottom: spacing['6'],
  },
  statNumber: {
    fontFamily: fonts.mono,
    fontSize: fontSize['3xl'],
    fontWeight: 700 as const,
    color: colors.brandAccent,
    margin: `0 0 ${spacing['2']}`,
    display: 'block' as const,
  },
  statLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.sm,
    color: colors.brandLight,
    margin: 0,
  },
};

// ─── Component ────────────────────────────────────────────────────────────────
export function PropertyCategoriesEmail({
  firstName = '',
  browseUrl = '',
  unsubscribeUrl = '',
  categories = [],
}: PropertyCategoriesEmailData) {
  const ctaUrl = browseUrl || `${BASE_URL}/search`;
  const categoryList = categories.length > 0 ? categories : DEFAULT_CATEGORIES;

  return (
    <EmailLayout preview="Not just houses — 7 property types you'll find on RealEST, all GPS-verified.">
      <EmailHeader />

      {/* Hero */}
      <Section style={s.heroBg}>
        <Text style={s.heroEyebrow}>Beyond Residential</Text>
        <Text style={s.heroHeadline}>
          RealEST isn't just houses.{' '}
          <span style={{ color: colors.brandAccent }}>
            We're geotagging every property category in Nigeria.
          </span>
        </Text>
        <Text style={s.heroSub}>
          From Boys Quarters to Event Centers — if it has a physical address in Nigeria,
          it belongs on RealEST. Verified, mapped, and fraud-free.
        </Text>
      </Section>

      <EmailSection>
        <Text style={s.paragraph}>Hi {firstName},</Text>

        <Text style={s.paragraph}>
          When most people think of a property platform, they imagine apartments and houses.
          That's fair — but Nigeria's property market is vastly more complex. A mother looking
          for a BQ near her children's school. A startup needing a verified event center in
          Ikeja. A business owner hunting a commercial shopfront in Nnewi.
        </Text>

        <Text style={s.paragraph}>
          RealEST is built to serve all of them. Here are the{' '}
          <strong>7 property categories</strong> you'll find on our platform, every single
          one GPS-verified and field-inspected:
        </Text>
      </EmailSection>

      <EmailSection>
        <Text style={s.sectionLabel}>Property Categories</Text>

        {categoryList.map((cat, i) => (
          <div key={i} style={i < categoryList.length - 1 ? s.categoryRow : undefined}>
            {cat.emoji && <span style={s.categoryEmoji}>{cat.emoji}</span>}
            <Text style={s.categoryName}>{cat.name}</Text>
            <Text style={s.categoryDesc}>{cat.description}</Text>
          </div>
        ))}
      </EmailSection>

      <EmailSection>
        {/* Stats */}
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ marginBottom: spacing['6'] }}>
          <tbody>
            <tr>
              <td style={{ ...s.statBox as React.CSSProperties, width: '33%', verticalAlign: 'top' }}>
                <span style={s.statNumber}>7</span>
                <Text style={s.statLabel}>verified categories</Text>
              </td>
              <td width="2%" />
              <td style={{ ...s.statBox as React.CSSProperties, width: '33%', verticalAlign: 'top' }}>
                <span style={s.statNumber}>100%</span>
                <Text style={s.statLabel}>GPS-tagged listings</Text>
              </td>
              <td width="2%" />
              <td style={{ ...s.statBox as React.CSSProperties, width: '33%', verticalAlign: 'top' }}>
                <span style={s.statNumber}>0</span>
                <Text style={s.statLabel}>unverified listings allowed</Text>
              </td>
            </tr>
          </tbody>
        </table>

        <Text style={{
          fontFamily: fonts.body,
          fontSize: fontSize.base,
          color: colors.text,
          lineHeight: '1.65',
          margin: `0 0 ${spacing['6']}`,
        }}>
          Every category comes with the same rigorous verification: coordinates matched to
          within 3 metres, physical documents cross-checked, and at least one field visit
          by our local agents before the verified badge is awarded. No exceptions.
        </Text>

        <EmailButton href={ctaUrl} variant="primary">
          Browse All Categories →
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

PropertyCategoriesEmail.subject = (data: PropertyCategoriesEmailData) =>
  `${data.firstName}, not just houses: 7 property types you'll find on RealEST`;

export default PropertyCategoriesEmail;

export const previewProps: PropertyCategoriesEmailData = {
  firstName: 'Chisom',
  browseUrl: 'https://realest.ng/search',
  unsubscribeUrl: 'https://realest.ng/unsubscribe?token=abc123',
  categories: [],
};
