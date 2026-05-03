import { NextResponse } from 'next/server';

// Simple server-side cache with static fallbacks for major cities
const geocodeCache = new Map([
  ['Wrocław', [{ lat: '51.1079', lon: '17.0385' }]],
  ['Warszawa', [{ lat: '52.2297', lon: '21.0122' }]],
  ['Kraków', [{ lat: '50.0647', lon: '19.9450' }]],
  ['Poznań', [{ lat: '52.4064', lon: '16.9252' }]],
  ['Gdańsk', [{ lat: '54.3520', lon: '18.6466' }]],
  ['Łódź', [{ lat: '51.7592', lon: '19.4560' }]],
  ['Szczecin', [{ lat: '53.4285', lon: '14.5528' }]],
  ['Bydgoszcz', [{ lat: '53.1235', lon: '18.0084' }]],
  ['Lublin', [{ lat: '51.2465', lon: '22.5684' }]],
  ['Białystok', [{ lat: '53.1325', lon: '23.1688' }]],
  ['Katowice', [{ lat: '50.2649', lon: '19.0238' }]],
  ['Gdynia', [{ lat: '54.5189', lon: '18.5305' }]],
  ['Częstochowa', [{ lat: '50.8101', lon: '19.1203' }]],
  ['Radom', [{ lat: '51.4027', lon: '21.1471' }]],
  ['Sosnowiec', [{ lat: '50.2863', lon: '19.1039' }]],
  ['Toruń', [{ lat: '53.0138', lon: '18.5984' }]],
  ['Kielce', [{ lat: '50.8661', lon: '20.6285' }]],
  ['Gliwice', [{ lat: '50.2945', lon: '18.6714' }]],
  ['Zabrze', [{ lat: '50.3081', lon: '18.7912' }]],
  ['Bytom', [{ lat: '50.3481', lon: '18.9328' }]],
  ['Rzeszów', [{ lat: '50.0415', lon: '21.9990' }]],
  ['Olsztyn', [{ lat: '53.7784', lon: '20.4801' }]],
  ['Bielsko-Biała', [{ lat: '49.8225', lon: '19.0468' }]],
]);

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');

  if (!q) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  // Check cache first
  if (geocodeCache.has(q)) {
    console.log('Geocode Cache HIT for:', q);
    return NextResponse.json(geocodeCache.get(q));
  }

  // Fallback for zip codes: "50-001 Wrocław" -> try "Wrocław"
  const zipMatch = q.match(/\d{2}-\d{3}\s+(.+)/);
  if (zipMatch && geocodeCache.has(zipMatch[1])) {
    console.log('Geocode Zip Fallback HIT for:', zipMatch[1]);
    return NextResponse.json(geocodeCache.get(zipMatch[1]));
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&countrycodes=pl&limit=1`,
      {
        headers: {
          'User-Agent': 'WypozyczSprzet/1.0',
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Nominatim error response:', errorText);
      throw new Error(`Nominatim API returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    if (data && data.length > 0) {
      geocodeCache.set(q, data);
    }
    return NextResponse.json(data);
  } catch (error) {
    console.error('Geocoding API error:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
