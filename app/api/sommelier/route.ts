import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import Anthropic from '@anthropic-ai/sdk'
import { clientIp, enforce, makeLimiter } from '@/lib/rate-limit'

const sommelierLimiter = makeLimiter('sommelier', 20, '1 m')

export async function POST(req: Request) {
  try {
    if (!(await enforce(sommelierLimiter, clientIp(req)))) {
      return NextResponse.json({ error: 'Too many sommelier requests. Try again in a minute.' }, { status: 429 })
    }

    const { mode, lat, lon, time_of_day = 'evening', occasion } = await req.json()
    
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)

    // Check cache for gap_analysis
    if (mode === 'gap_analysis') {
      const { data: cached } = await supabase
        .from('sommelier_cache')
        .select('result, created_at')
        .eq('mode', 'gap_analysis')
        .single()

      if (cached) {
        const createdAt = new Date(cached.created_at)
        const now = new Date()
        const diffHours = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60)
        if (diffHours < 24) {
          return NextResponse.json({ success: true, ...cached.result, cached: true })
        }
      }
    }

    if (mode === 'gap_analysis') {
      const { data: frags } = await supabase
        .from('fragrances')
        .select('family, phase, optimal_season, projection, lean, rating')
        .not('rating', 'is', null)

      if (!frags || frags.length === 0) {
        return NextResponse.json({ error: 'No rated fragrances found' }, { status: 404 })
      }

      const total = frags.length
      const highRated = frags.filter(f => (f.rating || 0) >= 8)

      // 1. Missing families
      const targetFamilies = ['Fresh Aquatic', 'Leather Oriental', 'Woody Vetiver', 'Oud Rose', 'Green Floral']
      const missingFamilies = targetFamilies.filter(tf => frags.filter(f => f.family.includes(tf)).length < 2)

      // 2. Phase imbalance
      const p1Count = frags.filter(f => f.phase === 1).length
      const p3Count = frags.filter(f => f.phase === 3).length
      const p1Pct = p1Count / total
      const p3Pct = p3Count / total
      
      const imbalances = []
      if (p1Pct > 0.6) imbalances.push('anchor-heavy')
      if (p3Pct < 0.15) imbalances.push('top-note deficient')

      // 3. Season gap
      const seasons = ['High Heat', 'Winter/Fall', 'Spring/Summer', 'All-Year']
      const seasonGaps = seasons.filter(s => highRated.filter(f => f.optimal_season === s).length < 3)

      // 4. Projection gap
      const hasMedium = frags.some(f => f.projection === 'Medium')
      const projGaps = !hasMedium ? ['office-hostile'] : []

      const gapContext = {
        total_fragrances: total,
        missing_families: missingFamilies,
        imbalances,
        season_gaps: seasonGaps,
        projection_gaps: projGaps
      }

      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
      const prompt = `You are the Scentral Collection Sommelier. Analyze this fragrance wardrobe's data and provide strategic intelligence.

      COLLECTION DATA:
      ${JSON.stringify(gapContext, null, 2)}

      Return a JSON response only:
      {
        "headline": "Your wardrobe in one sentence",
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "gaps": [{ "gap": "description", "severity": "critical|moderate|minor", "recommendation": "specific fragrance suggestion" }],
        "personality_archetype": "The Architect | The Hedonist | The Minimalist | The Collector | The Experimenter",
        "archetype_description": "2 sentences"
      }`

      const message = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      })
      const text = (message.content[0] as { type: 'text'; text: string }).text
      const jsonStr = text.replace(/```json/g, '').replace(/```/g, '').trim()
      const geminiResult = JSON.parse(jsonStr)

      // Cache the result
      await supabase.from('sommelier_cache').upsert({
        mode: 'gap_analysis',
        result: geminiResult,
        created_at: new Date().toISOString()
      }, { onConflict: 'mode' })

      return NextResponse.json({ success: true, ...geminiResult })
    }

    if (mode === 'daily_pick') {
      if (!lat || !lon) return NextResponse.json({ error: 'Location required' }, { status: 400 })

      // Fetch weather
      const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m&timezone=auto`)
      const weather = await weatherRes.json()

      const { data: frags } = await supabase
        .from('fragrances')
        .select('id, brand, name, family, phase, optimal_season, projection, rating')
        .not('rating', 'is', null)
        .order('rating', { ascending: false })
        .limit(20)

      if (!frags) return NextResponse.json({ error: 'Fragrances not found' }, { status: 404 })

      // Simple scoring for daily pick
      const temp = weather.current.temperature_2m
      const humidity = weather.current.relative_humidity_2m
      
      const scored = frags.map(f => {
        let score = (f.rating || 5) * 5
        
        // Weather fit
        if (temp > 25 && f.optimal_season === 'High Heat') score += 20
        if (temp < 10 && f.optimal_season === 'Winter/Fall') score += 20
        if (f.optimal_season === 'All-Year') score += 10
        
        // Time of day fit
        if (time_of_day === 'evening' && f.phase === 1) score += 15
        if (time_of_day === 'morning' && f.phase === 3) score += 15

        return { ...f, daily_score: score }
      })

      const top3 = scored.sort((a, b) => b.daily_score - a.daily_score).slice(0, 3)

      return NextResponse.json({ 
        success: true, 
        weather: { temp, humidity },
        recommendations: top3.map(r => ({
          ...r,
          reasoning: `Matches ${temp}°C conditions and your ${time_of_day} preference.`
        }))
      })
    }

    if (mode === 'occasion_audit') {
      const { data: frags } = await supabase
        .from('fragrances')
        .select('id, brand, name, use_case, rating')
        .not('rating', 'is', null)

      const occasions = ['Work', 'Date', 'Gym', 'Formal', 'Casual', 'Evening']
      const coverage: any = {}

      occasions.forEach(occ => {
        const matches = (frags || [])
          .filter(f => f.use_case?.toLowerCase().includes(occ.toLowerCase()))
          .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        
        coverage[occ] = {
          count: matches.length,
          top: matches.slice(0, 2),
          gap: matches.length < 2
        }
      })

      return NextResponse.json({ success: true, coverage })
    }

    return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })

  } catch (error: any) {
    console.error('Sommelier API Error:', error)
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 })
  }
}
