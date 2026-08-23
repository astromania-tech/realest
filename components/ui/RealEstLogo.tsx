"use client";

import React from 'react';
import { cn } from '@/lib/utils';

export interface RealEstLogoProps {
  /**
   * icon        → realest-logo.svg (mark only, square)
   * wordmark    → realest-wordmark-{theme}.svg (RealEST Connect text)
   * full        → realest-logo-wordmark-{theme}.svg (mark + wordmark + tagline)
   * minimal     → alias for icon
   * text        → alias for wordmark
   */
  variant?: 'icon' | 'wordmark' | 'full' | 'with-text' | 'minimal' | 'text';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  /**
   * dark → use -dark.svg variant (dark logo, for light backgrounds)
   * light → use -light.svg variant (light logo, for dark backgrounds)
   * auto → renders both, CSS dark-mode class switches between them
   */
  theme?: 'dark' | 'light' | 'auto';
  animated?: boolean;
  className?: string;
  onClick?: () => void;
}

// Height (px) per size step — width is derived from per-variant aspect ratio
const HEIGHT: Record<NonNullable<RealEstLogoProps['size']>, number> = {
  xs:    20,
  sm:    32,
  md:    44,
  lg:    56,
  xl:    72,
  '2xl': 96,
};

// Aspect ratios (width / height) measured from SVG viewBox
const ASPECT = {
  icon:        1,     // 17.653 × 17.653
  wordmark:    1.969, // 249.23 × 126.59
  full:        3.011, // 387.49 × 128.69
  'with-text': 5.852, // 76.8 × 13.128 — realest-logo-with-text-{dark|light}.svg
} as const;

function resolveVariant(v: NonNullable<RealEstLogoProps['variant']>) {
  if (v === 'minimal') return 'icon';
  if (v === 'text') return 'wordmark';
  return v as 'icon' | 'wordmark' | 'full' | 'with-text';
}

const RealEstLogo: React.FC<RealEstLogoProps> = ({
  variant = 'full',
  size = 'md',
  theme = 'auto',
  animated = false,
  className,
  onClick,
}) => {
  const resolved = resolveVariant(variant);
  const h = HEIGHT[size];
  const w = Math.round(h * ASPECT[resolved as keyof typeof ASPECT]);

  const imgProps = {
    height: h,
    width: resolved === 'icon' ? h : w,
    style: { height: h, width: resolved === 'icon' ? h : w } as React.CSSProperties,
  };

  const renderIcon = () => {
    // icon variant: plain mark — no dark/light file variants exist, use CSS invert for dark mode
    if (theme === 'light') {
      // explicit request for light-on-dark: invert the dark mark
      return (
        <img src="/realest-logo.svg" alt="RealEST Connect" {...imgProps} className="block" style={{ ...imgProps.style, filter: 'invert(1)' }} />
      );
    }
    if (theme === 'dark') {
      // explicit request for dark-on-light: use mark as-is
      return (
        <img src="/realest-logo.svg" alt="RealEST Connect" {...imgProps} className="block" />
      );
    }
    // auto — dark mark in light mode, CSS-inverted (light) mark in dark mode
    return (
      <>
        {/* Light mode: dark mark on light bg */}
        <img src="/realest-logo.svg" alt="RealEST Connect" {...imgProps} className="block dark:hidden" />
        {/* Dark mode: light mark on dark bg (CSS invert) */}
        <img src="/realest-logo.svg" alt="RealEST Connect" {...imgProps} className="hidden dark:block" style={{ ...imgProps.style, filter: 'invert(1)' }} />
      </>
    );
  };

  const renderThemed = (fileBase: 'realest-wordmark' | 'realest-logo-wordmark' | 'realest-logo-with-text', alt: string) => {
    if (theme === 'dark') {
      return <img src={`/${fileBase}-.svg`} alt={alt} {...imgProps} className="block" />;
    }
    if (theme === 'light') {
      return <img src={`/${fileBase}-dark.svg`} alt={alt} {...imgProps} className="block" />;
    }
    // auto — show/hide via Tailwind dark mode
    return (
      <>
        {/* Light mode: dark logo (dark text on light bg) */}
        <img src={`/${fileBase}-dark.svg`} alt={alt} {...imgProps} className="block dark:hidden" />
        {/* Dark mode: light logo (light text on dark bg) */}
        <img src={`/${fileBase}-light.svg`} alt={alt} {...imgProps} className="hidden dark:block" />
      </>
    );
  };

  return (
    <div
      className={cn(
        'inline-flex items-center',
        animated && 'transition-opacity duration-200 hover:opacity-80',
        onClick && 'cursor-pointer',
        className,
      )}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {resolved === 'icon'        && renderIcon()}
      {resolved === 'wordmark'    && renderThemed('realest-wordmark', 'RealEST Connect')}
      {resolved === 'full'         && renderThemed('realest-logo-wordmark', 'RealEST Connect — Find Your Next Move Seamlessly')}
      {resolved === 'with-text'   && renderThemed('realest-logo-with-text', 'RealEST Connect')}
    </div>
  );
};

// ─── Pre-configured convenience exports ───────────────────────────────────────

/** Full logo with wordmark + tagline, auto theme, md size */
export const HeaderLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="full" size="xl" animated {...props} />
);

/** Wordmark only, auto theme, sm size */
export const FooterLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="wordmark" size="2xl" {...props} />
);

/** Large full logo for hero sections */
export const HeroLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="full" size="2xl" animated {...props} />
);

/** Icon/mark only for mobile nav, favicons, avatars */
export const MobileLogo = (props: Omit<RealEstLogoProps, 'variant' | 'size'>) => (
  <RealEstLogo variant="icon" size="md" {...props} />
);

export const LoadingLogo = (props: Omit<RealEstLogoProps, 'animated'>) => (
  <RealEstLogo animated={true} {...props} />
);

/** Logo + text lockup, auto theme — for slim headers/footers */
export const LogoWithText = (props: Omit<RealEstLogoProps, 'variant'>) => (
  <RealEstLogo variant="with-text" {...props} />
);

export default RealEstLogo;
