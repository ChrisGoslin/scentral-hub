import BottomNav from '../components/BottomNav'
import OnboardingGate from '../onboarding/OnboardingGate'
import Footer from '@/components/ui/Footer'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OnboardingGate />
      <main
        className="flex-1 fade-up main-content-wrapper min-h-[100dvh] flex flex-col"
        style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 112px)' }}
      >
        {children}
        <Footer />
      </main>
      <BottomNav />
    </>
  )
}
