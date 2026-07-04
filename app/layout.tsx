import type { Metadata, Viewport } from "next";
import { Unbounded } from "next/font/google";
import "./globals.css";
import "../lib/design/tokens.css";
import PWARegistration from "./components/PWARegistration";
import AnalyticsProvider from "./components/AnalyticsProvider";
import { Providers } from "./providers";
import PageTracker from "./components/PageTracker";
import DeferredFontLink from "./components/DeferredFontLink";
import FeedbackWidget from "@/components/feedback/FeedbackWidget";
import CompareBar from "@/components/ui/CompareBar";
import TemptationProvider from "@/components/temptations/TemptationProvider";

const unbounded = Unbounded({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-unbounded",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://scentral-hub.vercel.app"),
  title: "nota.",
  description: "Your scent identity, understood.",
  manifest: "/manifest.json",
  icons: {
    apple: "/icons/icon-192.png",
  },
  openGraph: {
    siteName: "nota.",
    title: "nota. — Your Scent Identity",
    description: "A system that understands, reflects, and evolves your scent identity.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "nota. — Your Scent Identity",
    description: "A system that understands, reflects, and evolves your scent identity.",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "nota.",
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
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" style={{ "--font-cormorant": "Cormorant Garamond" } as React.CSSProperties} className={`h-[100dvh] antialiased ${unbounded.variable}`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
        <link rel="preload" href="/fonts/cormorant-garamond-v21-latin-italic.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <DeferredFontLink />
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
            <CompareBar />
            <TemptationProvider />
          </AnalyticsProvider>
        </Providers>
      </body>
    </html>
  );
}
