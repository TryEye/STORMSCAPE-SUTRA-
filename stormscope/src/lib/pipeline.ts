import type { CycloneEvent, CycloneTrackPoint } from "@/types";

export interface ValidationCheck {
  name: string;
  status: "passed" | "warning" | "failed";
  detail: string;
}

export interface DatasetValidationResult {
  valid: boolean;
  datasetType: "geojson" | "cyclone-track";
  name: string;
  sourceLabel: string;
  featureCount: number;
  bbox?: [number, number, number, number];
  geometryTypes: string[];
  checks: ValidationCheck[];
  normalizedGeoJSON?: GeoJSON.FeatureCollection;
  normalizedCyclone?: CycloneEvent;
}

export interface CustomOverlayDataset {
  id: string;
  name: string;
  sourceLabel: string;
  color: string;
  featureCount: number;
  geojson: GeoJSON.FeatureCollection;
  visible: boolean;
}

function walkCoords(coords: unknown, out: [number, number][]) {
  if (!Array.isArray(coords)) return;
  if (
    coords.length >= 2 &&
    typeof coords[0] === "number" &&
    typeof coords[1] === "number"
  ) {
    out.push([coords[0], coords[1]]);
    return;
  }
  for (const item of coords) {
    walkCoords(item, out);
  }
}

/**
 * Validate and normalize a GeoJSON string into a StormScope FeatureCollection.
 */
export function validateGeoJSONInput(
  rawText: string,
  datasetName: string,
  sourceLabel = "Custom GeoJSON Upload"
): DatasetValidationResult {
  const checks: ValidationCheck[] = [];

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawText);
    checks.push({
      name: "JSON Syntax Parse",
      status: "passed",
      detail: "Valid JSON structure parsed cleanly.",
    });
  } catch (err) {
    return {
      valid: false,
      datasetType: "geojson",
      name: datasetName,
      sourceLabel,
      featureCount: 0,
      geometryTypes: [],
      checks: [
        {
          name: "JSON Syntax Parse",
          status: "failed",
          detail: err instanceof Error ? err.message : "Invalid JSON payload.",
        },
      ],
    };
  }

  const obj = parsed as Record<string, unknown>;
  let features: GeoJSON.Feature[] = [];
  if (obj?.type === "FeatureCollection" && Array.isArray(obj.features)) {
    features = obj.features as GeoJSON.Feature[];
    checks.push({
      name: "GeoJSON Schema",
      status: "passed",
      detail: `FeatureCollection containing ${features.length} feature(s).`,
    });
  } else if (obj?.type === "Feature" && obj.geometry) {
    features = [obj as unknown as GeoJSON.Feature];
    checks.push({
      name: "GeoJSON Schema",
      status: "passed",
      detail: "Single GeoJSON Feature normalized to FeatureCollection.",
    });
  } else {
    checks.push({
      name: "GeoJSON Schema",
      status: "failed",
      detail: "Root must be a GeoJSON FeatureCollection or Feature.",
    });
    return {
      valid: false,
      datasetType: "geojson",
      name: datasetName,
      sourceLabel,
      featureCount: 0,
      geometryTypes: [],
      checks,
    };
  }

  if (features.length === 0) {
    checks.push({
      name: "Feature Count",
      status: "failed",
      detail: "FeatureCollection contains zero features.",
    });
    return {
      valid: false,
      datasetType: "geojson",
      name: datasetName,
      sourceLabel,
      featureCount: 0,
      geometryTypes: [],
      checks,
    };
  }

  const allCoords: [number, number][] = [];
  const geomTypes = new Set<string>();
  for (const f of features) {
    if (f.geometry?.type) {
      geomTypes.add(f.geometry.type);
    }
    if ("coordinates" in (f.geometry ?? {})) {
      walkCoords((f.geometry as { coordinates: unknown }).coordinates, allCoords);
    }
  }

  if (allCoords.length === 0) {
    checks.push({
      name: "Coordinate Geometry",
      status: "failed",
      detail: "No valid [lng, lat] coordinate pairs found in features.",
    });
    return {
      valid: false,
      datasetType: "geojson",
      name: datasetName,
      sourceLabel,
      featureCount: features.length,
      geometryTypes: Array.from(geomTypes),
      checks,
    };
  }

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const [lng, lat] of allCoords) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }

  const validWgs84 =
    minLng >= -180 && maxLng <= 180 && minLat >= -90 && maxLat <= 90;
  checks.push({
    name: "CRS & Coordinate Bounds (EPSG:4326)",
    status: validWgs84 ? "passed" : "failed",
    detail: validWgs84
      ? `Bounds [${minLng.toFixed(2)}°E..${maxLng.toFixed(2)}°E, ${minLat.toFixed(2)}°N..${maxLat.toFixed(2)}°N]`
      : "Coordinates fall outside WGS84 geographic bounds.",
  });

  const inBayOfBengal =
    maxLng >= 78 && minLng <= 96 && maxLat >= 6 && minLat <= 26;
  checks.push({
    name: "Odisha / Bay of Bengal Spatial Overlap",
    status: inBayOfBengal ? "passed" : "warning",
    detail: inBayOfBengal
      ? "Dataset intersects the Odisha & Bay of Bengal analysis domain."
      : "Dataset lies outside the primary Odisha/Bay of Bengal focus window.",
  });

  const normalizedGeoJSON: GeoJSON.FeatureCollection = {
    type: "FeatureCollection",
    features,
  };

  return {
    valid: validWgs84,
    datasetType: "geojson",
    name: datasetName,
    sourceLabel,
    featureCount: features.length,
    bbox: [minLng, minLat, maxLng, maxLat],
    geometryTypes: Array.from(geomTypes),
    checks,
    normalizedGeoJSON,
  };
}

