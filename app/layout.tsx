import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Scentral - Build Fragrance Layering Combos',
  description: 'Create fragrance layering combos, discover harmony scores, and share your Accords. Free, no account needed.',
  
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#1a1a1a" />
      </head>
      <body>{children}</body>
    </html>
  );
}


export const viewport = {
  width: 'device-width',
  initialScale: 1,
};
