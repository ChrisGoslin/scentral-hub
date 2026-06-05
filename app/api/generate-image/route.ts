// app/api/generate-image/route.ts
// Scentral — Image generation engine (Vertex AI Production Edition)
// POST /api/generate-image
// Input: { fragranceId: string (UUID) }
// Output: { success: true, imageUrl, fileName, generatedAt, metadata }
//
// Uses: Google Cloud Vertex AI (Imagen 3.0) for production-grade visuals
// Requires: OAuth2 credentials in ~/.gemini/oauth_creds.json and SUPABASE_SERVICE_KEY in .env.local

import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { OAuth2Client } from 'google-auth-library';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

// ── Types ──────────────────────────────────────────────────────────────────────
type GenerateImageRequest = {
  fragranceId: string;
};

type GenerateImageResponse = {
  success: boolean;
  imageUrl?: string;
  fileName?: string;
  generatedAt?: string;
  metadata?: {
    dimensions: string;
    model: string;
    timestamp: string;
  };
  error?: string;
};

// ── Configuration ──────────────────────────────────────────────────────────────
const PROJECT_ID = 'gen-lang-client-0579524099';
const LOCATION = 'us-central1';
const MODEL_ID = 'imagen-3.0-generate-001';
const IMAGE_DIMENSIONS = '1024x1024';
const BUCKET_NAME = 'fragrance-images';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

// ── Validation ─────────────────────────────────────────────────────────────────
function validateEnvironment(): { valid: boolean; error?: string } {
  if (!SUPABASE_SERVICE_KEY) {
    return { valid: false, error: 'Missing SUPABASE_SERVICE_KEY in environment variables' };
  }
  if (!SUPABASE_URL) {
    return { valid: false, error: 'Missing NEXT_PUBLIC_SUPABASE_URL in environment variables' };
  }
  return { valid: true };
}

// ── Fragrance Fetching ─────────────────────────────────────────────────────────
async function fetchFragranceDetails(fragranceId: string): Promise<any> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('fragrances')
    .select('*')
    .eq('id', fragranceId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch fragrance [${fragranceId}]: ${error.message}`);
  }
  if (!data) {
    throw new Error(`Fragrance not found: ${fragranceId}`);
  }
  return data;
}

// ── Prompt Building ────────────────────────────────────────────────────────────
function buildGeminiPrompt(fragrance: any): string {
  const {
    brand = 'Luxury Brand',
    name = 'Signature Fragrance',
    topNotes = 'bergamot, citrus',
    middleNotes = 'jasmine, iris',
    baseNotes = 'sandalwood, vetiver',
  } = fragrance;

  return `Professional product photography of a premium luxury fragrance bottle for ${brand} - ${name}.

THE BOTTLE:
- Material: Heavyweight crystalline glass with subtle reflections and realistic refractive indices.
- Cap: A solid, tactile cap with refined textures (matte metal or polished resin).
- Label: A minimalist, high-typography label displaying "${brand}" and "${name}" in an elegant serif font.

LIGHTING & SCENE:
- Lighting: Sophisticated "chiaroscuro" studio lighting. Soft key light, subtle rim light.
- Background: A neutral, textured stone surface. Soft cream or stone-50 color palette.
- Depth of Field: Shallow depth of field (f/2.8). Sharp bottle focus, buttery bokeh background.

COMPOSITION:
- Rule of thirds: Bottle positioned slightly off-center.
- Props: Include 1-2 raw ingredients (${topNotes.split(',')[0]} or ${baseNotes.split(',')[0]}) resting naturally.
- Aesthetic: Contemporary minimalist luxury. Magazine editorial style.`;
}

// ── Image Generation with Vertex AI ───────────────────────────────────────────
async function generateImageWithVertex(prompt: string): Promise<string> {
  try {
    console.log(`[Vertex AI] Generating image with model: ${MODEL_ID}`);

    // Load credentials from the verified location
    const credsPath = path.join(os.homedir(), '.gemini', 'oauth_creds.json');
    const creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    
    const client = new OAuth2Client();
    client.setCredentials(creds);

    const url = `https://${LOCATION}-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/${LOCATION}/publishers/google/models/${MODEL_ID}:predict`;

    const res = await client.request({
      url,
      method: 'POST',
      data: {
        instances: [{ prompt }],
        parameters: { 
          sampleCount: 1
        }
      }
    });

    const data = res.data as any;
    const prediction = data.predictions?.[0];

    if (!prediction || !prediction.bytesBase64Encoded) {
      throw new Error('No image returned from Vertex AI prediction');
    }

    return prediction.bytesBase64Encoded;
  } catch (error: any) {
    const errorMessage = error.message || String(error);
    if (error.response?.data) {
      console.error('[Vertex AI] ERROR_DETAIL:', JSON.stringify(error.response.data));
    }
    throw new Error(`Vertex AI generation failed: ${errorMessage}`);
  }
}

// ── Image Upload to Supabase Storage ───────────────────────────────────────────
async function uploadToSupabase(
  base64Image: string,
  fragranceId: string
): Promise<{ publicUrl: string; fileName: string }> {
  try {
    const supabase = await createClient();
    const imageBuffer = Buffer.from(base64Image, 'base64');
    const fileName = `fragrance-${fragranceId}-${Date.now()}.png`;

    const { data, error } = await supabase.storage.from(BUCKET_NAME).upload(fileName, imageBuffer, {
      contentType: 'image/png',
      cacheControl: '3600',
      upsert: false,
    });

    if (error) throw new Error(`Storage upload failed: ${error.message}`);
    const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET_NAME}/${fileName}`;

    return { publicUrl, fileName };
  } catch (error) {
    throw new Error(`Failed to upload to Supabase: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ── Database Update ────────────────────────────────────────────────────────────
async function updateFragranceImageUrl(fragranceId: string, imageUrl: string): Promise<void> {
  try {
    const supabase = await createClient();
    const { error } = await supabase
      .from('fragrances')
      .update({ image_url: imageUrl })
      .eq('id', fragranceId);

    if (error) throw new Error(`Database update failed: ${error.message}`);
  } catch (error) {
    throw new Error(`Failed to update DB: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ── Main Handler ───────────────────────────────────────────────────────────────
export async function POST(req: Request): Promise<NextResponse<GenerateImageResponse>> {
  const startTime = new Date();

  try {
    const envCheck = validateEnvironment();
    if (!envCheck.valid) return NextResponse.json({ success: false, error: envCheck.error }, { status: 500 });

    const { fragranceId } = await req.json();
    if (!fragranceId) return NextResponse.json({ success: false, error: 'fragranceId is required' }, { status: 400 });

    console.log(`[Generate Image] Routing to Vertex AI for: ${fragranceId}`);

    const fragrance = await fetchFragranceDetails(fragranceId);
    const prompt = buildGeminiPrompt(fragrance);
    const base64Image = await generateImageWithVertex(prompt);
    const { publicUrl, fileName } = await uploadToSupabase(base64Image, fragranceId);
    await updateFragranceImageUrl(fragranceId, publicUrl);

    const generatedAt = new Date().toISOString();
    return NextResponse.json({
      success: true,
      imageUrl: publicUrl,
      fileName,
      generatedAt,
      metadata: { dimensions: IMAGE_DIMENSIONS, model: MODEL_ID, timestamp: generatedAt }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[Error] Vertex Migration Outage: ${errorMessage}`);
    return NextResponse.json({ success: false, error: errorMessage }, { status: 500 });
  }
}
