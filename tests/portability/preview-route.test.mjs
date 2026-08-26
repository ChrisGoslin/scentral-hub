// Real, authenticated integration test for POST /api/portability/preview.
//
// This imports the actual route handler (route.ts) — not a re-implementation
// of its logic — and drives it with real NextRequest objects. The only thing
// mocked is the Supabase client boundary (`@/utils/supabase/server`) and the
// rate limiter, because this suite has no live Supabase project to
// authenticate against; every other code path (content-type check, body-size
// check, request validation, catalogue lookup via the injected Supabase
// stub, response shape) runs for real.
//
// Requires: --experimental-strip-types --experimental-test-module-mocks
// --import ./tests/support/register-loader.mjs (wired into `npm run
// test:unit` in package.json).
import test from 'node:test'
import assert from 'node:assert/strict'
import { PORTABILITY_PREVIEW_LIMITS } from '../../lib/security/portability-preview.js'

const ROUTE_SPECIFIER = '@/app/api/portability/preview/route.ts'
const SUPABASE_SPECIFIER = '@/utils/supabase/server'
const RATE_LIMIT_SPECIFIER = '@/lib/rate-limit'

const AUTH_USER = { id: 'user-real-123' }

function makeSupabaseStub({ user = AUTH_USER, authError = null, fragrances = [] } = {}) {
  let selectCalls = 0
  let anyMutationAttempted = false

  const guardWrite = (method) => () => {
    anyMutationAttempted = true
    throw new Error(`unexpected write via ${method} — preview must not touch the database`)
  }

  const query = {
    select() {
      selectCalls += 1
      return query
    },
    or() {
      return query
    },
    limit() {
      return Promise.resolve({ data: fragrances, error: null })
    },
    insert: guardWrite('insert'),
    update: guardWrite('update'),
    upsert: guardWrite('upsert'),
    delete: guardWrite('delete'),
  }

  const supabase = {
    auth: {
      getUser: async () => ({ data: { user }, error: authError }),
    },
    from(table) {
      if (table !== 'fragrances') {
        throw new Error(`unexpected table access in preview route: ${table}`)
      }
      return query
    },
  }

  return {
    supabase,
    getSelectCalls: () => selectCalls,
    getWriteAttempted: () => anyMutationAttempted,
  }
}

function mockRouteDependencies(t, { supabaseStub, allowRateLimit = true } = {}) {
  t.mock.module(SUPABASE_SPECIFIER, {
    namedExports: {
      createClient: async () => supabaseStub.supabase,
    },
  })
  t.mock.module(RATE_LIMIT_SPECIFIER, {
    namedExports: {
      makeLimiter: () => null,
      enforce: async () => allowRateLimit,
    },
  })
}

let importCounter = 0

async function importRoute() {
  // The route module is cached by resolved URL after its first import, so a
  // second `import(ROUTE_SPECIFIER)` in a later test would return the
  // instance already bound to the *first* test's mocked dependencies. Bust
  // the ESM cache per test with a query string so every test gets a fresh
  // module evaluation wired to its own mocks.
  importCounter += 1
  return import(`${ROUTE_SPECIFIER}?t=${importCounter}`)
}

function jsonRequest(body, { contentType = 'application/json', headers = {} } = {}) {
  const payload = typeof body === 'string' ? body : JSON.stringify(body)
  return new Request('http://localhost/api/portability/preview', {
    method: 'POST',
    headers: {
      ...(contentType ? { 'content-type': contentType } : {}),
      'content-length': String(Buffer.byteLength(payload)),
      ...headers,
    },
    body: payload,
  })
}

test('POST /api/portability/preview rejects unauthenticated requests with 401', async (t) => {
  const supabaseStub = makeSupabaseStub({ user: null, authError: { message: 'no session' } })
  mockRouteDependencies(t, { supabaseStub })

  const { POST } = await importRoute()
  const response = await POST(jsonRequest({ text: 'brand,name\nDior,Sauvage' }))
  const body = await response.json()

  assert.equal(response.status, 401)
  assert.match(body.error, /sign in/i)
  assert.equal(supabaseStub.getWriteAttempted(), false)
})

test('POST /api/portability/preview rejects a non-JSON content type with 415', async (t) => {
  const supabaseStub = makeSupabaseStub()
  mockRouteDependencies(t, { supabaseStub })

  const { POST } = await importRoute()
  const response = await POST(jsonRequest('brand,name\nDior,Sauvage', { contentType: 'text/plain' }))
  const body = await response.json()

  assert.equal(response.status, 415)
  assert.match(body.error, /JSON/i)
  assert.equal(supabaseStub.getWriteAttempted(), false)
})

test('POST /api/portability/preview rejects an oversized payload before parsing it', async (t) => {
  const supabaseStub = makeSupabaseStub()
  mockRouteDependencies(t, { supabaseStub })

  const { POST } = await importRoute()
  const oversizedText = 'brand,name\n' + 'A'.repeat(PORTABILITY_PREVIEW_LIMITS.maxRequestBytes + 1)
  const response = await POST(jsonRequest({ text: oversizedText }))
  const body = await response.json()

  assert.equal(response.status, 413)
  assert.match(body.error, /too large/i)
  assert.equal(supabaseStub.getWriteAttempted(), false)
})

test('POST /api/portability/preview returns a matched preview for a signed-in user (happy path)', async (t) => {
  const supabaseStub = makeSupabaseStub({
    fragrances: [
      { id: 'dior-sauvage', brand: 'Dior', name: 'Sauvage' },
      { id: 'dior-sauvage-elixir', brand: 'Dior', name: 'Sauvage Elixir' },
    ],
  })
  mockRouteDependencies(t, { supabaseStub })

  const { POST } = await importRoute()
  const response = await POST(jsonRequest({ text: 'brand,name\nDior,Sauvage' }))
  const body = await response.json()

  assert.equal(response.status, 200)
  assert.equal(body.scope, 'post-onboarding archive preview only')
  assert.equal(body.summary.total, 1)
  assert.equal(body.summary.exact, 1)
  assert.equal(body.results[0].selectedFragranceId, 'dior-sauvage')
  assert.deepEqual(body.limits, PORTABILITY_PREVIEW_LIMITS)
  assert.ok(supabaseStub.getSelectCalls() > 0, 'expected the route to query the catalogue for candidates')
})

test('POST /api/portability/preview never writes to the database, even on a matched preview', async (t) => {
  const supabaseStub = makeSupabaseStub({
    fragrances: [{ id: 'dior-sauvage', brand: 'Dior', name: 'Sauvage' }],
  })
  mockRouteDependencies(t, { supabaseStub })

  const { POST } = await importRoute()
  await POST(jsonRequest({ text: 'brand,name\nDior,Sauvage\nUnknown,Memory' }))

  // The stub throws synchronously from insert/update/upsert/delete, so a
  // successful response combined with getWriteAttempted() === false is the
  // proof this preview call made read-only catalogue lookups only.
  assert.equal(supabaseStub.getWriteAttempted(), false)
})
