'use client'

import React, { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import Chip from '@/components/ui/Chip'
import { Beaker, AlertTriangle, CheckCircle2, FlaskConical, Activity } from 'lucide-react'

type ChemistResult = {
  chemist_score: number
  conflict_score: number
  volatility_score: number
  projection_score: number
  claude_result: {
    verdict: 'Harmonious' | 'Complementary' | 'Neutral' | 'Risky' | 'Clash'
    chemist_note: string
    application_protocol: string[]
    synergy_accords: string[]
    caution: string | null
  }
}

type ChemistPanelProps = {
  fragranceAId: string
  fragranceBId: string
  fragranceAName: string
  fragranceBName: string
  useCase?: string
}

function ScoreBar({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
        <span>{label}</span>
        <span>{value}%</span>
      </div>
      <div className="h-1.5 bg-[var(--surface-2)] rounded-full overflow-hidden border border-[var(--line)]">
        <div 
          className="h-full bg-[var(--accent)] transition-all duration-1000 ease-out"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  )
}

export default function ChemistPanel({ 
  fragranceAId, 
  fragranceBId, 
  fragranceAName, 
  fragranceBName,
  useCase 
}: ChemistPanelProps) {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ChemistResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function runAnalysis() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/chemist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fragrance_a_id: fragranceAId, fragrance_b_id: fragranceBId, use_case: useCase })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed to analyze')
      setResult(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const getVerdictColor = (verdict: string) => {
    switch (verdict) {
      case 'Harmonious': return 'text-[var(--positive)] border-[var(--positive)]'
      case 'Complementary': return 'text-[var(--accent)] border-[var(--accent)]'
      case 'Risky': return 'text-orange-500 border-orange-500'
      case 'Clash': return 'text-red-500 border-red-500'
      default: return 'text-[var(--text-muted)] border-[var(--line)]'
    }
  }

  return (
    <div className="mt-8 pt-8 border-t border-[var(--line)]">
      {!result && !loading && (
        <Button 
          variant="secondary" 
          fullWidth 
          onClick={runAnalysis}
          className="group flex items-center justify-center gap-2 border-[var(--accent)] text-[var(--accent)]"
        >
          <Beaker size={16} className="group-hover:rotate-12 transition-transform" />
          Run Olfactory Chemist Analysis
        </Button>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
          <div className="relative">
            <FlaskConical size={32} className="text-[var(--accent)] animate-pulse" />
            <Activity size={16} className="absolute -right-2 -bottom-2 text-[var(--accent)] opacity-50" />
          </div>
          <p className="text-sm font-light text-[var(--text-muted)] italic">
            The Chemist is analysing molecular compatibility<span className="animate-bounce inline-block">.</span>
          </p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-[var(--r-card)] text-red-500 text-xs text-center">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <header className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-[0.2em] ${getVerdictColor(result.claude_result.verdict)}`}>
                {result.claude_result.verdict}
              </div>
              <div className="w-10 h-10 rounded-full border border-[var(--accent)] flex items-center justify-center text-sm font-bold text-[var(--accent)] font-serif">
                {result.chemist_score}
              </div>
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">Molecular Score</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ScoreBar label="Note Conflict" value={result.conflict_score} />
            <ScoreBar label="Volatility" value={result.volatility_score} />
            <ScoreBar label="Projection" value={result.projection_score} />
          </div>

          <div className="space-y-4">
            <p className="text-lg font-serif italic text-[var(--text)] leading-relaxed">
              &ldquo;{result.claude_result.chemist_note}&rdquo;
            </p>

            <div className="flex flex-wrap gap-2">
              {result.claude_result.synergy_accords.map(accord => (
                <Chip key={accord} selected={true} className="text-[9px]">
                  {accord} Accord
                </Chip>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--accent)]">Application Protocol</h4>
              <ul className="space-y-3">
                {result.claude_result.application_protocol.map((step, i) => (
                  <li key={i} className="flex gap-3 text-xs font-light text-[var(--text-muted)] leading-normal">
                    <span className="text-[var(--accent)] font-bold">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            {result.claude_result.caution && (
              <div className="p-5 border border-orange-500/30 bg-orange-500/5 rounded-[var(--r-card)] space-y-2 self-start">
                <div className="flex items-center gap-2 text-orange-500 font-bold uppercase tracking-widest text-[9px]">
                  <AlertTriangle size={12} />
                  Chemical Caution
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  {result.claude_result.caution}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
