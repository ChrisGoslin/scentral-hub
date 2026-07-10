import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import Button from '@/components/ui/Button'
import SensoryAnatomy from '@/components/ui/SensoryAnatomy'
import DidYouKnow from '@/components/ui/DidYouKnow'
import SimilarFragrances from './SimilarFragrances'
import InspiredByClones from './InspiredByClones'
import LogWearButton from './LogWearButton'
import AffinityRater from './AffinityRater'
import RateProjection from './RateProjection'
import { NotesPyramid, WearLogButton, ScentJournal } from './FragranceDetailClient'
import ProsCons from './ProsCons'
import { cookies } from 'next/headers'
import { Users } from 'lucide-react'
import { getSimilarityExplanation } from '@/lib/similarity'
import { getRarityBadge } from '@/lib/rarity'
import { FirstDiscoveryToast } from '@/components/ui/FirstDiscoveryToast'
import BuyLinks from '@/app/components/BuyLinks'
import AffiliateButton from '@/components/ads/AffiliateButton'
import GiftThis from './GiftThis'
import FitNarrativeCard from './FitNarrativeCard'
import CommunityDepth from './CommunityDepth'
import FragranceTraces from './FragranceTraces'
import { GradientPlaceholder } from '@/components/ui/GradientPlaceholder'
import AuraAdvisory from '@/components/aura/AuraAdvisory'
import { getSafeFragranceImageUrl } from '@/lib/fragranceImageUrl'

const PHASE_LABEL: Record<number, string> = {
  1: 'Anchor',
  2: 'Modulator',
  3: 'Top',
}

const SEASON_CHIP: Record<string, string> = {
  'High Heat':     '☀️ Summer',
  'All-Year':      '📅 All year',
  'Winter/Fall':   '🍂 Winter',
  'Spring/Summer': '🌸 Spring',
}

const LONGEVITY_CHIP: Record<string, string> = {
  'Beast Mode': '🔥 Lasts all day',
  'Strong':     '💪 Long-lasting',
  'Moderate':   '⏱ A few hours',
  'Soft':       '🌤 Light wear',
  'Light':      '🌤 Light wear',
}

