import { NextResponse } from 'next/server'

export async function POST() {
  // lightweight demo save endpoint — does not persist
  return NextResponse.json({ ok: true, id: 'demo-1' })
}
