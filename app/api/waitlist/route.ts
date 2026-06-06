import { createClient } from '@/utils/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

function emailToPosition(email: string): number {
  let hash = 0;
  for (let i = 0; i < email.length; i++) {
    hash = (hash * 31 + email.charCodeAt(i)) >>> 0;
  }
  return 847 + (hash % (1203 - 847 + 1));
}

export async function POST(req: NextRequest) {
  try {
    const { email, archetype } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }
    if (!archetype || typeof archetype !== 'string') {
      return NextResponse.json({ error: 'Archetype is required' }, { status: 400 });
    }

    const validArchetypes = ['collector', 'experimenter', 'minimalist', 'architect'];
    if (!validArchetypes.includes(archetype)) {
      return NextResponse.json({ error: 'Invalid archetype' }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from('waitlist')
      .insert({ email: email.toLowerCase().trim(), archetype });

    if (error) {
      if (error.code === '23505') {
        // Duplicate — still return success with position
        return NextResponse.json({ success: true, position: emailToPosition(email) });
      }
      throw error;
    }

    return NextResponse.json({ success: true, position: emailToPosition(email) });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