/**
 * Validate and normalize an IMD-style Cyclone Track CSV
 * Expected header: timestamp,lat,lng,windSpeed,pressure,category
 */
export function validateCycloneCSVInput(
  rawCsv: string,
  cycloneName: string,
  year: number,
  landfallRegion: string,
  sourceLabel = "IMD Best-Track CSV"
): DatasetValidationResult {
  const checks: ValidationCheck[] = [];
  const lines = rawCsv
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  if (lines.length < 3) {
    return {
      valid: false,
      datasetType: "cyclone-track",
      name: cycloneName,
      sourceLabel,
      featureCount: 0,
      geometryTypes: ["LineString", "Point"],
      checks: [
        {
          name: "CSV Row Count",
          status: "failed",
          detail: "Track CSV must contain a header and at least 2 track observations.",
        },
      ],
    };
  }

  const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idxTime = headers.indexOf("timestamp");
  const idxLat = headers.indexOf("lat");
  const idxLng = headers.indexOf("lng");
  const idxWind = headers.indexOf("windspeed");
  const idxPres = headers.indexOf("pressure");
  const idxCat = headers.indexOf("category");

  if (idxLat === -1 || idxLng === -1 || idxWind === -1) {
    return {
      valid: false,
      datasetType: "cyclone-track",
      name: cycloneName,
      sourceLabel,
      featureCount: 0,
      geometryTypes: ["LineString", "Point"],
      checks: [
        {
          name: "Required Columns",
          status: "failed",
          detail: "CSV must include lat, lng, and windSpeed columns.",
        },
      ],
    };
  }

  checks.push({
    name: "Required Columns",
    status: "passed",
    detail: `Detected columns: ${headers.join(", ")}`,
  });

  const track: CycloneTrackPoint[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",").map((c) => c.trim());
    const lat = Number(cols[idxLat]);
    const lng = Number(cols[idxLng]);
    const windSpeed = Number(cols[idxWind]);
    const pressure = idxPres !== -1 ? Number(cols[idxPres]) : 990;
    const timestamp =
      idxTime !== -1 ? cols[idxTime] : `${year}-10-12T${String(i).padStart(2, "0")}:00:00Z`;
    const category = idxCat !== -1 ? cols[idxCat] : "Cyclonic Storm";

    if (
      Number.isFinite(lat) &&
      Number.isFinite(lng) &&
      Number.isFinite(windSpeed) &&
      lat >= -90 &&
      lat <= 90 &&
      lng >= -180 &&
      lng <= 180
    ) {
      track.push({ lat, lng, timestamp, windSpeed, pressure, category });
    }
  }

  if (track.length < 2) {
    checks.push({
      name: "Numeric Track Coordinates",
      status: "failed",
      detail: "Fewer than 2 valid numeric track nodes parsed.",
    });
    return {
      valid: false,
      datasetType: "cyclone-track",
      name: cycloneName,
      sourceLabel,
      featureCount: track.length,
      geometryTypes: ["LineString", "Point"],
      checks,
    };
  }

  const maxWind = Math.max(...track.map((t) => t.windSpeed));
  const minPressure = Math.min(...track.map((t) => t.pressure));

  checks.push({
    name: "Meteorological Bounds",
    status: maxWind <= 350 && minPressure >= 850 ? "passed" : "warning",
    detail: `Parsed ${track.length} track nodes (Peak ${maxWind} km/h, Min ${minPressure} hPa).`,
  });

  const idSlug = cycloneName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  const normalizedCyclone: CycloneEvent = {
    id: idSlug || `imported-${Date.now()}`,
    name: cycloneName,
    year,
    category:
      maxWind >= 166
        ? "Extremely Severe Cyclonic Storm"
        : maxWind >= 118
          ? "Very Severe Cyclonic Storm"
          : "Severe Cyclonic Storm",
    landfallRegion,
    landfallDate: track[Math.floor(track.length / 2)].timestamp.slice(0, 10),
    maxWindSpeed: maxWind,
    minPressure,
    affectedDistricts: ["ganjam", "puri", "khordha", "koraput"],
    description: `Ingested via StormScope Phase 3 Data Pipeline (${sourceLabel}). Normalized from ${track.length} track observations.`,
    timeline: track.map((pt) => ({
      date: pt.timestamp.slice(0, 10),
      event: pt.category,
      description: `Observed ${pt.windSpeed} km/h sustained winds and ${pt.pressure} hPa central pressure at ${pt.lat.toFixed(1)}°N, ${pt.lng.toFixed(1)}°E.`,
    })),
    track,
  };

  return {
    valid: true,
    datasetType: "cyclone-track",
    name: cycloneName,
    sourceLabel,
    featureCount: track.length,
    geometryTypes: ["LineString", "Point"],
    checks,
    normalizedCyclone,
  };
}

