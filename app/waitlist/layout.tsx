import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'nota. — Join the Waitlist',
  description: 'Join the private waitlist for nota. Discover your fragrance archetype and curatorial intelligence.',
  openGraph: {
    title: 'nota. — Join the Waitlist',
    description: 'Join the private waitlist for nota. Discover your fragrance archetype and curatorial intelligence.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'nota. — Join the Waitlist',
    description: 'Join the private waitlist for nota. Discover your fragrance archetype and curatorial intelligence.',
  },
}

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
