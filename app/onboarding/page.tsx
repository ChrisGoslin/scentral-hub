'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [selections, setSelections] = useState({
    experience: '',
    vibe: '',
    goal: ''
  })

  const nextStep = () => setStep((s) => (s + 1) as Step)
  const prevStep = () => setStep((s) => (s - 1) as Step)

  const handleSelection = (field: string, value: string) => {
    setSelections(prev => ({ ...prev, [field]: value }))
    if (step < 3) {
      nextStep()
    }
  }

  const finishOnboarding = () => {
    // In a real app, we'd save these preferences. 
    // For the MVP, we just route them to the relevant discovery area.
    router.push('/collection?browse=true')
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center px-6 py-20 transition-colors duration-700">
      <div className="max-w-xl w-full space-y-12 fade-up">
        
        {/* Progress header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div 
                key={s} 
                className={`h-1 w-8 rounded-full transition-all duration-500 ${step >= s ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'}`} 
              />
            ))}
          </div>
          <Link href="/" className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
            Exit
          </Link>
        </div>

        {/* Step 1: Experience Level */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)] font-bold">Welcome to Scentral</p>
              <h1 className="text-4xl font-serif italic tracking-tight">How many bottles are in your collection right now?</h1>
            </div>
            <div className="grid gap-4">
              {[
                { id: 'new', label: 'None, I\'m just starting out', sub: 'I want to find my first signature scent.' },
                { id: 'occasional', label: 'One or two', sub: 'I have a few for work and going out.' },
                { id: 'collector', label: 'I\'ve started collecting', sub: 'I have 5+ and I\'m looking for hidden gems.' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelection('experience', opt.id)}
                  className="w-full text-left bg-[var(--surface)] border border-[var(--line)] p-6 transition-all hover:border-[var(--accent)] group shadow-sm"
                >
                  <p className="text-sm font-bold uppercase tracking-widest group-hover:text-[var(--accent)] transition-colors">{opt.label}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-light">{opt.sub}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Vibe / Preference */}
        {step === 2 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)] font-bold">Your Taste</p>
              <h1 className="text-4xl font-serif italic tracking-tight">What kind of scents usually catch your nose?</h1>
            </div>
            <div className="grid gap-4">
              {[
                { id: 'fresh', label: 'Fresh & Clean', sub: 'Crisp citrus, ocean air, and clean laundry vibes.' },
                { id: 'warm', label: 'Warm & Rich', sub: 'Amber, sweet vanilla, and spices that last all day.' },
                { id: 'bold', label: 'Dark & Woody', sub: 'Leather, oud, and earthy woods with a bold presence.' },
                { id: 'undecided', label: 'I\'m not sure yet', sub: 'Show me the best-sellers and crowd-pleasers.' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelection('vibe', opt.id)}
                  className="w-full text-left bg-[var(--surface)] border border-[var(--line)] p-6 transition-all hover:border-[var(--accent)] group shadow-sm"
                >
                  <p className="text-sm font-bold uppercase tracking-widest group-hover:text-[var(--accent)] transition-colors">{opt.label}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-light">{opt.sub}</p>
                </button>
              ))}
            </div>
            <button onClick={prevStep} className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
              ← Back
            </button>
          </div>
        )}

        {/* Step 3: Core Pain Point / Goal */}
        {step === 3 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-[0.3em] text-[var(--accent)] font-bold">The Goal</p>
              <h1 className="text-4xl font-serif italic tracking-tight">What\'s the one thing you want to solve first?</h1>
            </div>
            <div className="grid gap-4">
              {[
                { id: 'longevity', label: 'Scent fading too fast', sub: 'I want scents that stay on my skin from morning to night.' },
                { id: 'inspired', label: 'Finding cheaper alternatives', sub: 'I want to find luxury smells at "Christopher" prices.' },
                { id: 'layering', label: 'Creating something unique', sub: 'I want to learn how to combine bottles I already own.' }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleSelection('goal', opt.id)}
                  className="w-full text-left bg-[var(--surface)] border border-[var(--line)] p-6 transition-all hover:border-[var(--accent)] group shadow-sm"
                >
                  <p className="text-sm font-bold uppercase tracking-widest group-hover:text-[var(--accent)] transition-colors">{opt.label}</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1 font-light">{opt.sub}</p>
                </button>
              ))}
            </div>
            <div className="flex justify-between items-center pt-4">
              <button onClick={prevStep} className="text-[10px] uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text)] transition-colors">
                ← Back
              </button>
              <button 
                onClick={finishOnboarding}
                className="bg-[var(--accent)] text-white px-10 py-4 rounded-[var(--r-btn)] shadow-sm transition-all hover:bg-[var(--accent-press)] active:scale-95 font-bold uppercase tracking-widest text-[10px]"
              >
                Let\'s begin
              </button>
            </div>
          </div>
        )}

        {/* Footer note for Gavan */}
        <div className="pt-10 border-t border-[var(--line)]">
          <p className="text-[11px] text-[var(--text-muted)] font-light leading-relaxed italic">
            "You don\'t need to know note pyramids or chemical concentrations to find a great scent. 
            We use plain language to bridge the gap between what you know and the inspired-by world."
          </p>
        </div>
      </div>
    </div>
  )
}
