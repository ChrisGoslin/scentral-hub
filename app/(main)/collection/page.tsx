import { Metadata } from 'next'
import CollectionClientWrapper from './CollectionClientWrapper'

export const metadata: Metadata = {
  title: 'My Bottles | AnotherSense',
  description: 'Your personal fragrance wardrobe. Track your collection, manage bottle levels, and organize your scents on virtual walnut shelves.',
}

export const dynamic = 'force-dynamic'

export default function CollectionPage() {
  return <CollectionClientWrapper />
}
