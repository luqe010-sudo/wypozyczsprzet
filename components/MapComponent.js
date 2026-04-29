"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from 'maplibre-gl';

// Default center (Poland)
const DEFAULT_VIEWPORT = {
  latitude: 52.0689,
  longitude: 19.4797,
  zoom: 5
};

import { Source, Layer } from 'react-map-gl/maplibre';

// Helper to create a circle GeoJSON
function createCircle(center, radiusInKm) {
  const coords = {
    latitude: center.lat,
    longitude: center.lng
  };
  const km = radiusInKm;
  const ret = [];
  const distanceX = km / (111.32 * Math.cos(coords.latitude * Math.PI / 180));
  const distanceY = km / 110.57;

  for (let i = 0; i < 64; i++) {
    const theta = (i / 64) * (2 * Math.PI);
    const x = distanceX * Math.cos(theta);
    const y = distanceY * Math.sin(theta);
    ret.push([coords.longitude + x, coords.latitude + y]);
  }
  ret.push(ret[0]);

  return {
    type: 'Feature',
    geometry: {
      type: 'Polygon',
      coordinates: [ret]
    }
  };
}

export default function MapComponent({ listings, geoCache, searchCenter, radius, onLocationShared, isCompact = false }) {
  const [isDark, setIsDark] = useState(false);

  // Detect theme changes
  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'));

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          setIsDark(document.documentElement.classList.contains('dark'));
        }
      });
    });

    observer.observe(document.documentElement, { attributes: true });
    return () => observer.disconnect();
  }, []);

  const [viewport, setViewport] = useState(DEFAULT_VIEWPORT);
  const [popupInfo, setPopupInfo] = useState(null);

  // Auto-zoom to search center when it changes
  useEffect(() => {
    if (searchCenter) {
      setViewport(prev => ({
        ...prev,
        latitude: searchCenter.lat,
        longitude: searchCenter.lng,
        zoom: radius > 50 ? 8 : 10,
        transitionDuration: 1000
      }));
    }
  }, [searchCenter, radius]);

  const markers = useMemo(() => {
    return listings.map((item, index) => {
      const city = item.Miasto || '';
      const loc = item.Lokalizacja || '';
      const addr = loc && !loc.toLowerCase().includes(city.toLowerCase()) ? `${loc} ${city}`.trim() : (loc || city).trim();
      
      const coords = geoCache[addr] || geoCache[city];
      if (coords) {
        // Use smaller jitter for specific address, larger for city fallback
        const isExact = !!geoCache[addr];
        const jitter = isExact ? 0.001 : 0.01;
        return {
          ...item,
          id: item.ID_sprzetu || index,
          latitude: coords.lat + (Math.random() - 0.5) * jitter,
          longitude: coords.lng + (Math.random() - 0.5) * jitter
        };
      }
      return null;
    }).filter(Boolean);
  }, [listings, geoCache]);

  const circleGeoJSON = useMemo(() => {
    if (!searchCenter || !radius) return null;
    return createCircle(searchCenter, radius);
  }, [searchCenter, radius]);


  const MAPTILER_KEY = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  const mapStyle = useMemo(() => {
    if (isDark) {
      if (MAPTILER_KEY) {
        return `https://api.maptiler.com/maps/darkmatter/style.json?key=${MAPTILER_KEY}`;
      }
      return {
        version: 8,
        sources: {
          'carto-dark': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png'
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
    } else {
      if (MAPTILER_KEY) {
        return `https://api.maptiler.com/maps/streets-v2/style.json?key=${MAPTILER_KEY}`;
      }
      return {
        version: 8,
        sources: {
          'carto-voyager': {
            type: 'raster',
            tiles: [
              'https://a.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://b.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://c.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png',
              'https://d.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png'
            ],
            tileSize: 256,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
          },
        },
        layers: [
          {
            id: 'carto-voyager-layer',
            type: 'raster',
            source: 'carto-voyager',
          },
        ],
      };
    }
  }, [isDark, MAPTILER_KEY]);

  return (
    <div className={`relative w-full ${isCompact ? 'h-full' : 'h-[400px] md:h-[500px] mb-10'} rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 transition-all`}>
      <Map
        mapLib={maplibregl}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <GeolocateControl 
          position="top-right" 
          positionOptions={{ enableHighAccuracy: true }}
          trackUserLocation={true}
          onGeolocate={(e) => {
            if (onLocationShared) {
              onLocationShared({ lat: e.coords.latitude, lng: e.coords.longitude });
            }
          }}
        />

        {circleGeoJSON && (
          <Source type="geojson" data={circleGeoJSON}>
            <Layer
              id="radius-fill"
              type="fill"
              paint={{
                'fill-color': '#3b82f6',
                'fill-opacity': 0.1
              }}
            />
            <Layer
              id="radius-outline"
              type="line"
              paint={{
                'line-color': '#3b82f6',
                'line-width': 2,
                'line-dasharray': [2, 2]
              }}
            />
          </Source>
        )}

        {markers.map((marker) => (
          <Marker
            key={marker.id}
            latitude={marker.latitude}
            longitude={marker.longitude}
            anchor="bottom"
            onClick={e => {
              e.originalEvent.stopPropagation();
              setPopupInfo(marker);
            }}
          >
            <div className="cursor-pointer group">
              <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform border-2 border-white dark:border-slate-800">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
          </Marker>
        ))}

        {popupInfo && (
          <Popup
            anchor="top"
            latitude={popupInfo.latitude}
            longitude={popupInfo.longitude}
            onClose={() => setPopupInfo(null)}
            closeButton={false}
            className="z-50"
          >
            <div className="p-3 max-w-[200px] dark:bg-slate-800 rounded-lg">
              {popupInfo.Zdjecie && (
                <img src={popupInfo.Zdjecie} alt={popupInfo['Sprzęt']} className="w-full h-24 object-cover rounded-lg mb-2" />
              )}
              <h3 className="font-bold text-sm text-gray-900 dark:text-white leading-tight mb-1">{popupInfo['Sprzęt']}</h3>
              <p className="text-blue-600 dark:text-blue-400 font-bold text-sm mb-1">{popupInfo.Cena_od} PLN / {popupInfo.Czas}</p>
              <p className="text-gray-500 dark:text-gray-400 text-xs flex items-center gap-1">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                {popupInfo.Miasto}
              </p>
              <a 
                href={`/oferta/${popupInfo.slug}`}
                className="mt-2 block text-center bg-blue-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-blue-700 transition-colors no-underline"
              >
                Szczegóły
              </a>
            </div>
          </Popup>
        )}
      </Map>

      <div className="absolute bottom-4 left-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-700 dark:text-gray-300 shadow-md border border-gray-200 dark:border-slate-700 z-10">
        Oferty: {markers.length}
      </div>
    </div>
  );
}
