'use client';

import React, { useState } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from '../lib/mapLibre';
import { MapPin } from 'lucide-react';
import { mapStyleFor, showPolishLabels } from '../lib/mapStyle';
import { priceText } from '../lib/format';

const MAP_STYLE = mapStyleFor(process.env.NEXT_PUBLIC_MAPTILER_KEY);

/** Single-listing map. Coordinates come from the database; they are set when a listing is saved. */
export default function ListingMap({ listing }) {
  const [showPopup, setShowPopup] = useState(false);

  const lat = Number(listing.lat);
  const lng = Number(listing.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const address = listing.Lokalizacja ? `${listing.Lokalizacja}, ${listing.Miasto}` : listing.Miasto;

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-slate-700 dark:bg-slate-800 md:h-[400px]">
      <Map
        mapLib={maplibregl}
        initialViewState={{ latitude: lat, longitude: lng, zoom: 13 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={MAP_STYLE}
        onLoad={(event) => showPolishLabels(event.target)}
        scrollZoom={false}
      >
        <NavigationControl position="top-right" />
        <Marker
          latitude={lat}
          longitude={lng}
          anchor="bottom"
        >
          <button
            type="button"
            aria-label="Pokaż lokalizację sprzętu"
            aria-expanded={showPopup}
            onClick={(event) => { event.stopPropagation(); setShowPopup((open) => !open); }}
            className="grid size-10 place-items-center rounded-full border-2 border-white bg-amber-400 text-slate-950 shadow-lg hover:bg-amber-300"
          >
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </button>
        </Marker>
        {showPopup && (
          <Popup latitude={lat} longitude={lng} anchor="bottom" offset={[0, -44]} closeOnClick={false} onClose={() => setShowPopup(false)} className="market-map-popup">
            <div className="min-w-[180px] p-2">
              <p className="text-sm font-semibold leading-tight">{listing['Sprzęt']}</p>
              <p className="mt-1 text-sm">{priceText(listing)}</p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">{address}</p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="market-action mt-2 w-full"
              >
                Wyznacz trasę
              </a>
            </div>
          </Popup>
        )}
      </Map>
      <p className="pointer-events-none absolute bottom-2 left-2 max-w-[70%] rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-medium text-slate-900">
        {address}
      </p>
    </div>
  );
}
