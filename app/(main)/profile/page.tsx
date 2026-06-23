import { redirect } from 'next/navigation'

// /profile was a hardcoded mock (fake "Christopher" data, dead toggles).
// The real profile screen is /you — redirect permanently.
export default function ProfilePage() {
  redirect('/you')
}
