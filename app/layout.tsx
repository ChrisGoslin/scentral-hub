import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Unbounded } from "next/font/google";
import "./globals.css";
import "../lib/design/tokens.css";
import PWARegistration from "./components/PWARegistration";
import AnalyticsProvider from "./components/AnalyticsProvider";
import { Providers } from "./providers";
import PageTracker from "./components/PageTracker";
import DeferredFontLink from "./components/DeferredFontLink";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://scentral-hub.vercel.app"),
  title: "AnotherSense",
  description: "Your daily scent ritual. Remember how you smell.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    siteName: "AnotherSense",
    title: "AnotherSense — Your Daily Scent Ritual",
    description: "Discover, collect and understand the fragrances that define you.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "AnotherSense — Your Daily Scent Ritual",
    description: "Discover, collect and understand the fragrances that define you.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AnotherSense",
    startupImage: [
      { url: "/icons/splash/icon_750x1334.png", media: "screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      { url: "/icons/splash/icon_828x1792.png", media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
      { url: "/icons/splash/icon_1242x2688.png", media: "screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/icons/splash/icon_1125x2436.png", media: "screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3) and (orientation: portrait)" },
      { url: "/icons/splash/icon_1536x2048.png", media: "screen and (device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2) and (orientation: portrait)" },
    ],
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" className={`h-[100dvh] antialiased ${instrumentSerif.variable} ${unbounded.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <DeferredFontLink />
        {process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
      </head>
      <body className="min-h-[100dvh] flex flex-col" style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-ui)" }}>
        <Providers>
          <PageTracker />
          <AnalyticsProvider>
            <PWARegistration />
            <main className="flex-1">
              {children}
            </main>
            <FeedbackWidget />
          </AnalyticsProvider>
        </Providers>
      </body>
    </html>
  );
}
const x: string = 123
