import { Metadata } from 'next'
import CollectionClientWrapper from '../collection/CollectionClientWrapper'

export const metadata: Metadata = {
  title: 'The Cabinet | nota.',
  description: 'Your complete scent inventory: everything you own, tested, or wish to try. Browse, organize, and track your collection.',
  alternates: { canonical: '/cabinet' },
}

export const dynamic = 'force-dynamic'

export default function CabinetPage() {
  return <CollectionClientWrapper />
}
