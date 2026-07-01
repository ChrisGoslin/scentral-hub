import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Invalid ids' }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from('fragrances')
      .select(
        'id, brand, name, family, projection, top_notes, heart_notes, base_notes, ' +
        'optimal_season, plain_description, inspired_by, image_url, rating'
      )
      .in('id', ids);

    if (error) {
      throw error;
    }

    return NextResponse.json({ fragrances: data || [] });
  } catch (error) {
    console.error('Compare API error:', error);
    return NextResponse.json({ error: 'Failed to fetch fragrances' }, { status: 500 });
  }
}
