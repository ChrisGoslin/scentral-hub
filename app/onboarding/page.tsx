'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Chip from '@/components/ui/Chip'
import Button from '@/components/ui/Button'

type Step = 1 | 2 | 3

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState<Step>(1)
  const [fade, setFade] = useState(true)
  const [isAlreadyOnboarded, setIsAlreadyOnboarded] = useState(false)

  const [step1Choices, setStep1Choices] = useState<string[]>([])
  const [step2Choice, setStep2Choice] = useState<string>('')
  const [step3Choice, setStep3Choice] = useState<string>('')

  // Guard: if already onboarded, show a static "you're set up" screen
  useEffect(() => {
    if (localStorage.getItem('scentral_onboarded') === 'true') {
      setIsAlreadyOnboarded(true)
    }
  }, [])

  // Handle step transitions with a simple fade
  const transitionTo = (next: Step) => {
    setFade(false)
    setTimeout(() => {
      setStep(next)
      setFade(true)
    }, 200)
  }

  const handleFinish = () => {
    const vibeMap: Record<string, string> = {
      '🔥 Warm & Cosy': 'warm',
      '💧 Fresh & Clean': 'fresh',
      '⚡ Bold & Powerful': 'bold',
      '🌙 Soft & Subtle': 'soft',
    }
    
    localStorage.setItem('scentral_onboarded', 'true')
    localStorage.setItem('scentral_vibe', vibeMap[step3Choice] || 'fresh')
    router.push('/discover')
  }

  const handleSkip = () => {
    localStorage.setItem('scentral_onboarded', 'true')
    router.push('/discover')
  }

  const step1Options = ['Nothing yet', '1–2 bottles', 'A few (3–5)', '5+ and growing']
  const step2Options = [
    'Lasts all day without reapplying',
    'People notice when I walk past',
    'Safe for the office',
    'Finding cheaper alternatives to expensive scents',
    'All of the above'
  ]

  const vibeCards = [
    { label: '🔥 Warm & Cosy', sub: 'Rich, amber, smoky. Stays close to skin.' },
    { label: '💧 Fresh & Clean', sub: 'Light, citrus, crisp. Great for day wear.' },
    { label: '⚡ Bold & Powerful', sub: 'Loud, commanding, unforgettable.' },
    { label: '🌙 Soft & Subtle', sub: 'Delicate, skin-close, intimate.' }
  ]

  const isNextDisabled = 
    (step === 1 && step1Choices.length === 0) || 
    (step === 2 && !step2Choice) || 
    (step === 3 && !step3Choice)

  if (isAlreadyOnboarded) {
    return (
      <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center justify-center px-6">
        <div className="w-full max-w-[480px] text-center" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
          <span style={{ fontSize: 48, lineHeight: 1 }}>✓</span>
          <h1 className="text-2xl font-serif">You&apos;re already set up</h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: '1.5' }}>
            Your preferences are saved. Head to Discover to find your next scent.
          </p>
          <Link href="/discover" style={{ width: '100%' }}>
            <Button fullWidth>Back to Discover →</Button>
          </Link>
          <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            Want to redo it? Go to{' '}
            <Link href="/you" style={{ color: 'var(--accent)' }}>
              You → Reset my preferences
            </Link>
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] flex flex-col items-center">
      <div className="w-full max-w-[480px] px-6 pt-8 pb-10 flex flex-col min-h-screen">
        
        {/* Progress Header */}
        <div className="flex gap-2 mb-12">
          {[1, 2, 3].map((s) => (
            <div 
              key={s} 
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step >= s ? 'bg-[var(--accent)]' : 'bg-[var(--line)]'
              }`} 
            />
          ))}
        </div>

        {/* Content Area */}
        <div 
          className={`flex-1 transition-all duration-300 ${
            fade ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
        >
          {step === 1 && (
            <div className="space-y-8">
              <header className="space-y-2">
                <h1 className="text-2xl font-serif leading-tight">What's in your collection right now?</h1>
                <p className="text-sm text-[var(--text-muted)] font-light leading-relaxed">
                  Don't worry if it's nothing — that's where most people start.
                </p>
              </header>
              <div className="flex flex-wrap gap-3">
                {step1Options.map((opt) => (
                  <Chip
                    key={opt}
                    selected={step1Choices.includes(opt)}
                    onClick={() => {
                      setStep1Choices(prev => 
                        prev.includes(opt) ? prev.filter(i => i !== opt) : [...prev, opt]
                      )
                    }}
                  >
                    {opt}
                  </Chip>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-8">
              <header className="space-y-2">
                <h1 className="text-2xl font-serif leading-tight">What do you care about most?</h1>
              </header>
              <div className="flex flex-col gap-3">
                {step2Options.map((opt) => (
                  <Chip
                    key={opt}
                    className="justify-start"
                    selected={step2Choice === opt}
                    onClick={() => setStep2Choice(opt)}
                  >
                    {opt}
                  </Chip>
                ))}
              </div>
              <button 
                onClick={() => transitionTo(1)}
                className="text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                ← Back
              </button>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-8">
              <header className="space-y-2">
                <h1 className="text-2xl font-serif leading-tight">What kind of scents do you reach for?</h1>
              </header>
              <div className="grid grid-cols-2 gap-4">
                {vibeCards.map((vibe) => (
                  <div
                    key={vibe.label}
                    onClick={() => setStep3Choice(vibe.label)}
                    className={`p-4 rounded-[var(--r-card)] bg-[var(--surface)] border transition-all cursor-pointer flex flex-col gap-2 ${
                      step3Choice === vibe.label 
                        ? 'border-[var(--accent)] shadow-[0_0_0_1px_var(--accent)]' 
                        : 'border-[var(--line)]'
                    }`}
                  >
                    <p className="text-sm font-bold">{vibe.label}</p>
                    <p className="text-[11px] text-[var(--text-muted)] leading-tight font-light">{vibe.sub}</p>
                  </div>
                ))}
              </div>
              <button 
                onClick={() => transitionTo(2)}
                className="text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text)] transition-colors"
              >
                ← Back
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <footer className="mt-12 space-y-6">
          <Button
            fullWidth
            disabled={isNextDisabled}
            onClick={() => {
              if (step < 3) transitionTo((step + 1) as Step)
              else handleFinish()
            }}
          >
            {step === 3 ? 'Finish' : 'Next'}
          </Button>

          <div className="text-center">
            <button 
              onClick={handleSkip}
              className="text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--text)] transition-colors bg-transparent border-none cursor-pointer"
            >
              Skip for now →
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
