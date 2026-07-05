import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Shared per-route rate limiting (docs/nota/06-testing-security-abuse.md §3.1).
// One Redis client, per-route limiters distinguished by prefix. Falls back to
// allow-all when Upstash env is absent (local dev) — same contract as the
// original inline limiter in app/api/formulate/route.ts.
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

export function makeLimiter(
  prefix: string,
  tokens: number,
  window: `${number} ${'s' | 'm' | 'h'}`,
): Ratelimit | null {
  return redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(tokens, window),
        prefix,
        analytics: true,
      })
    : null;
}

// identity: user.id when signed in, else client IP (x-forwarded-for on Vercel).
export async function enforce(
  limiter: Ratelimit | null,
  identity: string,
): Promise<boolean> {
  if (!limiter) return true;
  const { success } = await limiter.limit(identity);
  return success;
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
}
