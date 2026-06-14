import { createClient } from '@/utils/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  try {
    const supabase = await createClient();
    let query = supabase
      .from('fragrances')
      .select('*')
      .order('brand', { ascending: true });

    if (q) {
      query = query.or(`brand.ilike.%${q}%,name.ilike.%${q}%`).limit(20);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
