import * as maplibregl from "maplibre-gl";
import type { CycloneEvent, HazardLevel } from "@/types";
import { colors } from "@/lib/constants";

/** Hazard level expression for MapLibre match expressions */
const HAZARD_COLOR_MATCH: maplibregl.ExpressionSpecification = [
  "match",
  ["get", "hazardCategory"],
  "Extreme",
  colors.hazard.extreme,
  "High",
  colors.hazard.high,
  "Moderate",
  colors.hazard.moderate,
  "Low",
  colors.hazard.low,
  colors.horizonBlue,
];

/** Flood susceptibility color match expression */
const FLOOD_COLOR_MATCH: maplibregl.ExpressionSpecification = [
  "match",
  ["get", "floodLevel"],
  "High",
  "#0EA5E9",
  "Moderate",
  colors.monsoonTeal,
  colors.horizonBlue,
];

/** SRTM DEM elevation color match expression */
const DEM_COLOR_MATCH: maplibregl.ExpressionSpecification = [
  "match",
  ["get", "surgeExposure"],
  "High",
  "#2DD4BF",
  "Moderate",
  "#D6C3A5",
  "Low",
  "#64748B",
  "#94A3B8",
];

/** Build a GeoJSON FeatureCollection for a cyclone track (LineString + Point nodes) */
export function buildCycloneTrackGeoJSON(cyclone: CycloneEvent) {
  const lineFeature: GeoJSON.Feature<GeoJSON.LineString> = {
    type: "Feature",
    properties: {
      id: cyclone.id,
      name: cyclone.name,
    },
    geometry: {
      type: "LineString",
      coordinates: cyclone.track.map((pt) => [pt.lng, pt.lat]),
    },
  };

  const pointFeatures: GeoJSON.Feature<GeoJSON.Point>[] = cyclone.track.map(
    (pt, idx) => ({
      type: "Feature",
      properties: {
        index: idx,
        timestamp: pt.timestamp,
        windSpeed: pt.windSpeed,
        pressure: pt.pressure,
        category: pt.category,
        isLandfall:
          pt.category.toLowerCase().includes("landfall") ||
          (cyclone.id === "fani" && pt.lat === 19.8 && pt.lng === 85.8),
        isPeak: pt.windSpeed === cyclone.maxWindSpeed,
      },
      geometry: {
        type: "Point",
        coordinates: [pt.lng, pt.lat],
      },
    })
  );

  return {
    line: {
      type: "FeatureCollection" as const,
      features: [lineFeature],
    },
    points: {
      type: "FeatureCollection" as const,
      features: pointFeatures,
    },
  };
}

export interface HoveredDistrictInfo {
  id: string;
  name: string;
  exposureIndex: number;
  hazardCategory: HazardLevel;
  elevationTier?: string;
}

/** Add district boundary fill, outline, hover highlight, and selection highlight layers */
export function addDistrictLayers(
  map: maplibregl.Map,
  districtsGeo: GeoJSON.FeatureCollection,
  options?: {
    selectedDistrictId?: string | null;
    hazardFilter?: HazardLevel | "All";
    onDistrictHover?: (info: HoveredDistrictInfo | null) => void;
    onDistrictClick?: (
      districtId: string,
      name: string,
      exposureIndex: number,
      hazardCategory: string,
      lngLat: maplibregl.LngLat
    ) => void;
  }
) {
  if (!map.getSource("districts-source")) {
    map.addSource("districts-source", {
      type: "geojson",
      data: districtsGeo,
    });
  }

  if (!map.getLayer("districts-fill")) {
    map.addLayer({
      id: "districts-fill",
      type: "fill",
      source: "districts-source",
      paint: {
        "fill-color": HAZARD_COLOR_MATCH,
        "fill-opacity": 0.24,
      },
    });
  }

  if (!map.getLayer("districts-outline")) {
    map.addLayer({
      id: "districts-outline",
      type: "line",
      source: "districts-source",
      paint: {
        "line-color": colors.horizonBlue,
        "line-width": 1.1,
        "line-opacity": 0.48,
      },
    });
  }

  if (!map.getLayer("districts-hover")) {
    map.addLayer({
      id: "districts-hover",
      type: "line",
      source: "districts-source",
      filter: ["==", ["get", "id"], ""],
      paint: {
        "line-color": colors.monsoonTeal,
        "line-width": 2,
        "line-opacity": 0.9,
      },
    });
  }

  if (!map.getLayer("districts-highlight")) {
    map.addLayer({
      id: "districts-highlight",
      type: "line",
      source: "districts-source",
      filter: ["==", ["get", "id"], options?.selectedDistrictId ?? ""],
      paint: {
        "line-color": colors.cloudWhite,
        "line-width": 2.5,
      },
    });
  }

  if (options?.onDistrictClick || options?.onDistrictHover) {
    map.on("mousemove", "districts-fill", (e) => {
      map.getCanvas().style.cursor = "pointer";
      const feature = e.features?.[0];
      if (!feature?.properties) return;

      const hoveredId = String(feature.properties.id);
      if (map.getLayer("districts-hover")) {
        map.setFilter("districts-hover", ["==", ["get", "id"], hoveredId]);
      }

      options.onDistrictHover?.({
        id: hoveredId,
        name: String(feature.properties.name),
        exposureIndex: Number(feature.properties.exposureIndex),
        hazardCategory: String(feature.properties.hazardCategory) as HazardLevel,
        elevationTier: feature.properties.elevationTier
          ? String(feature.properties.elevationTier)
          : undefined,
      });
    });

    map.on("mouseleave", "districts-fill", () => {
      map.getCanvas().style.cursor = "";
      if (map.getLayer("districts-hover")) {
        map.setFilter("districts-hover", ["==", ["get", "id"], ""]);
      }
      options.onDistrictHover?.(null);
    });
  }

  if (options?.onDistrictClick) {
    map.on("click", "districts-fill", (e) => {
      const feature = e.features?.[0];
      if (!feature?.properties) return;
      options.onDistrictClick?.(
        String(feature.properties.id),
        String(feature.properties.name),
        Number(feature.properties.exposureIndex),
        String(feature.properties.hazardCategory),
        e.lngLat
      );
    });
  }
}

