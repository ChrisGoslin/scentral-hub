import type { Metadata, Viewport } from "next";
import "./globals.css";
import "../lib/design/tokens.css";
import PWARegistration from "./components/PWARegistration";
import AnalyticsProvider from "./components/AnalyticsProvider";

export const metadata: Metadata = {
  title: "Scentral",
  description: "Discover and track your fragrance collection",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Scentral",
  },
  other: {
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "black-translucent",
    "mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#f9f8f6",
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
    <html lang="en" className="h-[100dvh] antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet" />
        <link href="https://api.fontshare.com/v2/css?f[]=satoshi@400,500,600,700&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-[100dvh] flex flex-col" style={{ background: "var(--bg)", color: "var(--text)", fontFamily: "var(--font-ui)" }}>
        <AnalyticsProvider>
          <PWARegistration />
          <main className="flex-1">
            {children}
          </main>
        </AnalyticsProvider>
      </body>
    </html>
  );
}
