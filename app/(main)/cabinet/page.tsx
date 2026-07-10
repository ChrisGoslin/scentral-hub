import { Metadata } from 'next'
import CollectionClientWrapper from '../collection/CollectionClientWrapper'

export const metadata: Metadata = {
  title: 'The Cabinet | nota.',
  description: 'The Cabinet gathers your bottles, shelves, and scent history into one physical-feeling archive.',
  alternates: { canonical: '/cabinet' },
}

export const dynamic = 'force-dynamic'

export default function CabinetPage() {
  return <CollectionClientWrapper />
}
