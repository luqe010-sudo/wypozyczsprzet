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

export default function MapComponent({ listings, geoCache, searchCenter, radius, onLocationShared }) {
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

  return (
    <div className="relative w-full h-[500px] rounded-3xl overflow-hidden shadow-lg border border-gray-200 bg-gray-50 mb-10">
      <Map
        mapLib={maplibregl}
        {...viewport}
        onMove={evt => setViewport(evt.viewState)}
        style={{ width: '100%', height: '100%' }}
        mapStyle={{
          version: 8,
          sources: {
            'osm-raster': {
              type: 'raster',
              tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
              tileSize: 256,
              attribution: '&copy; OpenStreetMap Contributors',
            },
          },
          layers: [
            {
              id: 'osm-raster-layer',
              type: 'raster',
              source: 'osm-raster',
            },
          ],
        }}
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
              <div className="bg-blue-600 text-white p-2 rounded-full shadow-lg group-hover:scale-110 transition-transform border-2 border-white">
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
            <div className="p-3 max-w-[200px]">
              {popupInfo.Zdjecie && (
                <img src={popupInfo.Zdjecie} alt={popupInfo['Sprzęt']} className="w-full h-24 object-cover rounded-lg mb-2" />
              )}
              <h3 className="font-bold text-sm text-gray-900 leading-tight mb-1">{popupInfo['Sprzęt']}</h3>
              <p className="text-blue-600 font-bold text-sm mb-1">{popupInfo.Cena_od} PLN / {popupInfo.Czas}</p>
              <p className="text-gray-500 text-xs flex items-center gap-1">
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

      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 shadow-md border border-gray-200 z-10">
        Znaleziono {markers.length} lokalizacji
      </div>
    </div>
  );
}
