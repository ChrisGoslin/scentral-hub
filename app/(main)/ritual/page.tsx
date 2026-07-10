import { Metadata } from 'next'
import SpritzClient from '../spritz/SpritzClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Ritual | nota.',
  description: 'Ritual helps you choose what to wear, when to apply it, and how to remember the day it created.',
  alternates: { canonical: '/ritual' },
}

export default function RitualPage() {
  return <SpritzClient />
}
