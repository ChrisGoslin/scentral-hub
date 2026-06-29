import { NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@/utils/supabase/server';


const SYSTEM_INSTRUCTION = `
You are the Alchemist, the master of Olfactory Resonance.
Your job is to compare two fragrances and determine their "Chemical Harmony" score (0-100) and provide a sophisticated narrative.

You must analyze their families, concentration, and notes.
- Twin Resonance (90-100): Nearly identical DNA.
- Strategic Layering (70-89): Different profiles that create a new masterpiece.
- Volatile Tension (40-69): Contrast that works but requires caution.
- Dissonance (<40): Clashing chemistry.

Your tone is "Milan Scents"—highly evocative, cinematic, and technical.
`;

export async function POST(req: Request) {
  try {
    const { fragrance_a_id, fragrance_b_id } = await req.json();
    if (!fragrance_a_id || !fragrance_b_id) {
      return NextResponse.json({ error: 'Both fragrance IDs are required.' }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: fragrances, error } = await supabase
      .from('fragrances')
      .select('id, brand, name, family, notes, concentration')
      .in('id', [fragrance_a_id, fragrance_b_id]);

    if (error || !fragrances || fragrances.length < 2) {
      return NextResponse.json({ error: 'Failed to load fragrance data.' }, { status: 500 });
    }

    const fragA = fragrances.find((f) => f.id === fragrance_a_id)!;
    const fragB = fragrances.find((f) => f.id === fragrance_b_id)!;

    // Sort IDs for cache lookup (smaller ID first)
    const [sortedA, sortedB] = [fragrance_a_id, fragrance_b_id].sort();

    // Check cache before calling AI
    const { data: cached } = await supabase
      .from('chemist_cache')
      .select('score, category, narrative')
      .eq('fragrance_a_id', sortedA)
      .eq('fragrance_b_id', sortedB)
      .maybeSingle();

    if (cached) {
      return NextResponse.json({ ...cached, success: true, cached: true });
    }

    const prompt = `
      Compare these two essences:
      Essence Alpha: ${fragA.brand} ${fragA.name} (${fragA.family}) [Concentration: ${fragA.concentration ?? 'Unknown'}] [Notes: ${fragA.notes ?? 'Unknown'}]
      Essence Beta: ${fragB.brand} ${fragB.name} (${fragB.family}) [Concentration: ${fragB.concentration ?? 'Unknown'}] [Notes: ${fragB.notes ?? 'Unknown'}]

      Determine the resonance. Respond with JSON: { "score": number, "category": string, "narrative": string }
    `;

    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    const message = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      system: SYSTEM_INSTRUCTION,
      messages: [{ role: 'user', content: prompt }],
    });

    const resultText = (message.content[0] as { type: 'text'; text: string }).text;
    if (!resultText) throw new Error('Synthesis failed');

    const result = JSON.parse(resultText);

    // Upsert to cache
    await supabase.from('chemist_cache').upsert(
      {
        fragrance_a_id: sortedA,
        fragrance_b_id: sortedB,
        score: result.score,
        category: result.category,
        narrative: result.narrative,
      },
      { onConflict: 'fragrance_a_id,fragrance_b_id' }
    );

    return NextResponse.json({ ...result, success: true });
  } catch (error: any) {
    console.error('Resonance API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