/** Update district GeoJSON data dynamically for scenario switching (Phase 4) */
export function updateDistrictLayerData(
  map: maplibregl.Map,
  districtsGeo: GeoJSON.FeatureCollection
) {
  const src = map.getSource("districts-source") as
    | maplibregl.GeoJSONSource
    | undefined;
  src?.setData(districtsGeo);
}

/** Add estimated wind/cyclone hazard zone polygons */
export function addHazardZoneLayers(
  map: maplibregl.Map,
  hazardZonesGeo: GeoJSON.FeatureCollection
) {
  if (!map.getSource("hazard-zones-source")) {
    map.addSource("hazard-zones-source", {
      type: "geojson",
      data: hazardZonesGeo,
    });
  }

  if (!map.getLayer("hazard-zones-fill")) {
    map.addLayer({
      id: "hazard-zones-fill",
      type: "fill",
      source: "hazard-zones-source",
      paint: {
        "fill-color": HAZARD_COLOR_MATCH,
        "fill-opacity": 0.16,
      },
    });
  }

  if (!map.getLayer("hazard-zones-outline")) {
    map.addLayer({
      id: "hazard-zones-outline",
      type: "line",
      source: "hazard-zones-source",
      paint: {
        "line-color": HAZARD_COLOR_MATCH,
        "line-width": 1.1,
        "line-dasharray": [3, 2],
        "line-opacity": 0.65,
      },
    });
  }
}

/** Add coastal storm surge & flood susceptibility polygons */
export function addFloodZoneLayers(
  map: maplibregl.Map,
  floodZonesGeo: GeoJSON.FeatureCollection
) {
  if (!map.getSource("flood-zones-source")) {
    map.addSource("flood-zones-source", {
      type: "geojson",
      data: floodZonesGeo,
    });
  }

  if (!map.getLayer("flood-zones-fill")) {
    map.addLayer({
      id: "flood-zones-fill",
      type: "fill",
      source: "flood-zones-source",
      paint: {
        "fill-color": FLOOD_COLOR_MATCH,
        "fill-opacity": 0.22,
      },
    });
  }

  if (!map.getLayer("flood-zones-outline")) {
    map.addLayer({
      id: "flood-zones-outline",
      type: "line",
      source: "flood-zones-source",
      paint: {
        "line-color": "#38BDF8",
        "line-width": 1.25,
        "line-dasharray": [2, 2],
        "line-opacity": 0.75,
      },
    });
  }
}

/** Add SRTM DEM elevation bands layer (Phase 3) */
export function addElevationLayers(
  map: maplibregl.Map,
  demGeo: GeoJSON.FeatureCollection,
  visible = false
) {
  if (!map.getSource("dem-elevation-source")) {
    map.addSource("dem-elevation-source", {
      type: "geojson",
      data: demGeo,
    });
  }

  if (!map.getLayer("dem-elevation-fill")) {
    map.addLayer({
      id: "dem-elevation-fill",
      type: "fill",
      source: "dem-elevation-source",
      layout: { visibility: visible ? "visible" : "none" },
      paint: {
        "fill-color": DEM_COLOR_MATCH,
        "fill-opacity": 0.2,
      },
    });
  }

  if (!map.getLayer("dem-elevation-outline")) {
    map.addLayer({
      id: "dem-elevation-outline",
      type: "line",
      source: "dem-elevation-source",
      layout: { visibility: visible ? "visible" : "none" },
      paint: {
        "line-color": colors.terrainSand,
        "line-width": 1,
        "line-opacity": 0.55,
      },
    });
  }
}

