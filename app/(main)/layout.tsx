import BottomNav from '../components/BottomNav'
import OnboardingGate from '../onboarding/OnboardingGate'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OnboardingGate />
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </>
  )
}
