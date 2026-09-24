import type React from "react";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { RealEstThemeProvider } from "@/components/providers/RealEstThemeProvider";
import { LogoutModalProvider } from "@/components/providers/LogoutModalProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { CookieBanner } from "@/components/shared";
import "@/lib/styles/globals.css";

export const metadata: Metadata = {
  title: "RealEST Connect - Nigeria’s Most Trusted Real Estate Platform",
  description:
    "Discover geo-verified, authentic properties with RealEST's proof-first marketplace. No duplicates, only verified listings.",
  keywords: [
    "real estate",
    "property marketplace",
    "geo-verified properties",
    "Nigeria properties",
    "verified listings",
    "property verification",
    "real estate Nigeria",
  ],
  authors: [
    { name: "RealEST Connect Team" },
    { name: "AstroMANIA Enterprise", url: "https://astromania.tech" },
    { name: "Precious Okoyen", url: "https://x17green.tech" }
  ],
  creator: "RealEST",
  publisher: "RealEST",
  metadataBase: new URL("https://realest.ng"),
  openGraph: {
    title: "RealEST - Find Your Next Move",
    description:
      "Nigeria's first geo-verified property marketplace. Discover authentic properties with verified location data.",
    url: "https://realest.ng",
    siteName: "RealEST",
    locale: "en_NG",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RealEST - Geo-Verified Property Marketplace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RealEST - Find Your Next Move",
    description:
      "Discover geo-verified properties in Nigeria's most trusted marketplace",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-token",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical RealEST fonts for performance */}
        <link
          rel="preload"
          href="/fonts/space-grotesk/SpaceGrotesk-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/space-grotesk/SpaceGrotesk-Medium.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/neulis/Neulis_Neue_Regular.otf"
          as="font"
          type="font/otf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/lufga/LufgaRegular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
          media="(min-width: 768px)"
        />
        <link
          rel="preload"
          href="/fonts/jetbrains-mono/JetBrainsMono-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
          media="(min-width: 768px)"
        />

        {/* DNS prefetch for external resources */}
        <link rel="dns-prefetch" href="//api.mapbox.com" />

        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#07402F" />
        <meta name="color-scheme" content="light dark" />

        {/* Viewport meta for responsive design */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />

        {/* Facebook Domain Verification */}
        <meta name="facebook-domain-verification" content="z7pfwg97pwbgwceyc5102mv8v5rt5c" />

        {/* Apple specific meta tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RealEST Connect" />

        {/* Microsoft specific meta tags */}
        <meta name="msapplication-TileColor" content="#07402F" />
        <meta name="msapplication-config" content="/browserconfig.xml" />

        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon-16x16.png" sizes="16x16" type="image/png" />
        <link rel="icon" href="/favicon-32x32.png" sizes="32x32" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon-precomposed.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />
        <link rel="apple-touch-icon-precomposed" sizes="120x120" href="/apple-touch-icon-120x120-precomposed.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* HubSpot Tracking Code */}
        {/*<!-- Start of HubSpot Embed Code -->*/}
        <script type="text/javascript" id="hs-script-loader" async defer src="//js-eu1.hs-scripts.com/147628032.js"></script>
        {/*<!-- End of HubSpot Embed Code -->*/}
        
        {/* <!-- Meta Pixel Code --> */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '930986666494169');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=930986666494169&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* <!-- End Meta Pixel Code --> */}

        {/* <!-- Start of realestconnecthelp Zendesk Widget script --> */}
        <script id="ze-snippet" src="https://static.zdassets.com/ekr/snippet.js?key=16241a82-2e89-4760-a55a-eebed2ba144a"></script>
        {/* <!-- End of realestconnecthelp Zendesk Widget script --> */}
      </head>
      <body className="font-body antialiased">
        <RealEstThemeProvider defaultTheme="system" enableSystem={true}>
          <AuthProvider>
            <LogoutModalProvider>
              <noscript>
                <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
                  <div className="text-center p-8">
                    <h1 className="text-h1 mb-4">JavaScript Required</h1>
                    <p className="text-body-m text-muted-foreground">
                      RealEST requires JavaScript to function properly. Please enable
                      JavaScript in your browser.
                    </p>
                  </div>
                </div>
              </noscript>
              {children}
              <CookieBanner />
              <Analytics />
            </LogoutModalProvider>
          </AuthProvider>
        </RealEstThemeProvider>
      </body>
    </html>
  );
}
