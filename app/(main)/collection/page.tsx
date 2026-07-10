import { permanentRedirect } from 'next/navigation'
import { mapSearchParamsToString } from '@/lib/rebrand'

export const dynamic = 'force-dynamic'

export default async function CollectionPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const resolvedSearchParams = await searchParams
  permanentRedirect(`/cabinet${mapSearchParamsToString(resolvedSearchParams)}`)
}
