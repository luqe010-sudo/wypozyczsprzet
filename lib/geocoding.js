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
