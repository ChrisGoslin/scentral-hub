import type { MetadataRoute } from 'next'
import { createClient } from '@/utils/supabase/server'

export const revalidate = 86400 // Revalidate daily (24h)

// Dynamic Next.js Sitemap supporting chunked sitemaps for scale
// Next.js supports generateSitemaps to partition large route collections into indexed sitemaps
export async function generateSitemaps() {
  return [
    { id: 0 }, // Core & Static routes
    { id: 1 }, // Dynamic Trails & Ingredients
    { id: 2 }, // Top Discover / Scent Profiles
  ]
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://notalabs.io'

  // 1. Chunk 0: Core Static Routes
  if (id === 0) {
    return [
      {
        url: baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
      {
        url: `${baseUrl}/discover`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/read`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.9,
      },
      {
        url: `${baseUrl}/shelf`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/clones`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.8,
      },
      {
        url: `${baseUrl}/traces`,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 0.7,
      },
      {
        url: `${baseUrl}/learning`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.5,
      },
    ]
  }

  // 2. Chunk 1: Dynamic Trails & Top Ingredient Profiles
  if (id === 1) {
    const dynamicRoutes: MetadataRoute.Sitemap = []
    try {
      const supabase = await createClient()
      const { data: trails } = await supabase
        .from('trails')
        .select('slug, updated_at')
        .eq('published', true)
        .limit(200)

      if (trails && trails.length > 0) {
        trails.forEach((t) => {
          dynamicRoutes.push({
            url: `${baseUrl}/trails/${t.slug}`,
            lastModified: t.updated_at ? new Date(t.updated_at) : new Date(),
            changeFrequency: 'weekly',
            priority: 0.7,
          })
        })
      }
    } catch {
      // Gracefully return partial routes if database access is limited during static compilation
    }
    return dynamicRoutes
  }

  // 3. Chunk 2: Curated Discovery Collections & Scent Families
  const topFamilies = [
    'woody', 'floral', 'oriental', 'fresh', 'citrus', 'gourmand', 'aromatic', 'aquatic'
  ]
  return topFamilies.map((family) => ({
    url: `${baseUrl}/discover?family=${family}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))
}
