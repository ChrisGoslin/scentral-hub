/**
 * app/api/scan/barcode/route.ts
 * Barcode-based fragrance lookup
 * POST /api/scan/barcode
 * Input: { barcode: string }
 * Output: { fragrance_id, brand, name } or error
 */

import { NextResponse } from 'next/server'
import { lookupFragranceByBarcode } from '@/lib/barcode-db'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { barcode } = body

    if (!barcode || typeof barcode !== 'string') {
      return NextResponse.json(
        { error: 'barcode is required and must be a string' },
        { status: 400 }
      )
    }

    // Lookup in barcode database
    const entry = lookupFragranceByBarcode(barcode)

    if (!entry) {
      return NextResponse.json(
        {
          error: 'Barcode not found in database',
          barcode,
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      fragrance_id: entry.fragrance_id,
      brand: entry.brand,
      name: entry.name,
      barcode: entry.barcode,
    })
  } catch (error) {
    console.error('Barcode scan error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