export default async function FragranceDetailPage({ 
  params, 
  searchParams 
}: { 
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { id } = await params
  const { from } = await searchParams
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)

  const [{ data, error }, { data: collectionRow }, { data: proofData }] = await Promise.all([
    supabase
      .from('fragrances')
      .select('id, brand, name, phase, phase_label, family, projection, anosmia_risk, lean, rating, image_url, use_case, spritz_count, application_zone, maturation, inspired_by, is_user_created, optimal_season, plain_description, top_notes, heart_notes, base_notes, buy_url, buy_label')
      .eq('id', id)
      .single(),
    supabase
      .from('collections')
      .select('id, affinity_score, maceration_started_at, maceration_ready_at, scent_memory')
      .eq('fragrance_id', id)
      .maybeSingle(),
    supabase
      .rpc('get_fragrance_social_proof', { fragrance_ids: [id] })
      .maybeSingle()
  ])

  const proof = proofData as { owner_count?: number | string } | null
  const ownerCount = proof?.owner_count ? Number(proof.owner_count) : 0
  const rarity = getRarityBadge(ownerCount)

  if (error || !data) {
    notFound()
  }

  const f = data
  const safeImageUrl = getSafeFragranceImageUrl(f.image_url)

  // Look up the reference fragrance this clone is inspired by
  let inspiredByRef: { id: string; brand: string; name: string } | null = null
  const target = f.inspired_by
  if (target) {
    const { data: refRow } = await supabase
      .from('fragrances')
      .select('id, brand, name')
      .ilike('name', target)
      .maybeSingle()
    inspiredByRef = refRow ?? null
  }

  let initialWears = 0
  let initialStreak = 0

  if (collectionRow?.id) {
    const { data: logs } = await supabase
      .from('wear_logs')
      .select('logged_at')
      .eq('collection_id', collectionRow.id)
      .order('logged_at', { ascending: false })

    if (logs) {
      initialWears = logs.length
      if (initialWears > 0) {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        
        let streakDate = new Date(today)
        let logIndex = 0

        const mostRecentWear = new Date(logs[0].logged_at)
        mostRecentWear.setHours(0, 0, 0, 0)

        if (mostRecentWear.getTime() === streakDate.getTime() || mostRecentWear.getTime() === streakDate.getTime() - 86400000) {
          initialStreak = 1
          streakDate = new Date(mostRecentWear)
          logIndex = 1
          streakDate.setDate(streakDate.getDate() - 1)

          while (logIndex < logs.length) {
            const logDate = new Date(logs[logIndex].logged_at)
            logDate.setHours(0, 0, 0, 0)

            if (logDate.getTime() === streakDate.getTime()) {
              initialStreak++
              streakDate.setDate(streakDate.getDate() - 1)
            } else if (logDate.getTime() < streakDate.getTime()) {
               break;
            }
            logIndex++
          }
        }
      }
    }
  }

  const phaseLabel = PHASE_LABEL[f.phase] ?? f.phase_label

  const goodForChips = [
    f.optimal_season ? SEASON_CHIP[f.optimal_season] : null,
    f.projection ? LONGEVITY_CHIP[f.projection] : null,
    f.use_case ? `📍 ${f.use_case.charAt(0).toUpperCase()}${f.use_case.slice(1)}` : null,
    f.lean ? `🎯 ${f.lean}` : null,
  ].filter((c): c is string => Boolean(c))

  const now = new Date()
  const readyAt = collectionRow?.maceration_ready_at ? new Date(collectionRow.maceration_ready_at) : null
  const startedAt = collectionRow?.maceration_started_at ? new Date(collectionRow.maceration_started_at) : null

  let maturationChip: 'maturing' | 'macerated' | 'recommended' | null = null
  if (readyAt && readyAt > now) {
    maturationChip = 'maturing'
  } else if (readyAt && readyAt <= now) {
    maturationChip = 'macerated'
  } else if (startedAt) {
    maturationChip = 'macerated'
  } else if (f.maturation) {
    maturationChip = 'recommended'
  }

  const explanation = (f.inspired_by)
    ? getSimilarityExplanation(85, f.inspired_by || '', f.name)
    : null

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg)', color: 'var(--text)', paddingBottom: '6rem' }}>
      {/* Back nav */}
      <div className="px-4 pt-6 pb-2">
        <Link
          href={from === 'discover' || from === 'study' ? '/study' : '/cabinet'}
          style={{ fontSize: 14, color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 4 }}
        >
          ‹ {from === 'discover' || from === 'study' ? 'The Study' : 'The Cabinet'}
        </Link>
      </div>

      {/* Bottle image */}
      <div className="px-8 py-6 flex justify-center">
        {safeImageUrl ? (
          <div style={{ width: 'min(45vw, 200px)', height: 'min(45vw, 200px)', borderRadius: 'var(--r-card)', overflow: 'hidden', background: 'var(--surface-2)', position: 'relative' }}>
            <Image
              src={safeImageUrl}
              alt={`${f.brand} ${f.name}`}
              fill
              priority
              sizes="(max-width: 768px) 45vw, 200px"
              style={{ objectFit: 'contain', padding: 12 }}
            />
          </div>
        ) : (
          <div style={{ width: 'min(45vw, 200px)', height: 'min(45vw, 200px)', borderRadius: 'var(--r-card)', overflow: 'hidden' }}>
            <GradientPlaceholder brand={f.brand} name={f.name} family={f.family} />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="px-4 flex flex-col gap-5">
        <div>
          <p style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {f.brand}
          </p>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 26, color: 'var(--text)', lineHeight: '32px', marginTop: 4 }}>
            {f.name}
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 4 }}>
            {phaseLabel} · {f.family}
          </p>
          {/* Rarity block — replaces simple owner count */}
          {rarity.level !== 'none' ? (
            <div style={{ marginTop: 8 }}>
              <span style={{ fontSize: 9, color: rarity.level === 'cult' ? 'color-mix(in srgb, var(--accent) 70%, transparent)' : 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: 700 }}>
                {rarity.label}
              </span>
              {rarity.isRare && f.inspired_by && (
                <p style={{ fontSize: 12, color: 'var(--accent)', marginTop: 6, lineHeight: '18px' }}>
                  Rare and beautiful — there&apos;s an Inspired By alternative.<br />
                  <strong>{f.inspired_by}</strong> · a fraction of the price.
                </p>
              )}
            </div>
          ) : ownerCount > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '13px', color: 'var(--text-muted)', marginTop: 6 }}>
              <Users size={14} style={{ color: 'var(--accent)' }} />
              <span className="social-count-exact">{ownerCount} {ownerCount === 1 ? 'person' : 'people'} in the nota. community own this</span>
              <span className="social-count-soft">quietly circulating through curator shelves</span>
            </div>
          ) : null}
          {f.plain_description && (
            <p style={{ fontSize: 15, fontStyle: 'italic', color: 'var(--text)', marginTop: 12, lineHeight: '22px' }}>
              &quot;{f.plain_description}&quot;
            </p>
          )}
        </div>

        {/* Scent Journal */}
        <ScentJournal fragranceId={f.id} />

        {/* Aura Advisory — contextual intelligence */}
        <AuraAdvisory
          fragranceId={f.id}
          contextType="detail"
          fragranceData={{
            name: f.name,
            brand: f.brand,
            family: f.family,
            projection: f.projection || 'unknown',
            optimal_season: f.optimal_season || 'all-year',
          }}
        />

        {/* Maturation Banner */}
        {readyAt && readyAt > now && (
          <div style={{
            background: 'color-mix(in srgb, var(--accent) 12%, transparent)',
            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
            borderRadius: 'var(--r-card)',
            padding: '10px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <span style={{ fontSize: 18 }}>⏳</span>
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Macerating</p>
              <p style={{ fontSize: 13, color: 'var(--text)', marginTop: 2 }}>Ready in {Math.ceil((readyAt.getTime() - now.getTime()) / 86400000)} days</p>
            </div>
          </div>
        )}

        {/* Rating */}
        {f.rating !== null && (
          <p style={{ fontSize: 14, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>
            {f.rating}/10
          </p>
        )}

        {maturationChip === 'macerated' && (
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 4,
            fontSize: 12, fontWeight: 500, color: 'var(--positive)',
            background: 'color-mix(in srgb, var(--positive) 12%, transparent)',
            borderRadius: 999, padding: '4px 10px', alignSelf: 'flex-start',
          }}>
            Macerated ✓
          </span>
        )}
        {maturationChip === 'recommended' && (
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Maceration: {f.maturation} recommended
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-col gap-2">
          {f.projection && (
            <div className="flex justify-between">
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Presence</span>
              <span style={{ fontSize: 13, color: 'var(--text)' }}>{LONGEVITY_CHIP[f.projection] || f.projection}</span>
            </div>
          )}
          {f.application_zone && (
            <div className="flex justify-between">
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Best Applied To</span>
              <span style={{ fontSize: 13, color: 'var(--text)', textAlign: 'right', maxWidth: '60%' }}>{f.application_zone}</span>
            </div>
          )}
          {f.spritz_count && (
            <div className="flex justify-between">
              <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>Sprays</span>
              <span style={{ fontSize: 13, color: 'var(--text)', fontVariantNumeric: 'tabular-nums' }}>{f.spritz_count}</span>
            </div>
          )}
        </div>

        {/* Good for — context chips */}
        {goodForChips.length > 0 && (
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 8 }}>
              Good for
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
              {goodForChips.map(chip => (
                <span key={chip} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 999,
                  padding: '6px 14px',
                  fontSize: 12,
                  color: 'var(--text-muted)',
                }}>
                  {chip}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Fit Narrative — persona voice */}
        <FitNarrativeCard
          family={f.family}
          fragranceName={f.name}
          inspiredBy={f.inspired_by}
        />

        {/* Notes Pyramid */}
        <NotesPyramid pyramid={{ top: f.top_notes, heart: f.heart_notes, base: f.base_notes }} />

        {/* AI Verdict */}
        {f.plain_description && (
          <ProsCons
            fragranceId={f.id}
            brand={f.brand}
            name={f.name}
            description={f.plain_description}
          />
        )}

        {/* Log a Wear Button */}
        {collectionRow?.id && (
          <WearLogButton
            fragranceId={f.id}
            fragranceName={f.name}
            brandName={f.brand}
            collectionId={collectionRow.id}
          />
        )}

        {/* Rate Projection */}
        <RateProjection fragranceId={f.id} currentProjection={f.projection} />

        {/* Sensory Anatomy */}
        {f.application_zone && (
          <SensoryAnatomy 
            zone={f.application_zone} 
            family={f.family}
            projection={f.projection}
          />
        )}

        <DidYouKnow family={f.family} />

        <CommunityDepth fragranceId={f.id} />

        {/* Traces — identity-tied scent descriptions + insight strip */}
        <FragranceTraces fragranceId={f.id} family={f.family} />

        {/* Resonance — Find Similar */}
        <SimilarFragrances fragranceId={f.id} />

        {/* Inspired By — "Smells like" card */}
        {(f.inspired_by) && (
          <div style={{
            padding: '16px',
            background: 'var(--surface)',
            border: '1px solid color-mix(in srgb, var(--accent) 40%, transparent)',
            borderRadius: 'var(--r-card)',
          }}>
            <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--accent)' }}>
              Smells like
            </p>
            {inspiredByRef ? (
              <Link href={`/cabinet/${inspiredByRef.id}?from=cabinet`} style={{ textDecoration: 'none' }}>
                <div style={{ marginTop: 6, lineHeight: '24px' }}>
                  <span style={{ fontSize: 13, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.08em', display: 'block' }}>
                    {inspiredByRef.brand}
                  </span>
                  <span style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                    {inspiredByRef.name} →
                  </span>
                </div>
              </Link>
            ) : (
              <p style={{ fontSize: 20, fontFamily: 'var(--font-display)', color: 'var(--text)', marginTop: 6, lineHeight: '24px' }}>
                {f.inspired_by}
              </p>
            )}
            {explanation && (
              <>
                <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5 }}>
                  <strong style={{ color: 'var(--text)', fontFamily: 'var(--font-display)' }}>
                    {explanation.title}
                  </strong>
                  {' — '}{explanation.summary}
                </p>
                <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6 }}>
                  💡 {explanation.guidance.when_to_choose}
                </p>
              </>
            )}
          </div>
        )}

        {/* Clones — shown on reference fragrances (no rating, catalogue entry) */}
        {f.rating === null && f.is_user_created === false && (
          <InspiredByClones fragranceName={f.name} fragranceBrand={f.brand} fragranceId={f.id} from={from} />
        )}

        {/* Anosmia — inline pill only */}
        {f.anosmia_risk === 'High' && (
          <span
            title="High anosmia risk — wear in open environments and space from other high-ARR fragrances"
            style={{ fontSize: 10, color: 'var(--text-muted)', border: '1px solid var(--line)', background: 'var(--surface)', borderRadius: 999, padding: '2px 8px', display: 'inline-block', cursor: 'help' }}
          >
            ⚠ High ARR
          </span>
        )}

        {/* Find this fragrance — affiliate retailer links */}
        <div>
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-muted)', marginBottom: 10 }}>
            Find this fragrance
          </p>
          {f.buy_url && (
            <div style={{ marginBottom: 10 }}>
              <AffiliateButton
                buyUrl={f.buy_url}
                buyLabel={f.buy_label ?? undefined}
                fragranceName={f.name}
                fragranceId={f.id}
              />
            </div>
          )}
          <BuyLinks fragranceName={f.name} brand={f.brand} />
        </div>

        {/* CTA */}
        <Link href="/lab">
          <Button fullWidth>Try layering this →</Button>
        </Link>
        <GiftThis
          fragranceId={f.id}
          brand={f.brand}
          name={f.name}
          family={f.family}
          optimalSeason={f.optimal_season}
          plainDescription={f.plain_description}
          inspiredBy={f.inspired_by}
        />
        {collectionRow?.id && (
          <LogWearButton
            collectionId={collectionRow.id}
            initialWears={initialWears}
            initialStreak={initialStreak}
            fragranceId={f.id}
            fragranceData={{
              name: f.name,
              brand: f.brand,
              family: f.family,
              projection: f.projection || 'unknown',
              optimal_season: f.optimal_season || 'all-year',
            }}
          />
        )}
        {collectionRow?.id && (
          <AffinityRater
            collectionId={collectionRow.id}
            initialAffinityScore={collectionRow.affinity_score ?? null}
          />
        )}
        <Link
          href="/study"
          style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', display: 'block', padding: 8 }}
        >
          Back to The Study
        </Link>
      </div>
      <FirstDiscoveryToast fragranceId={f.id} ownerCount={ownerCount} />
    </div>
  )
}
