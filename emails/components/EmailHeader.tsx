import * as React from "react";
import { Section, Img, Link } from "@react-email/components";
import { BASE_URL } from '../styles/tokens';

// Wordmark displayed at 160px wide — PNGs are 2× (320px) for retina
const LOGO_DISPLAY_WIDTH = 160;
// Aspect ratio of wordmark SVG: 249.23 × 126.59 → 1.969 : 1
const LOGO_DISPLAY_HEIGHT = Math.round(LOGO_DISPLAY_WIDTH / 1.969); // ≈ 81

export function EmailHeader() {
  return (
    <Section style={{ padding: '10px 16px' }}>
      <Link href={BASE_URL} style={{ textDecoration: 'none' }}>
        {/* Dark wordmark (dark text on light bg) — default */}
        <Img
          src={`${BASE_URL}/realest-wordmark-dark.png`}
          alt="RealEST Connect"
          width={LOGO_DISPLAY_WIDTH}
          height={LOGO_DISPLAY_HEIGHT}
          style={{ display: 'block' }}
          className="logo-light"
        />
        {/* Light wordmark (light text on dark bg) — email dark mode only */}
        <Img
          src={`${BASE_URL}/realest-wordmark-light.png`}
          alt="RealEST Connect"
          width={LOGO_DISPLAY_WIDTH}
          height={LOGO_DISPLAY_HEIGHT}
          style={{ display: 'none' }}
          className="logo-dark"
        />
      </Link>
    </Section>
  );
}
