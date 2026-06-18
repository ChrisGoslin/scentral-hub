import BottomNav from '../components/BottomNav'
import OnboardingGate from '../onboarding/OnboardingGate'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OnboardingGate />
      <main
        className="flex-1 fade-up main-content-wrapper min-h-[100dvh]"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 72px)' }}
      >
        {children}
      </main>
      <BottomNav />
    </>
  )
}
