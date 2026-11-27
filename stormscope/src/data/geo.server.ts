import fs from "node:fs";
import path from "node:path";

export interface StormScopeGeoData {
  bayOfBengalLand: GeoJSON.FeatureCollection;
  odisha: GeoJSON.FeatureCollection;
  districts: GeoJSON.FeatureCollection;
  hazardZones: GeoJSON.FeatureCollection;
  floodZones: GeoJSON.FeatureCollection;
  demElevation: GeoJSON.FeatureCollection;
  rainfallBands: GeoJSON.FeatureCollection;
  infrastructure: GeoJSON.FeatureCollection;
}

function readGeoJSON(filename: string): GeoJSON.FeatureCollection {
  const filePath = path.join(process.cwd(), "src", "data", "geo", filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as GeoJSON.FeatureCollection;
}

export function loadStormScopeGeoData(): StormScopeGeoData {
  return {
    bayOfBengalLand: readGeoJSON("bay-of-bengal-land.geojson"),
    odisha: readGeoJSON("odisha.geojson"),
    districts: readGeoJSON("districts.geojson"),
    hazardZones: readGeoJSON("hazard-zones.geojson"),
    floodZones: readGeoJSON("flood-zones.geojson"),
    demElevation: readGeoJSON("dem-elevation.geojson"),
    rainfallBands: readGeoJSON("rainfall-bands.geojson"),
    infrastructure: readGeoJSON("infrastructure.geojson"),
  };
}
