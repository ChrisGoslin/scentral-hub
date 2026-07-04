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

    return NextResponse.json(data ?? []);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
