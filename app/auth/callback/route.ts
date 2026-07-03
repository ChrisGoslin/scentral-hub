import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { claimLegacyData } from '@/lib/auth/claimLegacyData';

function getSafeNext(searchParams: URLSearchParams) {
  const next = searchParams.get('next') ?? '/profile';
  return next.startsWith('/') ? next : '/profile';
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = getSafeNext(searchParams);

  if (code) {
    const cookieStore = await cookies();
    const supabase = await createClient(cookieStore);
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const cookieStore = await cookies();
      const supabase = await createClient(cookieStore);
      const { data: { user } } = await supabase.auth.getUser();

      // Claim legacy anon_id data if user has an anonId in their profile
      if (user?.id) {
        try {
          const { data: profile } = await supabase
            .from('profiles')
            .select('anon_id')
            .eq('user_id', user.id)
            .maybeSingle();

          if (profile?.anon_id) {
            await claimLegacyData(supabase, user.id, profile.anon_id);
          }
        } catch (err) {
          console.error('Failed to claim legacy data:', err);
          // Don't fail auth on claim failure — user can still proceed
        }
      }

      const forwardedHost = request.headers.get('x-forwarded-host');
      const isLocalEnv = process.env.NODE_ENV === 'development';

      if (!isLocalEnv && forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`);
      }

      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`);
}
