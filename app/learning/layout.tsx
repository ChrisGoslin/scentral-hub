import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'nota. — Olfactory Lexicon & Learning',
  description: 'The Lexicon: A compendium of olfactory wisdom, fragrance chemistry, and personal scent insights.',
  openGraph: {
    title: 'nota. — Olfactory Lexicon & Learning',
    description: 'The Lexicon: A compendium of olfactory wisdom, fragrance chemistry, and personal scent insights.',
  },
}

export default function LearningLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
