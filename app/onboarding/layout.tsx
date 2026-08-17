import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'nota. — Olfactory Onboarding & Discovery',
  description: 'Interactive scent onboarding. Map your fragrance preferences, notes, and profile on nota.',
  openGraph: {
    title: 'nota. — Olfactory Onboarding & Discovery',
    description: 'Interactive scent onboarding. Map your fragrance preferences, notes, and profile on nota.',
  },
}

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
