'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import MapView, { FullscreenControl, GeolocateControl, Layer, NavigationControl, Popup, Source } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import maplibregl from '../lib/mapLibre';
import { CARTO_STYLE, mapStyleFor, showPolishLabels } from '../lib/mapStyle';
import { offersLabel } from '../lib/format';
import { listingCoordinates } from '../lib/search';
import ListingCard from './ListingCard';

const VIEWPORT = { latitude: 52.1, longitude: 19.3, zoom: 6 };
const SOURCE_ID = 'rental-offers';
const POINTS_LAYER_ID = 'rental-offer-points';
const OFFER_COUNT = ['coalesce', ['get', 'totalOffers'], ['get', 'offers']];

function radiusFeature({ lat, lng }, radius) {
  const lngRadius = radius / (111.32 * Math.cos(lat * Math.PI / 180));
  const latRadius = radius / 110.57;
  const ring = Array.from({ length: 64 }, (_, index) => {
    const angle = index / 64 * 2 * Math.PI;
    return [lng + lngRadius * Math.cos(angle), lat + latRadius * Math.sin(angle)];
  });
  return { type: 'Feature', properties: {}, geometry: { type: 'Polygon', coordinates: [[...ring, ring[0]]] } };
}

function locationsFor(listings) {
  const groups = new Map();
  const byListingId = new Map();
  for (const listing of listings) {
    const point = listingCoordinates(listing);
    if (!point) continue;
    const key = `${point.lat},${point.lng}`;
    const group = groups.get(key) || { key, coordinates: [point.lng, point.lat], listings: [] };
    group.listings.push(listing);
    groups.set(key, group);
    byListingId.set(listing.ID_sprzetu, group);
  }

  const features = [...groups.values()].map((group) => ({
    type: 'Feature',
    properties: { locationId: group.key, offers: group.listings.length },
    geometry: { type: 'Point', coordinates: group.coordinates },
  }));
  return { groups, byListingId, geojson: { type: 'FeatureCollection', features } };
}

