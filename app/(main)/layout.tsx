import BottomNav from '../components/BottomNav'

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <main className="flex-1 pb-20">{children}</main>
      <BottomNav />
    </>
  )
}
