import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import ArchiveImportClient from './ArchiveImportClient'
import { getArchiveSession } from '../archive-session'

export const metadata: Metadata = {
  title: 'Archive Import | nota.',
  description: 'Preview a customer-controlled fragrance export before any data is written into your archive.',
  alternates: { canonical: '/archive/import' },
}

export const dynamic = 'force-dynamic'

export default async function ArchiveImportPage() {
  const { session } = await getArchiveSession()

  if (!session) {
    redirect('/login?next=/archive/import')
  }

  return <ArchiveImportClient />
}
