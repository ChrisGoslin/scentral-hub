import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import AuraAdvisory from './AuraAdvisory'

interface AuraShelfAdvisoryProps {
  anonId: string
  className?: string
}

export default async function AuraShelfAdvisory({
  anonId,
  className = '',
}: AuraShelfAdvisoryProps) {
  try {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Fetch top 3 fragrances by affinity score
    const { data: collection } = await supabase
      .from('collections')
      .select('fragrance_id, affinity_score')
      .eq('anon_id', anonId)
      .order('affinity_score', { ascending: false })
      .limit(3)

    if (!collection || collection.length === 0) {
      return null
    }

    // Fetch fragrance details
    const fragIds = collection.map(c => c.fragrance_id)
    const { data: frags } = await supabase
      .from('fragrances')
      .select('id, name, brand, family')
      .in('id', fragIds)

    if (!frags || frags.length === 0) {
      return null
    }

    // Check if all top 3 converge on similar family
    const families = frags.map(f => f.family).filter(Boolean)
    if (families.length < 3) {
      return null
    }

    // Simple heuristic: if 2+ fragrances share same family or it's all amber-family
    const familyStr = families.join(' | ')
    const isConverged =
      families.some((fam, i) => families.some((other, j) => i < j && other.includes(fam.split(' ')[0]))) ||
      families.every(fam => fam.toLowerCase().includes('amber'))

    if (!isConverged) {
      return null
    }

    return (
      <AuraAdvisory
        fragranceId={fragIds[0]}
        contextType="shelf"
        shelfContext={{
          top_three: frags.map(f => ({
            name: f.name,
            brand: f.brand,
            family: f.family,
          })),
        }}
        className={className}
      />
    )
  } catch (err) {
    console.error('AuraShelfAdvisory error:', err)
    return null
  }
}
