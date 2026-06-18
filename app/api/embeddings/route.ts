import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export async function POST(req: Request) {
  try {
    const { query } = await req.json()
    if (!query) return NextResponse.json({ error: 'Missing query' }, { status: 400 })

    const model = genAI.getGenerativeModel({ model: 'text-embedding-004' })
    const result = await model.embedContent(query)
    const embedding = result.embedding.values

    return NextResponse.json({ embedding })
  } catch (error: any) {
    console.error('Embedding error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
