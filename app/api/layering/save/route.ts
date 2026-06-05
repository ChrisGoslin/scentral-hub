import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

type SaveRequest = {
  base_fragrance_id: string;
  top_fragrance_id: string;
  name: string;
  occasion: string;
  time_of_day: string;
  weather: string;
  rationale: string;
  formulation: Record<string, unknown>;
  base_sprays: number | null;
  top_sprays: number | null;
};

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: SaveRequest = await req.json();
    const { base_fragrance_id, top_fragrance_id } = body;

    if (!base_fragrance_id || !top_fragrance_id) {
      return NextResponse.json(
        { error: 'base_fragrance_id and top_fragrance_id are required' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('layering_combinations')
      .insert({
        user_id: user.id,
        base_fragrance_id,
        top_fragrance_id,
        name: body.name ?? null,
        occasion: body.occasion ?? null,
        time_of_day: body.time_of_day ?? null,
        weather: body.weather ?? null,
        rationale: body.rationale ?? null,
        formulation: body.formulation ?? null,
        base_sprays: body.base_sprays ?? 1,
        top_sprays: body.top_sprays ?? 1,
        is_saved: true,
        is_ai_suggested: true,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Save layering combination error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (err) {
    console.error('Save route error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
