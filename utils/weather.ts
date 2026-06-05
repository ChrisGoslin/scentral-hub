// utils/weather.ts
// Open-Meteo weather telemetry — no API key required
// Used by AURA to contextualise layering recommendations

export type WeatherData = {
  temp_c: number
  humidity: number
  condition: 'hot' | 'warm' | 'temperate' | 'cool' | 'cold'
  humid: boolean
  city?: string
}

export type GeoPosition = {
  latitude: number
  longitude: number
}

export async function getCurrentWeather(pos: GeoPosition): Promise<WeatherData | null> {
  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${pos.latitude}&longitude=${pos.longitude}&current=temperature_2m,relative_humidity_2m&timezone=auto`
    const res = await fetch(url, { next: { revalidate: 1800 } }) // cache 30 min
    if (!res.ok) return null

    const data = await res.json()
    const temp_c: number = data.current.temperature_2m
    const humidity: number = data.current.relative_humidity_2m

    const condition =
      temp_c >= 28 ? 'hot'
      : temp_c >= 20 ? 'warm'
      : temp_c >= 12 ? 'temperate'
      : temp_c >= 5  ? 'cool'
      : 'cold'

    return {
      temp_c,
      humidity,
      condition,
      humid: humidity > 70,
    }
  } catch {
    return null
  }
}

export async function getUserPosition(): Promise<GeoPosition | null> {
  return new Promise(resolve => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      resolve(null)
      return
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000 }
    )
  })
}

// AURA weather label for UI display
export function weatherLabel(w: WeatherData): string {
  const parts: string[] = []
  parts.push(`${Math.round(w.temp_c)}°C`)
  if (w.humid) parts.push('Humid')
  parts.push(w.condition.charAt(0).toUpperCase() + w.condition.slice(1))
  return parts.join(' · ')
}
