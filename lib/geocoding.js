import { listingCoordinates, normalizeSearchText } from './search.js';

export async function geocodeAddress(address) {
  const maptilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!maptilerKey) {
    console.warn('Geocoding: NEXT_PUBLIC_MAPTILER_KEY is missing');
    return null;
  }

  try {
    const query = encodeURIComponent(address);
    const url = `https://api.maptiler.com/geocoding/${query}.json?key=${maptilerKey}&language=pl&limit=1`;
    
    const response = await fetch(url);
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    
    if (data.features && data.features.length > 0) {
      const [lng, lat] = data.features[0].center;
      return { lat, lng };
    }
    
    return null;
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

/** Resolve a complete locality name in Poland. Leave ambiguous names to city-only search. */
export async function geocodeSearchCity(city) {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (!key || !/^[\p{L}][\p{L}\p{M} .’-]{1,79}$/u.test(city)) return null;

  const url = new URL(`https://api.maptiler.com/geocoding/${encodeURIComponent(city.toLowerCase())}.json`);
  url.search = new URLSearchParams({
    key, language: 'pl', country: 'pl', types: 'municipality,locality,place', autocomplete: 'false', limit: '5',
  }).toString();

  try {
    const response = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(3000) });
    if (!response.ok) return null;
    const { features } = await response.json();
    const name = normalizeSearchText(city);
    const exact = (features || []).filter((feature) => [feature.text, feature.matching_text]
      .some((text) => normalizeSearchText(text) === name));
    if (exact.length !== 1) return null;
    const [lng, lat] = exact[0].center || [];
    return listingCoordinates({ lat, lng });
  } catch {
    return null;
  }
}
