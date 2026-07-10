import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/utils/supabase/middleware'

const LEGACY_ROUTE_REDIRECTS: Record<string, string> = {
  '/discover': '/study',
  '/collection': '/cabinet',
  '/you': '/archive',
  '/layering': '/lab',
  '/spritz': '/ritual',
  '/profile': '/archive',
}

export async function proxy(request: NextRequest) {
  const redirectTarget = LEGACY_ROUTE_REDIRECTS[request.nextUrl.pathname]
  if (redirectTarget) {
    const url = request.nextUrl.clone()
    url.pathname = redirectTarget
    return NextResponse.redirect(url, 308)
  }

  return await createClient(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
