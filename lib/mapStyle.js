// Light street map, like the ones people know from navigation apps.
const MAPTILER_STYLE = 'https://api.maptiler.com/maps/streets-v2/style.json?key=';

/** Used without a MapTiler key, or when MapTiler rejects it. Raster tiles, so it has no glyphs for map labels. */
export const CARTO_STYLE = {
  version: 8,
  sources: {
    'carto-voyager': {
      type: 'raster',
      tiles: ['a', 'b', 'c', 'd'].map((sub) => `https://${sub}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}@2x.png`),
      tileSize: 256,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    },
  },
  layers: [{ id: 'carto-voyager-layer', type: 'raster', source: 'carto-voyager' }],
};

export function mapStyleFor(key) {
  return key ? `${MAPTILER_STYLE}${encodeURIComponent(key)}` : CARTO_STYLE;
}

const POLISH_NAME = ['coalesce', ['get', 'name:pl'], ['get', 'name']];

/** The MapTiler style labels places in English; switch every place-name label to Polish, falling back to the local name. */
export function showPolishLabels(map) {
  for (const layer of map.getStyle()?.layers || []) {
    if (layer.type !== 'symbol') continue;
    const field = map.getLayoutProperty(layer.id, 'text-field');
    if (field && JSON.stringify(field).includes('name')) map.setLayoutProperty(layer.id, 'text-field', POLISH_NAME);
  }
}
