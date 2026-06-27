import { Metadata } from 'next'
import SpritzClient from './SpritzClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Your Brief | BaseNote',
}

export default function SpritzPage() {
  return <SpritzClient />
}
