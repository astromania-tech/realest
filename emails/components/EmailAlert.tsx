import * as React from 'react';
import { Section } from '@react-email/components';
import { colors, spacing, radius } from '../styles/tokens';

type AlertVariant = 'success' | 'warning' | 'error' | 'info' | 'brand';

interface EmailAlertProps {
  variant?: AlertVariant;
  children: React.ReactNode;
}

const variantStyles: Record<AlertVariant, React.CSSProperties> = {
  success: {
    backgroundColor: colors.successBg,
    borderLeft: `4px solid ${colors.success}`,
    color: colors.success,
  },
  warning: {
    backgroundColor: colors.warningBg,
    borderLeft: `4px solid ${colors.warning}`,
    color: colors.warning,
  },
  error: {
    backgroundColor: colors.errorBg,
    borderLeft: `4px solid ${colors.error}`,
    color: colors.error,
  },
  info: {
    backgroundColor: colors.infoBg,
    borderLeft: `4px solid ${colors.info}`,
    color: colors.info,
  },
  brand: {
    backgroundColor: colors.accentMuted,
    borderLeft: `4px solid ${colors.brandAccent}`,
    color: colors.accentDark,
  },
};

export function EmailAlert({ variant = 'info', children }: EmailAlertProps) {
  return (
    <Section
      style={{
        ...variantStyles[variant],
        borderRadius: `0 ${radius.md} ${radius.md} 0`,
        padding: `${spacing['4']} ${spacing['5']}`,
        margin: `${spacing['4']} 0`,
      }}
    >
      {children}
    </Section>
  );
}
