import * as React from 'react';
import { Section, Text, Link } from '@react-email/components';
import { EmailLayout } from '../../layouts/EmailLayout';
import { EmailHeader } from '../../components/EmailHeader';
import { EmailFooter } from '../../components/EmailFooter';
import { EmailSection } from '../../components/EmailUI';
import { EmailButton } from '../../components/EmailButton';
import { BASE_URL, colors, fonts, fontSize, spacing } from '../../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface DigestListing {
  title: string;
  /** Formatted price string e.g. "₦45,000,000" */
  price: string;
  address: string;
  propertyType: string;
  bedrooms?: number;
  propertyId: string;
  listingType: 'sale' | 'rent';
}

export interface WeeklyDigestEmailData {
  recipientName: string;
  locationName: string;
  /** ISO week identifier e.g. "Week of March 3 – 9, 2026" */
  weekLabel: string;
  listings: DigestListing[];
  totalNewThisWeek: number;
  searchUrl?: string;
  unsubscribeUrl?: string;
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = {
  paragraph: {
    fontFamily: fonts.body,
    fontSize: fontSize.base,
    color: colors.text,
    lineHeight: '1.65',
    margin: `0 0 ${spacing['5']}`,
  },
  headline: {
    fontFamily: fonts.body,
    fontSize: fontSize['2xl'],
    fontWeight: 700 as const,
    color: colors.brandLight,
    letterSpacing: '-0.02em',
    lineHeight: '1.2',
    margin: `0 0 ${spacing['2']}`,
  },
  sectionLabel: {
    fontFamily: fonts.body,
    fontSize: fontSize.xs,
    fontWeight: 700 as const,
    color: colors.textMuted,
    textTransform: 'uppercase' as const,
    letterSpacing: '0.12em',
    margin: `0 0 ${spacing['3']}`,
  },
};

// ─── Listing card (email-safe table row) ─────────────────────────────────────
function ListingCard({ listing, index }: { listing: DigestListing; index: number }) {
  const listingUrl = `${BASE_URL}/properties/${listing.propertyId}`;
  const isLast = false; // spacing handled by margin
  const badgeColor = listing.listingType === 'rent' ? colors.brandDark : colors.brandAccent;
  const badgeText  = listing.listingType === 'rent' ? '#F8F9F7' : colors.brandDark;

  return (
    <Section key={listing.propertyId} style={{
      borderBottom: `1px solid ${colors.border}`,
      padding: `${spacing['4']} 0`,
    }}>
      <table width="100%" cellPadding={0} cellSpacing={0}>
        <tbody>
          <tr>
            <td style={{ verticalAlign: 'top' }}>
              {/* Badge */}
              <span style={{
                display: 'inline-block',
                backgroundColor: badgeColor,
                color: badgeText,
                fontFamily: fonts.body,
                fontSize: fontSize.xs,
                fontWeight: 700,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.1em',
                padding: `2px 8px`,
                marginBottom: spacing['2'],
              }}>
                For {listing.listingType === 'rent' ? 'Rent' : 'Sale'}
              </span>
              {/* Title */}
              <Text style={{
                fontFamily: fonts.body,
                fontSize: fontSize.base,
                fontWeight: 700,
                color: colors.brandDark,
                margin: `0 0 ${spacing['1']}`,
              }}>
                <Link href={listingUrl} style={{ color: colors.brandDark, textDecoration: 'none' }}>
                  {listing.title}
                </Link>
              </Text>
              {/* Address + type */}
              <Text style={{
                fontFamily: fonts.body,
                fontSize: fontSize.sm,
                color: colors.textMuted,
                margin: `0 0 ${spacing['2']}`,
              }}>
                {listing.address}
                {listing.bedrooms ? ` · ${listing.bedrooms} bed` : ''}
                {' · '}{listing.propertyType}
              </Text>
              {/* Price + CTA inline */}
              <table width="100%" cellPadding={0} cellSpacing={0}>
                <tbody>
                  <tr>
                    <td>
                      <Text style={{
                        fontFamily: fonts.body,
                        fontSize: fontSize.lg,
                        fontWeight: 700,
                        color: colors.brandDark,
                        margin: 0,
                      }}>
                        {listing.price}
                      </Text>
                    </td>
                    <td align="right">
                      <Link
                        href={listingUrl}
                        style={{
                          fontFamily: fonts.body,
                          fontSize: fontSize.sm,
                          fontWeight: 700,
                          color: colors.brandDark,
                          textDecoration: 'underline',
                        }}
                      >
                        View →
                      </Link>
                    </td>
                  </tr>
                </tbody>
              </table>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export function WeeklyDigestEmail({
  recipientName = '',
  locationName = '',
  weekLabel = '',
  listings = [],
  totalNewThisWeek = 0,
  searchUrl,
  unsubscribeUrl,
}: WeeklyDigestEmailData) {
  const srchUrl = searchUrl ?? `${BASE_URL}/properties?location=${encodeURIComponent(locationName)}`;

  return (
    <EmailLayout preview={`${totalNewThisWeek} new verified properties in ${locationName} this week`}>
      <EmailHeader />

      {/* Dark hero header */}
      <Section style={{
        backgroundColor: colors.brandDark,
        padding: `${spacing['8']} ${spacing['6']} ${spacing['6']}`,  
        textAlign: 'center' as const,
      }}>
        <Text style={{
          fontFamily: fonts.body,
          fontSize: fontSize.xs,
          fontWeight: 700,
          color: colors.brandAccent,
          textTransform: 'uppercase' as const,
          letterSpacing: '0.15em',
          margin: `0 0 ${spacing['3']}`,
        }}>
          Your Weekly Digest · {weekLabel}
        </Text>
        <Text style={s.headline}>
          {totalNewThisWeek} New Verified{'\n'}
          Properties in {locationName}
        </Text>
        <Text style={{
          fontFamily: fonts.body,
          fontSize: fontSize.sm,
          color: colors.accentMuted,
          margin: `${spacing['2']} 0 ${spacing['5']}`,
        }}>
          Curated verified listings matching your saved preferences
        </Text>
        <EmailButton href={srchUrl} variant="primary">
          Browse All Listings →
        </EmailButton>
      </Section>

      <EmailSection>
        <Text style={{ ...s.paragraph, marginTop: spacing['1'] }}>
          Hi {recipientName}, here are this week's standout verified listings in{' '}
          <strong style={{ color: colors.brandDark }}>{locationName}</strong>.
          Every property featured below has passed our physical vetting process.
        </Text>

        {/* Listing count label */}
        <Text style={s.sectionLabel}>
          Featured this week — {listings.length} of {totalNewThisWeek} new listings
        </Text>

        {/* Listings */}
        {listings.map((listing, i) => (
          <ListingCard key={listing.propertyId} listing={listing} index={i} />
        ))}

        {/* Browse more CTA */}
        <Section style={{ textAlign: 'center', margin: `${spacing['6']} 0 ${spacing['4']}` }}>
          <EmailButton href={srchUrl} variant="secondary">
            See All {totalNewThisWeek} New Listings →
          </EmailButton>
        </Section>

        {/* Trust badge row */}
        <Section style={{
          borderTop: `1px solid ${colors.border}`,
          paddingTop: spacing['5'],
          marginTop: spacing['4'],
        }}>
          <Text style={{
            fontFamily: fonts.body,
            fontSize: fontSize.xs,
            color: colors.textMuted,
            textAlign: 'center' as const,
            margin: 0,
            lineHeight: '1.6',
          }}>
            All featured listings are <strong>verified by RealEST field agents</strong>.
            No unverified or fraudulent listings. Ever.
          </Text>
        </Section>
      </EmailSection>

      <EmailFooter showUnsubscribe={true} unsubscribeUrl={unsubscribeUrl} />
    </EmailLayout>
  );
}

WeeklyDigestEmail.subject = (data: WeeklyDigestEmailData) =>
  `${data.totalNewThisWeek} new verified properties in ${data.locationName} — ${data.weekLabel}`;

export const previewProps: WeeklyDigestEmailData = {
  recipientName: 'Adeola Fashola',
  locationName: 'Victoria Island, Lagos',
  weekLabel: 'Week of March 3 – 9, 2026',
  totalNewThisWeek: 14,
  listings: [
    {
      title: '4-Bedroom Duplex with BQ',
      price: '₦180,000,000',
      address: '12 Akin Adesola St, Victoria Island',
      propertyType: 'Duplex',
      bedrooms: 4,
      propertyId: 'prop_vi_001',
      listingType: 'sale',
    },
    {
      title: 'Luxury 3-Bedroom Flat',
      price: '₦3,500,000 / year',
      address: 'Eko Atlantic, VI Adjacent',
      propertyType: 'Flat',
      bedrooms: 3,
      propertyId: 'prop_vi_002',
      listingType: 'rent',
    },
    {
      title: 'Modern 2-Bedroom Service Flat',
      price: '₦2,800,000 / year',
      address: 'Ozumba Mbadiwe Ave, Victoria Island',
      propertyType: 'Service Apartment',
      bedrooms: 2,
      propertyId: 'prop_vi_003',
      listingType: 'rent',
    },
    {
      title: '5-Bedroom Detached House with Pool',
      price: '₦350,000,000',
      address: '7 Glover Road, Ikoyi adjacent VI',
      propertyType: 'Detached House',
      bedrooms: 5,
      propertyId: 'prop_vi_004',
      listingType: 'sale',
    },
  ],
  unsubscribeUrl: `${BASE_URL}/unsubscribe?type=digest`,
};

export default WeeklyDigestEmail;
