import { Metadata } from 'next'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import LayeringClient, { type LayeringFragrance } from '../layering/LayeringClient'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import { cookies } from 'next/headers'

export const metadata: Metadata = {
  title: 'nota.Lab | nota.',
  description: 'Use nota.Lab as the workbench for layering combinations, dry-down logic, and scent experiments.',
  alternates: { canonical: '/lab' },
}

export const dynamic = 'force-dynamic'

export default async function LabPage() {
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const { data, error } = await supabase
    .from('fragrances')
    .select('id, brand, name, phase, phase_label, family, projection, application_zone, application_method, anosmia_risk, lean, rating, image_url')
    .order('image_url', { ascending: false, nullsFirst: false })
    .order('rating', { ascending: false, nullsFirst: false })
    .order('brand', { ascending: true })
    .range(0, 299)

  if (error) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          headline="Couldn't load the workbench"
          caption={error.message}
        />
      </div>
    )
  }

  if ((data ?? []).length === 0) {
    return (
      <div style={{ minHeight: '100dvh', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <EmptyState
          headline="nota.Lab is waiting"
          caption="Add a few bottles to The Cabinet first, then bring them to the workbench."
          action={
            <Link href="/cabinet" style={{ textDecoration: 'none' }}>
              <Button variant="secondary">Go to The Cabinet</Button>
            </Link>
          }
        />
      </div>
    )
  }

  return <LayeringClient fragrances={(data ?? []) as LayeringFragrance[]} />
}
