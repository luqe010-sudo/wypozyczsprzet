import * as maplibregl from 'maplibre-gl';

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl(new URL('maplibre-gl/dist/maplibre-gl-worker.mjs', import.meta.url).href);
}

export default maplibregl;
