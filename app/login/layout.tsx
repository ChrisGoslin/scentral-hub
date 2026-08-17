import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'nota. — Sign In',
  description: 'Sign in to access your digital fragrance cabinet, scent memories, and personal noseprint on nota.',
  openGraph: {
    title: 'nota. — Sign In',
    description: 'Sign in to access your digital fragrance cabinet, scent memories, and personal noseprint on nota.',
  },
}

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
