import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'Embedding service unavailable' },
      { status: 503 }
    )
  }

  const genAI = new GoogleGenAI({
    apiKey,
    apiVersion: 'v1',
  })

  try {
    const { query } = await req.json()
    if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

    const result = await genAI.models.embedContent({
      model: 'gemini-embedding-001',
      contents: query,
    })
    const embedding = result.embeddings?.[0]?.values

    if (!embedding || embedding.length === 0 || !embedding.every(Number.isFinite)) {
      return NextResponse.json(
        { error: 'Embedding service unavailable' },
        { status: 503 }
      )
    }

    return NextResponse.json({ embedding })
  } catch (error) {
    console.error('Embedding error:', error)
    return NextResponse.json(
      { error: 'Embedding service unavailable' },
      { status: 503 }
    )
  }
}
