"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';
import { FIORD_STYLE } from '../lib/mapStyleConfig';
import { sanitizeAddress } from '../lib/utils';

export default function ListingMap({ listing }) {
  const [coords, setCoords] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const city = listing.Miasto || '';
  const location = listing.Lokalizacja || '';
  const name = listing['Sprzęt'] || 'Sprzęt';
  const price = listing.Cena_od || '';
  const time = listing.Czas || 'doba';

  // Geocode the listing address on mount
  useEffect(() => {
    const geocode = async () => {
      const addr = sanitizeAddress(location, city);
      const cityClean = sanitizeAddress('', city);

      // Try full address first, then city only
      const queries = [addr, cityClean].filter(Boolean);

      for (const q of queries) {
        try {
          const res = await fetch(`/api/geocode?q=${encodeURIComponent(q)}`);
          if (!res.ok) continue;
          const data = await res.json();

          if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
            setCoords({
              lat: parseFloat(data[0].lat),
              lng: parseFloat(data[0].lon),
            });
            setLoading(false);
            return;
          }
        } catch {
          // continue to next query
        }
      }

      // All queries failed
      setError(true);
      setLoading(false);
    };

    geocode();
  }, [location, city]);

  const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  const mapStyle = useMemo(() => {
    if (MAPTILER_KEY) {
      const style = JSON.parse(JSON.stringify(FIORD_STYLE));
      if (style.sources && style.sources.openmaptiles) {
        style.sources.openmaptiles.url = style.sources.openmaptiles.url.replace('{key}', MAPTILER_KEY);
      }
      if (style.glyphs) {
        style.glyphs = style.glyphs.replace('{key}', MAPTILER_KEY);
      }
      return style;
    }

    // Fallback raster tiles
    return {
      version: 8,
      sources: {
        'carto-dark': {
          type: 'raster',
          tiles: [
            'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
            'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
          ],
          tileSize: 256,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        },
      },
      layers: [
        {
          id: 'carto-dark-layer',
          type: 'raster',
          source: 'carto-dark',
        },
      ],
    };
  }, [MAPTILER_KEY]);

  // Don't render map at all if geocoding failed, no address data, or still loading
  if (error || (!city && !location) || loading || !coords) {
    if (loading && (city || location)) {
      return (
        <section className="mb-12">
          <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b-4 border-blue-600 pb-2 inline-block">
            📍 Lokalizacja
          </h2>
          <div className="relative w-full h-[350px] md:h-[450px] rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-700 bg-slate-800 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm font-bold text-gray-300">Ładowanie mapy...</span>
            </div>
          </div>
        </section>
      );
    }
    return null;
  }

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-black text-gray-900 dark:text-white mb-6 border-b-4 border-blue-600 pb-2 inline-block">
        📍 Lokalizacja
      </h2>

      <div className="relative w-full h-[350px] md:h-[450px] rounded-3xl overflow-hidden shadow-lg border border-gray-100 dark:border-slate-700 bg-slate-800">
        <Map
          mapLib={maplibregl}
          initialViewState={{
            latitude: coords.lat,
            longitude: coords.lng,
            zoom: 14,
          }}
          style={{ width: '100%', height: '100%' }}
          mapStyle={mapStyle}
          interactive={true}
          scrollZoom={false}
        >
          <NavigationControl position="top-right" />

          {coords && (
            <Marker
              latitude={coords.lat}
              longitude={coords.lng}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setShowPopup(prev => !prev);
              }}
            >
              <div className="relative group cursor-pointer">
                {/* Pulsating ring behind the pin */}
                <div className="absolute -inset-3 bg-blue-500/20 rounded-full animate-ping" />
                <div className="absolute -inset-2 bg-blue-500/10 rounded-full animate-pulse" />

                {/* Pin */}
                <div className="relative bg-blue-600 text-white p-2.5 rounded-full shadow-xl border-3 border-white dark:border-slate-800 z-10">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
            </Marker>
          )}

          {coords && showPopup && (
            <Popup
              latitude={coords.lat}
              longitude={coords.lng}
              anchor="bottom"
              offset={[0, -45]}
              closeButton={true}
              closeOnClick={false}
              onClose={() => setShowPopup(false)}
              className="listing-map-popup"
            >
              <div className="p-3 min-w-[180px]">
                <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1">{name}</h3>
                <p className="text-blue-600 font-black text-sm mb-1">{price} PLN / {time}</p>
                <p className="text-gray-500 text-xs mb-3 flex items-center gap-1">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  {location ? `${location}, ${city}` : city}
                </p>
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${coords.lat},${coords.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2.5 px-4 rounded-lg transition-colors no-underline shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  Nawiguj do tego miejsca
                </a>
              </div>
            </Popup>
          )}
        </Map>

        {/* Address label overlay */}
        {(location || city) && (
          <div className="absolute bottom-4 left-4 right-4 md:left-4 md:right-auto z-10">
            <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm px-4 py-2.5 rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 flex items-center gap-2">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {location ? `${location}, ${city}` : city}
              </span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
