import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  let q = searchParams.get('q')?.trim() ?? '';
  const limitParam = parseInt(searchParams.get('limit') ?? '10', 10);
  const limit = Math.min(isNaN(limitParam) ? 10 : limitParam, 20);

  if (!q) {
    return NextResponse.json([]);
  }

  try {
    // Sanitize: strip PostgREST filter operators (commas, parentheses) to prevent injection
    q = q.replace(/[,()]/g, '')

    const supabase = await createClient();
    const { data, error } = await supabase
      .from('fragrances')
      .select('id, brand, name, family, image_url')
      .or(`brand.ilike.%${q}%,name.ilike.%${q}%,plain_description.ilike.%${q}%`)
      .limit(limit);

    if (error) throw error;

    // Fetch owner counts for all returned fragrances (batched)
    const fragrances = data ?? [];
    const ownerCounts: Record<string, number> = {};

    if (fragrances.length > 0) {
      try {
        const fragIds = fragrances.map((f: { id: string }) => f.id);
        const { data: socialProof, error: spError } = await supabase.rpc(
          'get_fragrance_social_proof',
          { fragrance_ids: fragIds }
        );
        if (!spError && socialProof) {
          socialProof.forEach((row: { fragrance_id: string; owner_count: number }) => {
            ownerCounts[row.fragrance_id] = Number(row.owner_count);
          });
        }
      } catch (err) {
        // Silent fallback: owner counts default to 0 if lookup fails
        console.error('Failed to fetch owner counts:', err);
      }
    }

    // Merge owner counts into fragrance data
    const enriched = fragrances.map((f: { id: string }) => ({
      ...f,
      owner_count: ownerCounts[f.id] ?? 0
    }));

    return NextResponse.json(enriched);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
