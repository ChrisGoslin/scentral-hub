import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { protocol_id, rating, compliments, notes } = await req.json();

    const { data, error } = await supabase
      .from('wear_logs')
      .insert({
        user_id: session.user.id,
        protocol_id,
        rating,
        compliments,
        notes,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Reflection Log Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