/** Add GPM/IMD precipitation bands layer (Phase 3) */
export function addRainfallLayers(
  map: maplibregl.Map,
  rainfallGeo: GeoJSON.FeatureCollection,
  visible = false
) {
  if (!map.getSource("rainfall-source")) {
    map.addSource("rainfall-source", {
      type: "geojson",
      data: rainfallGeo,
    });
  }

  if (!map.getLayer("rainfall-fill")) {
    map.addLayer({
      id: "rainfall-fill",
      type: "fill",
      source: "rainfall-source",
      layout: { visibility: visible ? "visible" : "none" },
      paint: {
        "fill-color": [
          "match",
          ["get", "severity"],
          "Extreme",
          "#0284C7",
          "High",
          "#38BDF8",
          "#7DD3FC",
        ],
        "fill-opacity": 0.22,
      },
    });
  }

  if (!map.getLayer("rainfall-outline")) {
    map.addLayer({
      id: "rainfall-outline",
      type: "line",
      source: "rainfall-source",
      layout: { visibility: visible ? "visible" : "none" },
      paint: {
        "line-color": "#38BDF8",
        "line-width": 1.2,
        "line-opacity": 0.65,
      },
    });
  }
}

/** Add cyclone track trajectory and node markers */
export function addCycloneTrackLayers(
  map: maplibregl.Map,
  cyclone: CycloneEvent,
  options?: {
    onTrackPointClick?: (props: {
      timestamp: string;
      windSpeed: number;
      pressure: number;
      category: string;
      lngLat: maplibregl.LngLat;
    }) => void;
  }
) {
  const { line, points } = buildCycloneTrackGeoJSON(cyclone);

  if (!map.getSource("cyclone-line-source")) {
    map.addSource("cyclone-line-source", {
      type: "geojson",
      data: line,
    });
  }

  if (!map.getSource("cyclone-points-source")) {
    map.addSource("cyclone-points-source", {
      type: "geojson",
      data: points,
    });
  }

  if (!map.getLayer("cyclone-track-glow")) {
    map.addLayer({
      id: "cyclone-track-glow",
      type: "line",
      source: "cyclone-line-source",
      paint: {
        "line-color": colors.horizonBlue,
        "line-width": 8,
        "line-opacity": 0.18,
      },
    });
  }

  if (!map.getLayer("cyclone-track-line")) {
    map.addLayer({
      id: "cyclone-track-line",
      type: "line",
      source: "cyclone-line-source",
      paint: {
        "line-color": colors.horizonBlue,
        "line-width": 2.5,
        "line-dasharray": [2, 1],
      },
    });
  }

  if (!map.getLayer("cyclone-track-points")) {
    map.addLayer({
      id: "cyclone-track-points",
      type: "circle",
      source: "cyclone-points-source",
      paint: {
        "circle-radius": [
          "case",
          ["boolean", ["get", "isLandfall"], false],
          7,
          ["boolean", ["get", "isPeak"], false],
          6,
          4,
        ],
        "circle-color": [
          "case",
          ["boolean", ["get", "isLandfall"], false],
          colors.hazard.high,
          ["boolean", ["get", "isPeak"], false],
          colors.hazard.moderate,
          colors.monsoonTeal,
        ],
        "circle-stroke-width": 1.5,
        "circle-stroke-color": colors.deepOcean,
      },
    });
  }

  if (options?.onTrackPointClick) {
    map.on("mouseenter", "cyclone-track-points", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "cyclone-track-points", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("click", "cyclone-track-points", (e) => {
      const feature = e.features?.[0];
      if (!feature?.properties) return;
      options.onTrackPointClick?.({
        timestamp: String(feature.properties.timestamp),
        windSpeed: Number(feature.properties.windSpeed),
        pressure: Number(feature.properties.pressure),
        category: String(feature.properties.category),
        lngLat: e.lngLat,
      });
    });
  }
}

/** Update cyclone track GeoJSON source dynamically when user switches cyclones */
export function updateCycloneTrackData(
  map: maplibregl.Map,
  cyclone: CycloneEvent
) {
  const { line, points } = buildCycloneTrackGeoJSON(cyclone);
  const lineSrc = map.getSource("cyclone-line-source") as
    | maplibregl.GeoJSONSource
    | undefined;
  const ptsSrc = map.getSource("cyclone-points-source") as
    | maplibregl.GeoJSONSource
    | undefined;
  lineSrc?.setData(line);
  ptsSrc?.setData(points);
}

/** Render custom user-ingested GeoJSON overlays from Phase 3 Data Pipeline */
export function upsertCustomOverlayLayer(
  map: maplibregl.Map,
  overlayId: string,
  data: GeoJSON.FeatureCollection,
  color = "#2DD4BF",
  visible = true
) {
  const sourceId = `custom-src-${overlayId}`;
  const existing = map.getSource(sourceId) as
    | maplibregl.GeoJSONSource
    | undefined;

  if (existing) {
    existing.setData(data);
    setLayerGroupVisibility(
      map,
      [`custom-fill-${overlayId}`, `custom-line-${overlayId}`, `custom-pts-${overlayId}`],
      visible
    );
    return;
  }

  map.addSource(sourceId, { type: "geojson", data });

  map.addLayer({
    id: `custom-fill-${overlayId}`,
    type: "fill",
    source: sourceId,
    filter: ["in", ["geometry-type"], ["literal", ["Polygon", "MultiPolygon"]]],
    layout: { visibility: visible ? "visible" : "none" },
    paint: {
      "fill-color": color,
      "fill-opacity": 0.25,
    },
  });

  map.addLayer({
    id: `custom-line-${overlayId}`,
    type: "line",
    source: sourceId,
    layout: { visibility: visible ? "visible" : "none" },
    paint: {
      "line-color": color,
      "line-width": 2,
      "line-opacity": 0.85,
    },
  });

  map.addLayer({
    id: `custom-pts-${overlayId}`,
    type: "circle",
    source: sourceId,
    filter: ["in", ["geometry-type"], ["literal", ["Point", "MultiPoint"]]],
    layout: { visibility: visible ? "visible" : "none" },
    paint: {
      "circle-radius": 6,
      "circle-color": color,
      "circle-stroke-width": 1.5,
      "circle-stroke-color": colors.deepOcean,
    },
  });
}

/** Add roads and coastal/inland critical infrastructure layers */
export function addInfrastructureLayers(
  map: maplibregl.Map,
  infrastructureGeo: GeoJSON.FeatureCollection,
  options?: {
    onAssetClick?: (props: {
      name: string;
      category: string;
      exposure: string;
      buildings?: number;
      lngLat: maplibregl.LngLat;
    }) => void;
  }
) {
  if (!map.getSource("infrastructure-source")) {
    map.addSource("infrastructure-source", {
      type: "geojson",
      data: infrastructureGeo,
    });
  }

  if (!map.getLayer("infrastructure-roads")) {
    map.addLayer({
      id: "infrastructure-roads",
      type: "line",
      source: "infrastructure-source",
      filter: ["==", ["get", "type"], "road"],
      paint: {
        "line-color": colors.terrainSand,
        "line-width": 2,
        "line-opacity": 0.72,
      },
    });
  }

  if (!map.getLayer("infrastructure-settlements")) {
    map.addLayer({
      id: "infrastructure-settlements",
      type: "circle",
      source: "infrastructure-source",
      filter: ["==", ["get", "type"], "settlement"],
      paint: {
        "circle-radius": [
          "match",
          ["get", "category"],
          "Hospital",
          6,
          "Port",
          6,
          "Shelter",
          5.5,
          4.5,
        ],
        "circle-color": [
          "match",
          ["get", "category"],
          "Port",
          colors.horizonBlue,
          "Shelter",
          colors.terrainSand,
          colors.monsoonTeal,
        ],
        "circle-stroke-width": 1.5,
        "circle-stroke-color": colors.deepOcean,
      },
    });
  }

  if (options?.onAssetClick) {
    map.on("mouseenter", "infrastructure-settlements", () => {
      map.getCanvas().style.cursor = "pointer";
    });
    map.on("mouseleave", "infrastructure-settlements", () => {
      map.getCanvas().style.cursor = "";
    });
    map.on("click", "infrastructure-settlements", (e) => {
      const feature = e.features?.[0];
      if (!feature?.properties) return;
      options.onAssetClick?.({
        name: String(feature.properties.name),
        category: String(feature.properties.category || "Settlement"),
        exposure: String(feature.properties.exposure || "Moderate"),
        buildings: feature.properties.buildings
          ? Number(feature.properties.buildings)
          : undefined,
        lngLat: e.lngLat,
      });
    });
  }
}

/** Toggle visibility of a group of MapLibre layers safely */
export function setLayerGroupVisibility(
  map: maplibregl.Map,
  layerIds: string[],
  visible: boolean
) {
  const value = visible ? "visible" : "none";
  for (const id of layerIds) {
    if (map.getLayer(id)) {
      map.setLayoutProperty(id, "visibility", value);
    }
  }
}

/** Adjust fill or line opacity for a layer safely */
export function setLayerOpacity(
  map: maplibregl.Map,
  layerId: string,
  property: "fill-opacity" | "line-opacity" | "circle-opacity",
  opacity: number
) {
  if (map.getLayer(layerId)) {
    map.setPaintProperty(layerId, property, opacity);
  }
}
