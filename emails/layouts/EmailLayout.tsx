import * as React from 'react';
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Row,
  Column,
  Text,
  Link,
  Hr,
  Font,
} from '@react-email/components';
import { colors, fonts, fontSize } from '../styles/tokens';

// ─── Types ────────────────────────────────────────────────────────────────────
interface EmailLayoutProps {
  preview: string;
  children: React.ReactNode;
  /** Override page background. Defaults to off-white. */
  pageBg?: string;
}

// ─── Global email body styles ─────────────────────────────────────────────────
const bodyStyle: React.CSSProperties = {
  backgroundColor: colors.pageBg,
  fontFamily: fonts.body,
  margin: '0',
  padding: '0',
  WebkitTextSizeAdjust: '100%',
  // @ts-expect-error — vendor prefix not in React.CSSProperties but needed for Outlook Mobile
  MsTextSizeAdjust: '100%',
};

const wrapperStyle: React.CSSProperties = {
  width: '100%',
  backgroundColor: colors.pageBg,
};

const containerStyle: React.CSSProperties = {
  maxWidth: '600px',
  margin: '0 auto',
  backgroundColor: colors.cardBg,
  // borderRadius omitted — not supported in Outlook; degrades gracefully in modern clients
  border: `1px solid ${colors.border}`,
};

// ─── Component ────────────────────────────────────────────────────────────────
export function EmailLayout({ preview, children, pageBg }: EmailLayoutProps) {
  return (
    <Html lang="en" dir="ltr">
      <Head>
        {/* Google Fonts — degrades gracefully to system fallbacks */}
        <Font
          fontFamily="Space Grotesk"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDwbTKWcliqRM9oR_orbc0PVqE.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <Font
          fontFamily="Space Grotesk"
          fallbackFontFamily="Arial"
          webFont={{
            url: 'https://fonts.gstatic.com/s/spacegrotesk/v16/V8mDoQDwbTKWcliqRM9oR_orbc0PVqE.woff2',
            format: 'woff2',
          }}
          fontWeight={600}
          fontStyle="normal"
        />
        {/* Logo dark-mode swap — supported by Apple Mail, Gmail app iOS ≥16 */}
        <style>{`
          @media (prefers-color-scheme: dark) {
            .logo-light { display: none !important; }
            .logo-dark  { display: block !important; }
          }
        `}</style>
      </Head>

      <Preview>{preview}</Preview>

      <Body style={{ ...bodyStyle, backgroundColor: pageBg ?? colors.pageBg }}>
        <Section style={{ ...wrapperStyle, backgroundColor: pageBg ?? colors.pageBg }}>
          <Container style={containerStyle}>
            {children}
          </Container>
        </Section>

      </Body>
    </Html>
  );
}
