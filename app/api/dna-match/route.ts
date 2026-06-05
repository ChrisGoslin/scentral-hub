import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient } from '@/utils/supabase/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

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

    const prompt = `
      Compare these two essences:
      Essence Alpha: ${fragA.brand} ${fragA.name} (${fragA.family}) [Concentration: ${fragA.concentration ?? 'Unknown'}] [Notes: ${fragA.notes ?? 'Unknown'}]
      Essence Beta: ${fragB.brand} ${fragB.name} (${fragB.family}) [Concentration: ${fragB.concentration ?? 'Unknown'}] [Notes: ${fragB.notes ?? 'Unknown'}]

      Determine the resonance.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            category: { type: Type.STRING },
            narrative: { type: Type.STRING }
          },
          required: ['score', 'category', 'narrative']
        }
      }
    });

    const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error('Synthesis failed');

    return NextResponse.json({ ...JSON.parse(resultText), success: true });
  } catch (error: any) {
    console.error('Resonance API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