export default function MapComponent({ listings, searchCenter, radius, onLocationShared, rentalQuery, selectedId, onSelect }) {
  const mapRef = useRef(null);
  const ready = useRef(false);
  const [fallbackStyle, setFallbackStyle] = useState(false);
  const [failed, setFailed] = useState(false);
  const { groups, byListingId, geojson } = useMemo(() => locationsFor(listings), [listings]);
  const selectedGroup = byListingId.get(selectedId);
  const selected = selectedGroup?.listings.find((listing) => listing.ID_sprzetu === selectedId);
  const mapStyle = useMemo(() => mapStyleFor(fallbackStyle ? null : process.env.NEXT_PUBLIC_MAPTILER_KEY), [fallbackStyle]);
  const circle = useMemo(() => searchCenter && radius ? radiusFeature(searchCenter, radius) : null, [searchCenter, radius]);

  const fitResults = useCallback((map) => {
    const coordinates = circle?.geometry.coordinates[0] || [...groups.values()].map((group) => group.coordinates);
    if (coordinates.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    for (const point of coordinates) bounds.extend(point);
    map.fitBounds(bounds, { padding: 48, maxZoom: 12, duration: 0 });
  }, [circle, groups]);

  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (ready.current && map) fitResults(map);
  }, [fitResults]);

  const selectedPoint = selectedGroup?.coordinates;
  useEffect(() => {
    const map = mapRef.current?.getMap();
    if (map && selectedPoint) map.easeTo({ center: selectedPoint, duration: 300 });
  }, [selectedPoint]);

  const clickPoint = async (event) => {
    const feature = event.features?.[0];
    if (!feature) return;
    if (feature.properties.cluster_id != null) {
      const map = event.target;
      try {
        const zoom = await map.getSource(SOURCE_ID)?.getClusterExpansionZoom(feature.properties.cluster_id);
        if (zoom != null) {
          onSelect(null);
          map.easeTo({ center: feature.geometry.coordinates, zoom });
        }
      } catch {
        // A filter change can remove this cluster while the worker is resolving it.
      }
      return;
    }
    const group = groups.get(feature.properties.locationId);
    if (group) onSelect(group.listings[0].ID_sprzetu);
  };

  if (failed) {
    return <p role="status" className="grid h-full place-items-center p-4 text-center text-sm">Nie udało się uruchomić mapy. Wszystkie wyniki znajdziesz na liście.</p>;
  }

  return (
    <>
      <MapView
        ref={mapRef}
        mapLib={maplibregl}
        initialViewState={VIEWPORT}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle}
        interactiveLayerIds={[POINTS_LAYER_ID]}
        onLoad={(event) => {
          ready.current = true;
          showPolishLabels(event.target);
          fitResults(event.target);
        }}
        onError={(event) => {
          if (!event.target) setFailed(true);
          if (mapStyle !== CARTO_STYLE && [401, 403].includes(event.error?.status)) setFallbackStyle(true);
        }}
        onClick={clickPoint}
        onMouseEnter={(event) => { event.target.getCanvas().style.cursor = 'pointer'; }}
        onMouseLeave={(event) => { event.target.getCanvas().style.cursor = ''; }}
        scrollZoom={false}
      >
        <NavigationControl position="top-right" />
        <FullscreenControl position="top-right" />
        <GeolocateControl
          position="top-right"
          onGeolocate={(event) => onLocationShared?.({ lat: event.coords.latitude, lng: event.coords.longitude })}
        />
        {circle && (
          <Source id="search-radius" type="geojson" data={circle}>
            <Layer id="radius-fill" type="fill" paint={{ 'fill-color': '#fbbf24', 'fill-opacity': 0.12 }} />
            <Layer id="radius-outline" type="line" paint={{ 'line-color': '#fbbf24', 'line-width': 2, 'line-dasharray': [2, 2] }} />
          </Source>
        )}
        <Source id={SOURCE_ID} type="geojson" data={geojson} cluster clusterRadius={45} clusterMaxZoom={14} clusterProperties={{ totalOffers: ['+', ['get', 'offers']] }}>
          <Layer
            id={POINTS_LAYER_ID}
            type="circle"
            paint={{
              'circle-radius': ['step', OFFER_COUNT, 10, 2, 17, 10, 20, 100, 24],
              'circle-color': ['case', ['==', ['get', 'locationId'], selectedGroup?.key || ''], '#ffffff', '#fbbf24'],
              'circle-stroke-color': '#172033',
              'circle-stroke-width': 2,
            }}
          />
          <Layer
            id="rental-offer-count"
            type="symbol"
            filter={['>', OFFER_COUNT, 1]}
            layout={{
              'text-field': ['to-string', OFFER_COUNT],
              'text-font': mapStyle === CARTO_STYLE ? ['sans-serif'] : ['Noto Sans Regular'],
              'text-size': 13,
              'text-allow-overlap': true,
            }}
            paint={{ 'text-color': '#172033' }}
          />
        </Source>
        {selected && (
          <Popup
            longitude={selectedGroup.coordinates[0]}
            latitude={selectedGroup.coordinates[1]}
            anchor="bottom"
            offset={18}
            maxWidth="min(16rem, 80vw)"
            closeOnClick={false}
            onClose={() => onSelect(null)}
            className="market-map-popup"
          >
            <div className="w-56 pt-5">
              {selectedGroup.listings.length > 1 && (
                <label className="mb-2 block text-xs font-semibold">
                  {offersLabel(selectedGroup.listings.length)} w tym miejscu
                  <select value={selectedId} onChange={(event) => onSelect(event.target.value)} className="mt-1 min-h-10 w-full rounded-lg border border-border bg-card px-2 text-sm">
                    {selectedGroup.listings.map((listing) => <option value={listing.ID_sprzetu} key={listing.ID_sprzetu}>{listing['Sprzęt']}</option>)}
                  </select>
                </label>
              )}
              <ListingCard listing={selected} layout="compact" rentalQuery={rentalQuery} />
            </div>
          </Popup>
        )}
      </MapView>
      <p className="pointer-events-none absolute bottom-8 left-2 rounded-md bg-white/95 px-2.5 py-1.5 text-xs font-semibold text-slate-900">
        Na mapie {offersLabel(byListingId.size)}
      </p>
    </>
  );
}
