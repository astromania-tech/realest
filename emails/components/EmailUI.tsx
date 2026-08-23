import * as React from 'react';
import { Section, Text } from '@react-email/components';
import { colors, fonts, fontSize, spacing, radius } from '../styles/tokens';

interface EmailSectionProps {
  children: React.ReactNode;
  /** Inner padding override — defaults to lg horizontal + xl vertical */
  padding?: string;
  /** Background colour override */
  bg?: string;
}

const sectionStyle = (padding: string, bg: string): React.CSSProperties => ({
  backgroundColor: bg,
  padding,
});

export function EmailSection({
  children,
  padding = `${spacing['8']} ${spacing['8']}`,
  bg = colors.cardBg,
}: EmailSectionProps) {
  return <Section style={sectionStyle(padding, bg)}>{children}</Section>;
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function EmailDivider({ spacing: space = spacing['6'] }: { spacing?: string }) {
  return (
    <Section
      style={{
        borderBottom: `1px solid ${colors.border}`,
        margin: `${space} 0`,
      }}
    />
  );
}

// ─── Label + Value row used in detail cards ───────────────────────────────────
interface DetailRowProps {
  label: string;
  value: React.ReactNode;
  /** Paint value in accent colour */
  accent?: boolean;
}

export function EmailDetailRow({ label, value, accent = false }: DetailRowProps) {
  return (
    <tr>
      <td
        style={{
          padding: `${spacing['3']} 0`,
          borderBottom: `1px solid ${colors.borderLight}`,
          verticalAlign: 'top',
          width: '35%',
        }}
      >
        <span
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.xs,
            color: colors.textMuted,
            textTransform: 'uppercase',
            letterSpacing: '0.8px',
          }}
        >
          {label}
        </span>
      </td>
      <td
        style={{
          padding: `${spacing['3']} 0 ${spacing['3']} ${spacing['4']}`,
          borderBottom: `1px solid ${colors.borderLight}`,
          verticalAlign: 'top',
        }}
      >
        <span
          style={{
            fontFamily: fonts.body,
            fontSize: fontSize.base,
            color: accent ? colors.accentDark : colors.text,
            fontWeight: accent ? 600 : 400,
          }}
        >
          {value}
        </span>
      </td>
    </tr>
  );
}

// ─── Verified badge ───────────────────────────────────────────────────────────
export function VerifiedBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      style={{
        display: 'inline-block',
        backgroundColor: colors.brandAccent,
        color: colors.brandDark,
        fontFamily: fonts.body,
        fontSize: fontSize.xs,
        fontWeight: 700,
        padding: `${spacing['1']} ${spacing['3']}`,
        borderRadius: radius.full,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
      }}
    >
      {children}
    </span>
  );
}

// ─── Headline + body text pair ────────────────────────────────────────────────
export function EmailHeading({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={{
        fontFamily: fonts.heading,
        fontSize: fontSize['2xl'],
        fontWeight: 700,
        color: colors.text,
        margin: `0 0 ${spacing['3']}`,
        lineHeight: '1.3',
        letterSpacing: '-0.3px',
      }}
    >
      {children}
    </Text>
  );
}

export function EmailText({
  children,
  muted = false,
  size = 'base',
}: {
  children: React.ReactNode;
  muted?: boolean;
  size?: keyof typeof fontSize;
}) {
  return (
    <Text
      style={{
        fontFamily: fonts.body,
        fontSize: fontSize[size],
        color: muted ? colors.textMuted : colors.text,
        margin: `0 0 ${spacing['4']}`,
        lineHeight: '1.65',
      }}
    >
      {children}
    </Text>
  );
}

// ─── OTP Code block ───────────────────────────────────────────────────────────
export function OtpBlock({ code }: { code: string }) {
  return (
    <Section
      style={{
        textAlign: 'center' as const,
        padding: `${spacing['6']} 0`,
        margin: `${spacing['4']} 0`,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.mono,
          fontSize: '42px',
          fontWeight: 700,
          letterSpacing: '12px',
          color: colors.brandDark,
          backgroundColor: colors.accentMuted,
          padding: `${spacing['5']} ${spacing['8']}`,
          borderRadius: radius.lg,
          display: 'inline-block',
          margin: '0 auto',
          border: `2px solid ${colors.brandAccent}`,
        }}
      >
        {code}
      </Text>
    </Section>
  );
}
