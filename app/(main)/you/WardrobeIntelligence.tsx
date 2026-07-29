'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Chip from '@/components/ui/Chip'
import { Sparkles, ArrowRight } from 'lucide-react'

type Gap = {
  gap: string
  severity: 'critical' | 'moderate' | 'minor'
  recommendation: string
}

type SommelierResult = {
  headline: string
  strengths: string[]
  gaps: Gap[]
  personality_archetype: string
  archetype_description: string
  cached?: boolean
}

export default function WardrobeIntelligence() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SommelierResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runAudit() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/sommelier', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'gap_analysis' })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Audit failed')
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Audit failed')
    } finally {
      setLoading(false)
    }
  }

  const getDotColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'bg-red-500'
      case 'moderate': return 'bg-orange-500'
      default: return 'bg-yellow-500'
    }
  }

  return (
    <Card className="bg-[var(--surface)] border-[var(--line)] p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--text)]">Wardrobe Intelligence</h3>
        {!result && !loading && (
          <Button variant="secondary" className="h-8 px-4 text-[10px]" onClick={runAudit}>
            Analyse
          </Button>
        )}
      </div>

      {!result && !loading && (
        <p className="text-xs text-[var(--text-muted)] font-light">
          Audit your collection for strategic gaps, seasonal coverage, and personality archetypes.
        </p>
      )}

      {loading && (
        <div className="py-8 text-center space-y-3">
          <Sparkles size={24} className="mx-auto text-[var(--accent)] opacity-80" />
          <p className="text-xs font-light text-[var(--text-muted)] italic">
            The Sommelier is auditing your collection...
          </p>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-500/10 text-red-500 text-[10px] text-center rounded border border-red-500/20">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-2 duration-500">
          <div className="text-center space-y-3">
            <div className="inline-block px-4 py-2 border border-[var(--accent)] rounded-full">
              <span className="text-lg font-serif italic text-[var(--accent)]">
                {result.personality_archetype}
              </span>
            </div>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
              {result.archetype_description}
            </p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Your Collection</p>
              <p className="text-sm font-serif italic text-[var(--text)]">{result.headline}</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--positive)]">Strengths</p>
                <ul className="space-y-1.5">
                  {result.strengths.map((s, i) => (
                    <li key={i} className="flex items-center gap-2 text-[11px] text-[var(--text-muted)]">
                      <div className="w-1.5 h-1.5 rounded-full bg-[var(--positive)]" />
                      {s}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3 pt-2">
                <p className="text-[9px] font-bold uppercase tracking-widest text-orange-500">Strategic Gaps</p>
                <div className="space-y-3">
                  {result.gaps.map((g, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-start gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${getDotColor(g.severity)}`} />
                        <p className="text-[11px] text-[var(--text)] leading-normal">{g.gap}</p>
                      </div>
                      <div className="pl-3.5">
                        <Chip className="text-[9px] py-0.5">
                          Suggest: {g.recommendation}
                        </Chip>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[var(--line)] flex justify-between items-center">
            <div className="flex items-center gap-2">
              {result.cached && <span className="text-[9px] font-mono text-[var(--text-muted)] uppercase tracking-tighter">Retrieved from Archives</span>}
            </div>
            <Link 
              href="/intelligence"
              className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[var(--accent)] hover:translate-x-1 transition-transform"
            >
              Full Intelligence <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      )}
    </Card>
  )
}
