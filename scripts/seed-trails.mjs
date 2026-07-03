import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const dryRun = process.argv.includes('--dry-run')

// ---------------------------------------------------------------------------
// Trail 1: Spraying Technique
// Grounded in real distinct values queried from fragrances.application_zone
// and fragrances.spritz_count (76 fragrances have this data populated;
// 20 recommend pulse points/wrists, 15 recommend neck, 9 recommend
// hair/clothing — queried 2026-07-03 against scentral-mvp).
// ---------------------------------------------------------------------------
const sprayingTechnique = {
  trail: {
    title: 'Spraying Technique',
    hook: "You're probably spraying this wrong.",
    slug: 'spraying-technique',
  },
  steps: [
    {
      position: 0,
      step_type: 'hook',
      content: {
        headline: "You're probably spraying this wrong.",
        body: 'Most people spray fragrance the same way they were taught as teenagers — and never revisit it. A few small changes can change how long a scent lasts and how it reads to people around you.',
      },
    },
    {
      position: 1,
      step_type: 'fact',
      content: {
        headline: 'Where you spray matters more than how much.',
        body: 'Fragrance needs body heat to project. Pulse points — wrists, neck, chest — run warmer than the rest of your skin, which pushes scent molecules into the air faster and keeps the fragrance evolving through its stages.',
      },
    },
    {
      position: 2,
      step_type: 'data',
      content: {
        stat_label: 'Most common recommended zone (of 76 catalogued fragrances with zone data)',
        stat_value: 'Pulse points / wrists — 20 fragrances',
        source: 'fragrances.application_zone, BaseNote catalogue query, 2026-07-03',
      },
    },
    {
      position: 3,
      step_type: 'term',
      content: {
        term: 'Sillage',
        definition: 'The trail of scent a fragrance leaves as you move — French for "wake," like the wake behind a boat. Application zone is one of the biggest levers you have over it.',
      },
    },
    {
      position: 4,
      step_type: 'data',
      content: {
        stat_label: 'Second most common zone',
        stat_value: 'Neck — 15 fragrances',
        source: 'fragrances.application_zone, BaseNote catalogue query, 2026-07-03',
      },
    },
    {
      position: 5,
      step_type: 'tip',
      content: {
        headline: "Don't rub your wrists together.",
        body: 'It feels natural, but friction generates heat that breaks down the top-note molecules early — you lose the opening act of the fragrance before anyone else even smells it. Spray and let it dry in the air instead.',
      },
    },
    {
      position: 6,
      step_type: 'experience',
      content: {
        body: 'I spent years rubbing my wrists together after every spray because that\'s what I saw in movies. Stopped doing it, and my Bergamot top notes actually lasted past the first ten minutes for the first time.',
        author_label: 'a BaseNote wearer, in the app\'s voice — written example (no live Trace entries exist yet)',
      },
    },
    {
      position: 7,
      step_type: 'people_like_you',
      content: {
        insight: 'Roughly 12% of catalogued fragrances (9 of 76) recommend spraying hair or clothing rather than skin — usually heavier orientals and gourmands where skin chemistry would burn through the scent too fast.',
      },
    },
    {
      position: 8,
      step_type: 'fact',
      content: {
        headline: 'Spritz count is a starting point, not a rule.',
        body: 'The catalogue\'s most common recommendation is 4–5 sprays, but that number assumes average projection. A Beast Mode fragrance at 5 sprays will fill a room; the same count on a Weak-projection scent might not clear your collar.',
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Trail 2: Longevity & Skin Chemistry
// Grounded in real rows from fragrance_notes (56 rows). boiling_point is
// null for every row in this table as of 2026-07-03 (PubChem enrichment
// only populated molecular_weight and xlogp), so 'data' steps cite those
// two real, populated fields instead of fabricating boiling points.
// ---------------------------------------------------------------------------
const longevity = {
  trail: {
    title: 'Longevity & Skin Chemistry',
    hook: 'The same fragrance smells different on every person — here\'s why.',
    slug: 'longevity-skin-chemistry',
  },
  steps: [
    {
      position: 0,
      step_type: 'hook',
      content: {
        headline: 'The same fragrance smells different on every person.',
        body: 'It\'s not in your head. Two people can spray the exact same bottle and get noticeably different lasting power and character. The molecules themselves explain most of it.',
      },
    },
    {
      position: 1,
      step_type: 'term',
      content: {
        term: 'Volatility',
        definition: 'How quickly a scent molecule evaporates off your skin. Fragrance notes are grouped by volatility into top, heart, and base — which is exactly why a fragrance changes over the hours you wear it.',
      },
    },
    {
      position: 2,
      step_type: 'data',
      content: {
        stat_label: 'A base note, by molecular weight',
        stat_value: 'Ambergris — 332.5 g/mol',
        source: 'fragrance_notes.molecular_weight, PubChem via BaseNote catalogue, 2026-07-03',
      },
    },
    {
      position: 3,
      step_type: 'fact',
      content: {
        headline: 'Heavier molecules stick around longer.',
        body: 'Ambergris, at roughly 332.5 g/mol, is the heaviest molecule in our catalogued base notes — heavier molecules evaporate more slowly, which is exactly why base notes like ambergris, musk, and sandalwood are what you still smell hours after top notes like citrus have faded.',
      },
    },
    {
      position: 4,
      step_type: 'data',
      content: {
        stat_label: 'A top note, by molecular weight',
        stat_value: 'Caramel — 126.2 g/mol',
        source: 'fragrance_notes.molecular_weight, PubChem via BaseNote catalogue, 2026-07-03',
      },
    },
    {
      position: 5,
      step_type: 'term',
      content: {
        term: 'XLogP',
        definition: 'A measure of how oil-loving (vs. water-loving) a molecule is. Higher XLogP molecules bind more readily to the oils in your skin — which is part of why fragrance lasts longer on oilier skin types.',
      },
    },
    {
      position: 6,
      step_type: 'data',
      content: {
        stat_label: 'Highest XLogP among catalogued base notes',
        stat_value: 'Musk — XLogP 4.8',
        source: 'fragrance_notes.xlogp, PubChem via BaseNote catalogue, 2026-07-03',
      },
    },
    {
      position: 7,
      step_type: 'tip',
      content: {
        headline: 'Moisturize before you spray.',
        body: 'Dry skin has less surface oil for heavier, high-XLogP molecules (like musk or sandalwood) to bind to — an unscented lotion right before application gives base notes something to hold onto, which is the single biggest longevity lever you control.',
      },
    },
    {
      position: 8,
      step_type: 'people_like_you',
      content: {
        insight: 'People who track their wear notice the same thing the chemistry predicts: fragrances built on lighter top notes like citrus (144.2 g/mol) or vanilla (149.1 g/mol) read as "fresh but fleeting," while heavier base-heavy builds get described as "grows on you across the day."',
      },
    },
  ],
}

// ---------------------------------------------------------------------------
// Trail 3: Why You Can't Smell Your Own Fragrance
// Grounded in real distinct values queried from fragrances.anosmia_risk
// (106 fragrances have this populated: 38 Medium, 37 Low, 31 High — queried
// 2026-07-03 against scentral-mvp).
// ---------------------------------------------------------------------------
const anosmia = {
  trail: {
    title: "Why You Can't Smell Your Own Fragrance",
    hook: 'By hour three, you\'ve stopped smelling the thing you sprayed on.',
    slug: 'nose-blindness',
  },
  steps: [
    {
      position: 0,
      step_type: 'hook',
      content: {
        headline: "By hour three, you've stopped smelling it.",
        body: 'You spray, you smell it clearly for the first twenty minutes, and then — nothing. Everyone around you can still smell it fine. This is not your fragrance fading. It\'s your nose doing exactly what it\'s built to do.',
      },
    },
    {
      position: 1,
      step_type: 'term',
      content: {
        term: 'Olfactory Fatigue',
        definition: 'Sometimes called "nose blindness." Your olfactory receptors stop sending strong signals for a smell they\'ve been continuously exposed to — the brain deprioritizes constant, unchanging input so it can keep noticing new smells. It\'s adaptive, not a flaw.',
      },
    },
    {
      position: 2,
      step_type: 'data',
      content: {
        stat_label: 'Distribution of anosmia risk across 106 catalogued fragrances',
        stat_value: 'Medium 38 · Low 37 · High 31',
        source: 'fragrances.anosmia_risk, BaseNote catalogue query, 2026-07-03',
      },
    },
    {
      position: 3,
      step_type: 'fact',
      content: {
        headline: 'Some fragrances go nose-blind faster than others.',
        body: 'Nearly a third of catalogued fragrances (31 of 106) are flagged High anosmia risk — usually scents built on a small number of very intense, familiar molecules like heavy musks. Fewer distinct notes means your nose adapts to all of them at once.',
      },
    },
    {
      position: 4,
      step_type: 'tip',
      content: {
        headline: 'When in doubt, ask — don\'t re-spray.',
        body: 'The instinct is to spray more because you can\'t smell it anymore. That almost always overshoots for everyone else, since their noses aren\'t fatigued. Ask someone close to you, or wait it out — your nose usually resets within a few hours away from the scent.',
      },
    },
    {
      position: 5,
      step_type: 'experience',
      content: {
        body: 'I used to reapply my signature scent at 2pm every day because I "couldn\'t smell it anymore." My coworker finally told me it was giving people headaches by then. I stopped topping up and just trusted the first application.',
        author_label: 'a BaseNote wearer, in the app\'s voice — written example (no live Trace entries exist yet)',
      },
    },
    {
      position: 6,
      step_type: 'people_like_you',
      content: {
        insight: 'Wearers who stick to fragrances flagged Low anosmia risk (37 of 106 in the catalogue) report the fewest "am I overdoing it" moments — those scents tend to have more evolving, complex note structures that keep registering as novel to the nose.',
      },
    },
    {
      position: 7,
      step_type: 'fact',
      content: {
        headline: 'Your signature scent can work against you.',
        body: 'The fragrance you wear every single day is exactly the one your nose adapts to fastest and most completely — which is part of why people are often told their "usual" smells stronger to others than it does to them.',
      },
    },
  ],
}

const trailBundles = [sprayingTechnique, longevity, anosmia]

async function seed() {
  console.log('🔍 Verifying network access with a trivial read query...')
  const { error: pingError } = await supabase.from('trails').select('id').limit(1)
  if (pingError) {
    console.error('❌ Network/DB check failed:', pingError.message)
    console.error('   Run this script locally instead: node scripts/seed-trails.mjs')
    process.exit(1)
  }
  console.log('✅ Connected to Supabase')

  if (dryRun) {
    console.log('🔍 DRY RUN — would insert:')
    trailBundles.forEach(bundle => {
      console.log(`  • ${bundle.trail.title} (${bundle.trail.slug}) — ${bundle.steps.length} steps`)
    })
    console.log(`\n✓ Ready to insert ${trailBundles.length} trails. Run without --dry-run to proceed.`)
    return
  }

  for (const bundle of trailBundles) {
    console.log(`\n📍 Seeding trail: ${bundle.trail.title}`)

    const { data: trailRow, error: trailError } = await supabase
      .from('trails')
      .upsert(
        { ...bundle.trail, published: false },
        { onConflict: 'slug' }
      )
      .select('id')
      .single()

    if (trailError) {
      console.error(`❌ Failed to upsert trail "${bundle.trail.title}":`, trailError.message)
      process.exit(1)
    }

    const trailId = trailRow.id

    // Clear existing steps for this trail so re-runs don't duplicate
    const { error: deleteError } = await supabase
      .from('trail_steps')
      .delete()
      .eq('trail_id', trailId)

    if (deleteError) {
      console.error(`❌ Failed to clear existing steps for "${bundle.trail.title}":`, deleteError.message)
      process.exit(1)
    }

    const stepsToInsert = bundle.steps.map(s => ({
      trail_id: trailId,
      position: s.position,
      step_type: s.step_type,
      content: s.content,
    }))

    const { error: stepsError } = await supabase
      .from('trail_steps')
      .insert(stepsToInsert)

    if (stepsError) {
      console.error(`❌ Failed to insert steps for "${bundle.trail.title}":`, stepsError.message)
      process.exit(1)
    }

    console.log(`  ✓ ${bundle.steps.length} steps inserted`)

    const { error: publishError } = await supabase
      .from('trails')
      .update({ published: true })
      .eq('id', trailId)

    if (publishError) {
      console.error(`❌ Failed to publish "${bundle.trail.title}":`, publishError.message)
      process.exit(1)
    }

    console.log(`  ✓ Published`)
  }

  console.log('\n✅ All 3 trails seeded and published.')
}

seed()
