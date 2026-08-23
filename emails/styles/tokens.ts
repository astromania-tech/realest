/**
 * RealEST Email Design Tokens
 *
 * Single source of truth for all email styling.
 * Hex values only — OKLCH is not supported by any email client.
 * Derived from lib/styles/tokens/colors.css and lib/constants/design-system.ts
 */

// ─── Brand Colors ─────────────────────────────────────────────────────────────
export const colors = {
  // Primary palette (60-30-10 rule)
  brandDark:    '#07402F', // Dark Green — 60% foundation
  brandNeutral: '#2E322E', // Deep Neutral — 30% secondary
  brandAccent:  '#ADF434', // Acid Green — 10% accent (use sparingly)
  brandLight:   '#F8F9F7', // Off-White — backgrounds

  // Semantic state colors (hex approximations of the OKLCH tokens)
  success:      '#4A9E6B', // oklch(0.70 0.18 145) approx
  successBg:    '#EBF7F0',
  successBorder:'#A8D5BC',

  warning:      '#C4870A', // oklch(0.78 0.18 80) approx
  warningBg:    '#FDF4E7',
  warningBorder:'#F0C070',

  error:        '#C0392B', // oklch(0.60 0.22 25) approx
  errorBg:      '#FDF0EE',
  errorBorder:  '#E8A09A',

  info:         '#2980B9', // oklch(0.65 0.15 240) approx
  infoBg:       '#EEF6FD',
  infoBorder:   '#A3C9E8',

  // UI neutrals
  text:         '#2E322E', // Deep neutral — main body text
  textMuted:    '#6B7572', // Muted — secondary text, captions
  textLight:    '#9CA89E', // Lighter muted for footnotes

  cardBg:       '#FFFFFF',
  pageBg:       '#F8F9F7',
  border:       '#E2E8E5',
  borderLight:  '#EEF2F0',
  divider:      '#D4DDD9',

  // Accent variants for email
  accentDark:   '#8CC428', // Darker acid green for text on light
  accentMuted:  '#DFF79A', // Very light for tinted backgrounds
} as const;

// ─── Typography ───────────────────────────────────────────────────────────────
export const fonts = {
  // Web-safe fallback stacks that closely match the brand fonts
  display:  '"Lufga", "Georgia", "Times New Roman", serif',
  heading:  '"Neulis Neue", "Trebuchet MS", "Helvetica Neue", Arial, sans-serif',
  body:     '"Space Grotesk", "Segoe UI", -apple-system, BlinkMacSystemFont, Arial, sans-serif',
  mono:     '"JetBrains Mono", "Courier New", Courier, monospace',
} as const;

// ─── Font Sizes ───────────────────────────────────────────────────────────────
export const fontSize = {
  xs:   '11px',
  sm:   '13px',
  base: '15px',
  md:   '16px',
  lg:   '18px',
  xl:   '22px',
  '2xl':'26px',
  '3xl':'32px',
} as const;

// ─── Spacing ──────────────────────────────────────────────────────────────────
export const spacing = {
  '1': '4px',
  '2': '8px',
  '3': '12px',
  '4': '16px',
  '5': '20px',
  '6': '24px',
  '8': '32px',
  '10':'40px',
  '12':'48px',
  '16':'64px',
} as const;

// ─── Border Radius ────────────────────────────────────────────────────────────
export const radius = {
  sm:   '4px',
  md:   '8px',
  lg:   '12px',
  xl:   '16px',
  full: '9999px',
} as const;

// ─── Base URL ────────────────────────────────────────────────────────────────
// Falls back to localhost:3000 when neither env var is set (local dev / email preview).
export const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.NEXT_PUBLIC_APP_URL ??
  'http://localhost:3000';

// ─── Shadows (safe for email — avoid box-shadow in Outlook) ───────────────────
export const shadows = {
  // Use only on Gmail/Apple Mail targets; Outlook ignores them gracefully
  card: '0 2px 8px rgba(7, 64, 47, 0.08)',
  sm:   '0 1px 3px rgba(7, 64, 47, 0.10)',
} as const;

// ─── Named theme groups (for component props) ─────────────────────────────────
export type ColorToken = keyof typeof colors;
export type FontToken  = keyof typeof fonts;

export const theme = { colors, fonts, fontSize, spacing, radius, shadows } as const;
export default theme;