/** One-click sample ingestion payloads for Phase 3 demonstration */
export const SAMPLE_INGESTION_PRESETS = [
  {
    id: "imd-hudhud-csv",
    label: "IMD Cyclone Hudhud (2014) Track CSV",
    kind: "cyclone-track" as const,
    name: "Cyclone Hudhud",
    year: 2014,
    landfallRegion: "Visakhapatnam / Southern Odisha",
    sourceLabel: "IMD Best-Track Archive (Sample)",
    payload: `timestamp,lat,lng,windSpeed,pressure,category
2014-10-08T00:00:00Z,12.5,91.8,55,1000,Deep Depression
2014-10-09T06:00:00Z,14.1,89.4,85,990,Cyclonic Storm
2014-10-10T12:00:00Z,15.6,87.0,130,972,Very Severe
2014-10-11T18:00:00Z,17.0,84.6,185,950,Extremely Severe
2014-10-12T06:00:00Z,17.7,83.3,180,952,Landfall Corridor
2014-10-13T00:00:00Z,18.9,82.1,85,986,Southern Odisha Passage
2014-10-14T00:00:00Z,21.2,81.4,40,1000,Dissipation`,
  },
  {
    id: "osm-shelters-geojson",
    label: "OpenStreetMap Coastal Cyclone Shelters GeoJSON",
    kind: "geojson" as const,
    name: "OSM Multi-Purpose Cyclone Shelters",
    sourceLabel: "OpenStreetMap Overpass Extract (Sample)",
    color: "#F59E0B",
    payload: JSON.stringify(
      {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: { name: "Satpada Cyclone Shelter (Puri)", capacity: 1500 },
            geometry: { type: "Point", coordinates: [85.442, 19.675] },
          },
          {
            type: "Feature",
            properties: { name: "Astaranga Emergency Shelter", capacity: 1200 },
            geometry: { type: "Point", coordinates: [86.265, 19.985] },
          },
          {
            type: "Feature",
            properties: { name: "Ersama Resilience Center (Jagatsinghpur)", capacity: 1800 },
            geometry: { type: "Point", coordinates: [86.448, 20.195] },
          },
          {
            type: "Feature",
            properties: { name: "Rajnagar Delta Shelter (Kendrapara)", capacity: 1400 },
            geometry: { type: "Point", coordinates: [86.792, 20.568] },
          },
        ],
      },
      null,
      2
    ),
  },
  {
    id: "sentinel-flood-geojson",
    label: "Sentinel-1 SAR Mahanadi Flood Extent GeoJSON",
    kind: "geojson" as const,
    name: "Sentinel-1 SAR Post-Landfall Flood Extent",
    sourceLabel: "Copernicus Sentinel-1 SAR (Sample)",
    color: "#38BDF8",
    payload: JSON.stringify(
      {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {
              name: "Mahanadi-Devi Floodwater Footprint",
              sensor: "Sentinel-1 IW GRD",
              areaSqKm: 640,
            },
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [85.82, 20.08],
                  [86.28, 20.15],
                  [86.45, 20.38],
                  [86.05, 20.46],
                  [85.76, 20.28],
                  [85.82, 20.08],
                ],
              ],
            },
          },
        ],
      },
      null,
      2
    ),
  },
];
