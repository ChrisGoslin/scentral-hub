import { Metadata } from 'next'
import { ArchivePageContent } from '../you/page'

export const metadata: Metadata = {
  title: 'The Archive | nota.',
  description: 'The Archive keeps your dossier, rituals, saved artifacts, and evolving scent memory together.',
  alternates: { canonical: '/archive' },
}

export const dynamic = 'force-dynamic'

export default async function ArchivePage() {
  return ArchivePageContent()
}
