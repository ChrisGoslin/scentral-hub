// app/api/generate-image/route.ts
// Scentral — Image generation engine (Vertex AI Production Edition)
// POST /api/generate-image
// Input: { fragranceId: string (UUID) }
// Output: { success: true, imageUrl, fileName, generatedAt, metadata }
//
// Uses: Google Cloud Vertex AI (Imagen 3.0) for production-grade visuals
// Requires: OAuth2 credentials in ~/.gemini/oauth_creds.json and SUPABASE_SERVICE_KEY in .env.local
//
// Disabled in MVP — the Vertex AI pipeline (fetch fragrance, build prompt,
// generate, upload, persist) is not currently wired up. See git history for
// the prior implementation if this needs to be reactivated.

import { NextResponse } from 'next/server';

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

export async function POST(): Promise<NextResponse<GenerateImageResponse>> {
  return NextResponse.json(
    { success: false, error: 'Image generation disabled in MVP.' },
    { status: 503 }
  );
}
