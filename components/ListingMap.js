'use client';

import React, { useMemo, useState } from 'react';
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import * as maplibregl from 'maplibre-gl';
import { MapPin } from 'lucide-react';
import { FIORD_STYLE } from '../lib/mapStyleConfig';
import { priceText } from '../lib/format';

function buildStyle() {
  const key = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  if (key) {
    const style = JSON.parse(JSON.stringify(FIORD_STYLE));
    if (style.sources?.openmaptiles) {
      style.sources.openmaptiles.url = style.sources.openmaptiles.url.replace('{key}', key);
    }
    if (style.glyphs) style.glyphs = style.glyphs.replace('{key}', key);
    return style;
  }
  return {
    version: 8,
    sources: {
      'carto-dark': {
        type: 'raster',
        tiles: ['a', 'b', 'c', 'd'].map((sub) => `https://${sub}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png`),
        tileSize: 256,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      },
    },
    layers: [{ id: 'carto-dark-layer', type: 'raster', source: 'carto-dark' }],
  };
}

/** Single-listing map. Coordinates come from the database; they are set when a listing is saved. */
export default function ListingMap({ listing }) {
  const [showPopup, setShowPopup] = useState(false);
  const mapStyle = useMemo(() => buildStyle(), []);

  const lat = Number(listing.lat);
  const lng = Number(listing.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;

  const address = listing.Lokalizacja ? `${listing.Lokalizacja}, ${listing.Miasto}` : listing.Miasto;

  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-800 dark:border-slate-700 md:h-[400px]">
      <Map
        mapLib={maplibregl}
        initialViewState={{ latitude: lat, longitude: lng, zoom: 13 }}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        scrollZoom={false}
      >
        <NavigationControl position="top-right" />
        <Marker
          latitude={lat}
          longitude={lng}
          anchor="bottom"
          onClick={(event) => {
            event.originalEvent.stopPropagation();
            setShowPopup((open) => !open);
          }}
        >
          <div className="cursor-pointer rounded-full border-2 border-white bg-brand-600 p-2 text-white shadow-lg">
            <MapPin className="h-5 w-5" aria-hidden="true" />
          </div>
        </Marker>
        {showPopup && (
          <Popup latitude={lat} longitude={lng} anchor="bottom" offset={[0, -44]} closeOnClick={false} onClose={() => setShowPopup(false)}>
            <div className="min-w-[180px] p-2 text-slate-900">
              <p className="text-sm font-semibold leading-tight">{listing['Sprzęt']}</p>
              <p className="mt-1 text-sm">{priceText(listing)}</p>
              <p className="mt-1 text-xs text-slate-600">{address}</p>
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 block rounded-md bg-brand-600 py-2 text-center text-xs font-semibold text-white"
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
