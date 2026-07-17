import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'

const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  apiVersion: 'v1',
})

export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

    const result = await genAI.models.embedContent({
      model: 'gemini-embedding-001',
      contents: query,
    })
    const embedding = result.embeddings?.[0]?.values

    if (!embedding) {
      throw new Error('No embedding returned from Gemini')
    }

    return NextResponse.json({ embedding })
  } catch (error) {
    console.error('Embedding error:', error)
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 })
  }
}
