import { Metadata } from 'next'
import WheelClient from './WheelClient'

export const metadata: Metadata = {
  title: 'Your Fragrance Wheel | AnotherSense',
  description: 'Analyze the fragrance families in your collection. See your taste profile across 9 scent dimensions.',
}

export const dynamic = 'force-dynamic'

export default function WheelPage() {
  return <WheelClient />
}
