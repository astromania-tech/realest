import * as React from 'react';
import { Button as ResendButton } from '@react-email/components';
import { colors, fonts, fontSize, spacing, radius } from '../styles/tokens';

type ButtonVariant = 'primary' | 'secondary' | 'ghost';

interface EmailButtonProps {
  href: string;
  children: React.ReactNode;
  variant?: ButtonVariant;
  /** Full-width button */
  block?: boolean;
}

const base: React.CSSProperties = {
  fontFamily: fonts.body,
  fontSize: fontSize.base,
  fontWeight: 600,
  borderRadius: radius.md,
  display: 'inline-block',
  textDecoration: 'none',
  textAlign: 'center' as const,
  padding: `14px ${spacing['8']}`,
  lineHeight: '1',
  cursor: 'pointer',
};

const variants: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: colors.brandAccent,
    color: colors.brandDark,
    border: `2px solid ${colors.brandAccent}`,
  },
  secondary: {
    backgroundColor: 'transparent',
    color: colors.brandDark,
    border: `2px solid ${colors.brandDark}`,
  },
  ghost: {
    backgroundColor: 'transparent',
    color: colors.brandDark,
    border: 'none',
    textDecoration: 'underline',
  },
};

export function EmailButton({
  href,
  children,
  variant = 'primary',
  block = true,
}: EmailButtonProps) {
  const style: React.CSSProperties = {
    ...base,
    ...variants[variant],
    ...(block ? { width: '100%', boxSizing: 'border-box' as const } : {}),
  };

  return (
    <ResendButton href={href} style={style}>
      {children}
    </ResendButton>
  );
}
