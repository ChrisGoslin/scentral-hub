import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 🛰️  Scentral Architect: Demo Telemetry Overlay
 * Dynamically adjusts experience based on geo-context for high-impact demos.
 */

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  
  // Extract geo-data from Vercel headers (simulated for local)
  const country = request.headers.get('x-vercel-ip-country') || 'US';
  const city = request.headers.get('x-vercel-ip-city') || 'New York';

  // Logic: Inject geo-context into search params for client-side personalization
  url.searchParams.set('demo_geo', `${city}, ${country}`);
  
  // Predictive Scent Engine: Weather-based recommendation logic
  // In a production environment, this would call a real-time weather API.
  // For this implementation, we simulate weather data based on city/region or a mock provider.
  const mockWeatherStates = ['Clear', 'Rain', 'Snow', 'Cloudy'];
  const weather = mockWeatherStates[Math.floor(Math.random() * mockWeatherStates.length)];
  
  const weatherScentMap: Record<string, string> = {
    'Rain': 'Wet Earth & Petrichor',
    'Clear': 'Solar Citrus & White Linen',
    'Snow': 'Frosted Pine & Crisp Mint',
    'Cloudy': 'Velvet Saffron & Grey Tea'
  };

  const recommendedScent = weatherScentMap[weather] || 'Scentral Signature Blend';
  url.searchParams.set('weather_scent', recommendedScent);
  url.searchParams.set('current_weather', weather);

  // Adaptive Personalization: Swap "Featured Note" based on region
  const regionalNoteMap: Record<string, string> = {
    'AE': 'Royal Oud & Taif Rose',
    'SA': 'Golden Amber',
    'FR': 'Grasse Jasmine',
    'IT': 'Calabrian Bergamot',
    'TH': 'Lemongrass & Ginger',
    'US': 'Modern Sandalwood'
  };

  const featuredNote = regionalNoteMap[country] || 'Scentral Signature Blend';
  url.searchParams.set('featured_note', featuredNote);

  return NextResponse.rewrite(url);
}

export const config = {
  matcher: '/',
};
