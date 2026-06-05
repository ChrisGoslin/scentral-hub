import { NextResponse } from 'next/server';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `
You are the Alchemist, the highly sophisticated AI Sommelier of the Scentral Hub.
Your job is to construct a "Spritz Schedule" (a daily layering protocol) for the user based on their intent, weather, and available wardrobe.

You MUST follow these physical chemistry rules for olfactory mechanics:
1. Phase 1 (Endothermic Anchors): Heavy bases (Oud, Vanilla, Woods). High viscosity, slow evaporation. Apply FIRST. Best in cold weather. Kinetic application: "Lipid Primer Superimposition" or "Decentralized Zone Mapping".
2. Phase 2 (Textural Modulators): Mids (Iris, Musk, Spices). Act as bridges. Kinetic application: "Direct Dermal Fusion".
3. Phase 3 (Exothermic Tops): Low molecular weight (Citrus, Ambroxan, Aquatic). Rapid evaporation. Apply LAST. Thrives in heat. Kinetic application: "Spatial Cloud Dispersion" or "Textile Fixation".

If it is Humid/Hot: Suppress dense ouds/resins. Over-index on sharp citrus to pierce moisture.
If it is Cold/Dry: Trap volatile tops with lipids, rely heavily on deep amber/woody anchors.

Given the user's intent and weather, select 2 to 3 fragrances from their wardrobe to construct a layered protocol. Give the protocol a creative, highly stylized "Niche" name. 
Write a short, sophisticated editorial narrative explaining the chemistry behind the choice.
`;

export async function POST(req: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured.' }, { status: 500 });
    }

    const body = await req.json();
    const { intent, weather, wardrobe } = body;

    // Reinforcement Learning: Fetch historical high-resonance logs
    const { createClient } = await import('@/utils/supabase/server');
    const supabase = await createClient();
    const { data: pastSuccesses } = await supabase
      .from('wear_logs')
      .select('notes, rating, created_at')
      .eq('rating', 5)
      .limit(3);

    const memoryBlock = pastSuccesses?.length 
      ? `\nHistorical Memory (High Resonance): ${pastSuccesses.map(log => `[${log.created_at}] "${log.notes}"`).join(' | ')}`
      : "";

    const userPrompt = `
      User Intent/Vibe: "${intent}"
      Local Weather: ${weather.temp}°C, ${weather.humidity}% Humidity, Condition: ${weather.condition}
      ${memoryBlock}
      
      Available Wardrobe:
      ${wardrobe.map((f: any) => `- ${f.brand} ${f.name} (Family: ${f.family ?? f.primary_vector}) [Notes: ${f.notes}]`).join('\n')}
      
      Construct the protocol.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userPrompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: 'A highly creative, prestigious name for this specific layering protocol (e.g., "The Humid Edge", "Midnight Sovereign").' },
            narrative: { type: Type.STRING, description: 'A 2-3 sentence sophisticated explanation of the olfactory chemistry and why it fits the weather/intent.' },
            schedule: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  phase: { type: Type.STRING, description: 'e.g., Anchor (Base), Modulator (Heart), Exothermic (Top)' },
                  time: { type: Type.STRING, description: 'Recommended application time, e.g., 08:00 AM' },
                  color: { type: Type.STRING, description: 'Tailwind color for the node based on phase (bg-amber-500 for Base, bg-violet-500 for Mid, bg-sky-400 for Top)' },
                  title: { type: Type.STRING, description: 'The Kinetic Application technique (e.g., "Lipid Primer / Inner Wrists")' },
                  desc: { type: Type.STRING, description: 'Why and how to apply this specific layer.' },
                  bottle: { type: Type.STRING, description: 'Fragrance Name' },
                  brand: { type: Type.STRING, description: 'Brand Name' }
                },
                required: ['phase', 'time', 'color', 'title', 'desc', 'bottle', 'brand']
              }
            }
          },
          required: ['title', 'narrative', 'schedule']
        }
      }
    });

    const resultText = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) throw new Error("No response from AI");

    const json = JSON.parse(resultText);
    return NextResponse.json(json);
  } catch (error: any) {
    console.error('Sommelier API Error:', error);
    return NextResponse.json({ error: error.message || 'Failed to synthesize protocol' }, { status: 500 });
  }
}
