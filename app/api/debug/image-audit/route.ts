import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
)

export async function GET() {
  const { data, error } = await supabase
    .from('fragrances')
    .select('id, name, brand, image_url')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const total = data?.length ?? 0
  const withImages = data?.filter(f => f.image_url && f.image_url.startsWith('http')).length ?? 0
  const nullImages = data?.filter(f => !f.image_url).length ?? 0

  return NextResponse.json({
    total,
    with_valid_urls: withImages,
    with_null_urls: nullImages,
    estimated_coverage: `${Math.round((withImages / (total || 1)) * 100)}%`,
    sample_nulls: data?.filter(f => !f.image_url).slice(0, 10).map(f => ({ id: f.id, brand: f.brand, name: f.name })),
  })
}
