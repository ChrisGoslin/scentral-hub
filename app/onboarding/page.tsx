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

  const [step1Choice, setStep1Choice] = useState<string>('')
  const [step2Choice, setStep2Choice] = useState<string>('')

  // Guard: if already onboarded, skip immediately
  useEffect(() => {
    if (localStorage.getItem('scentral_onboarded') === 'true') {
      router.replace('/discover')
    }
  }, [router])

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
      'Warm & Rich': 'warm',
      'Fresh & Clean': 'fresh',
      'Bold & Lasting': 'bold',
      'Light & Subtle': 'soft',
    }

    localStorage.setItem('scentral_onboarded', 'true')
    localStorage.setItem('scentral_vibe', vibeMap[step1Choice] || 'fresh')
    router.push('/discover')
  }

  const handleSkip = () => {
    localStorage.setItem('scentral_onboarded', 'true')
    router.push('/discover')
  }

  const isNextDisabled =
    (step === 1 && !step1Choice) ||
    (step === 2 && !step2Choice)

  return (
    <div className="min-h-[100dvh] bg-[var(--bg)] text-[var(--text)] flex flex-col items-center">
      <div className="w-full max-w-[480px] px-6 pt-8 pb-10 flex flex-col min-h-[100dvh]">

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
                <h1 className="text-2xl font-serif leading-tight">What draws you to a scent?</h1>
                <p className="text-sm text-[var(--text-muted)] font-light leading-relaxed">
                  We'll tailor your discovery feed to match your sensory identity.
                </p>
              </header>
              <div className="flex flex-wrap gap-3">
                {['Warm & Rich', 'Fresh & Clean', 'Bold & Lasting', 'Light & Subtle'].map((opt) => (
                  <Chip
                    key={opt}
                    selected={step1Choice === opt}
                    onClick={() => setStep1Choice(prev => prev === opt ? '' : opt)}
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
                <h1 className="text-2xl font-serif leading-tight">How would you describe your collection?</h1>
              </header>
              <div className="flex flex-col gap-3">
                {['Just starting (1–5 bottles)', 'Growing (6–15 bottles)', 'Established (16+ bottles)'].map((opt) => (
                  <Chip
                    key={opt}
                    className="justify-start"
                    selected={step2Choice === opt}
                    onClick={() => setStep2Choice(opt)}
                    style={{ minHeight: 44 }}
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
              <header className="space-y-6">
                <h1 className="text-2xl font-serif leading-tight">Your wardrobe is ready.</h1>
                <p className="text-sm text-[var(--text-muted)] font-light leading-relaxed">
                  Tap Discover to explore your personalised catalogue.
                </p>
              </header>
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
            {step === 3 ? 'Go to Discover' : 'Next'}
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
