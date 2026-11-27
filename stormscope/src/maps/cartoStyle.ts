import type { StyleSpecification } from "maplibre-gl";

/**
 * Generate a lightweight latitude/longitude graticule GeoJSON
 * covering the Bay of Bengal & Eastern India region.
 */
function buildGraticuleGeoJSON() {
  const features: GeoJSON.Feature[] = [];

  for (let lng = 76; lng <= 94; lng += 2) {
    features.push({
      type: "Feature",
      properties: { type: "meridian", value: lng },
      geometry: {
        type: "LineString",
        coordinates: [
          [lng, 6],
          [lng, 26],
        ],
      },
    });
  }

  for (let lat = 8; lat <= 24; lat += 2) {
    features.push({
      type: "Feature",
      properties: { type: "parallel", value: lat },
      geometry: {
        type: "LineString",
        coordinates: [
          [76, lat],
          [94, lat],
        ],
      },
    });
  }

  return {
    type: "FeatureCollection" as const,
    features,
  };
}

/**
 * Self-contained cartographic dark-ocean MapLibre style.
 * Accepts pre-loaded GeoJSON layers from Server Components or uses empty collections.
 */
export function createStormScopeMapStyle(
  bayOfBengalLand?: GeoJSON.FeatureCollection,
  odishaGeo?: GeoJSON.FeatureCollection
): StyleSpecification {
  const emptyCollection: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features: [],
  };

  return {
    version: 8,
    name: "StormScope Ocean Cartography",
    sources: {
      "graticule-grid": {
        type: "geojson",
        data: buildGraticuleGeoJSON(),
      },
      "regional-land": {
        type: "geojson",
        data: bayOfBengalLand ?? emptyCollection,
      },
      "odisha-base": {
        type: "geojson",
        data: odishaGeo ?? emptyCollection,
      },
    },
    layers: [
      {
        id: "deep-ocean-bg",
        type: "background",
        paint: {
          "background-color": "#07111D",
        },
      },
      {
        id: "graticule-lines",
        type: "line",
        source: "graticule-grid",
        paint: {
          "line-color": "#132842",
          "line-width": 1,
          "line-opacity": 0.55,
        },
      },
      {
        id: "regional-land-fill",
        type: "fill",
        source: "regional-land",
        paint: {
          "fill-color": "#0C1829",
          "fill-opacity": 0.95,
        },
      },
      {
        id: "regional-coastline",
        type: "line",
        source: "regional-land",
        paint: {
          "line-color": "#1E3A5F",
          "line-width": 1.25,
        },
      },
      {
        id: "odisha-state-fill",
        type: "fill",
        source: "odisha-base",
        paint: {
          "fill-color": "#0F1E33",
          "fill-opacity": 0.9,
        },
      },
      {
        id: "odisha-state-outline",
        type: "line",
        source: "odisha-base",
        paint: {
          "line-color": "#D6C3A5",
          "line-width": 1.5,
          "line-opacity": 0.55,
        },
      },
    ],
  };
}
