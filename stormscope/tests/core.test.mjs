import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import {
  findAllContainingFeatures,
  findContainingFeature,
  pointInGeometry,
} from "../src/lib/spatial.ts";
import {
  buildScenarioDistrictsGeoJSON,
  classifyHazardScore,
  compareSiteAcrossCyclones,
  computeScenarioDistrictAnalysis,
  computeTerrainScore,
  computeTrackInfluence,
  haversineKm,
} from "../src/lib/engine.ts";
import {
  SAMPLE_INGESTION_PRESETS,
  validateCycloneCSVInput,
  validateGeoJSONInput,
} from "../src/lib/pipeline.ts";

const ROOT = path.resolve(import.meta.dirname, "..");
const districtsGeo = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/geo/districts.geojson"), "utf-8")
);
const floodZonesGeo = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/geo/flood-zones.geojson"), "utf-8")
);
const cyclones = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/cyclones.json"), "utf-8")
);
const districts = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/data/districts.json"), "utf-8")
);

test("spatial point-in-polygon identifies Odisha districts and flood zones accurately", () => {
  const puriMatch = findContainingFeature(85.8312, 19.8135, districtsGeo);
  assert.equal(puriMatch?.properties?.name, "Puri");

  const sambalpurMatch = findContainingFeature(83.9812, 21.4669, districtsGeo);
  assert.equal(sambalpurMatch?.properties?.name, "Sambalpur");

  const bayOfBengalMatch = findContainingFeature(88.5, 14.5, districtsGeo);
  assert.equal(bayOfBengalMatch, undefined);

  const puriFloodMatches = findAllContainingFeatures(85.8312, 19.8135, floodZonesGeo);
  assert.ok(puriFloodMatches.length >= 1, "Puri coordinate should intersect flood zone");

  assert.equal(pointInGeometry(0, 0, null), false);
});

test("analytical scoring engine produces repeatable scenario rankings and site comparisons", () => {
  assert.ok(haversineKm(19.8135, 85.8312, 20.2961, 85.8245) > 45);
  assert.equal(classifyHazardScore(92), "Extreme");
  assert.equal(classifyHazardScore(74), "High");
  assert.equal(classifyHazardScore(52), "Moderate");
  assert.equal(classifyHazardScore(20), "Low");

  assert.ok(
    computeTerrainScore(true, "Low Coastal Delta") >
      computeTerrainScore(false, "Inland Elevated Plateau")
  );

  const fani = cyclones.find((c) => c.id === "fani");
  const phailin = cyclones.find((c) => c.id === "phailin");
  const dana = cyclones.find((c) => c.id === "dana");

  const faniDistricts = computeScenarioDistrictAnalysis(fani, districts);
  assert.equal(faniDistricts.length, 30);
  assert.equal(faniDistricts[0].districtId, "puri");

  const phailinDistricts = computeScenarioDistrictAnalysis(phailin, districts);
  const ganjamInPhailin = phailinDistricts.find((d) => d.districtId === "ganjam");
  assert.ok(ganjamInPhailin && ganjamInPhailin.exposureIndex >= 70);

  const danaDistricts = computeScenarioDistrictAnalysis(dana, districts);
  const kendraparaInDana = danaDistricts.find((d) => d.districtId === "kendrapara");
  assert.ok(kendraparaInDana && kendraparaInDana.exposureIndex >= 60);

  const geoCopy = buildScenarioDistrictsGeoJSON(districtsGeo, phailinDistricts);
  assert.equal(geoCopy.features.length, 30);

  const influence = computeTrackInfluence(19.8, 85.8, fani);
  assert.ok(influence.nearestKm <= 5);
  assert.ok(influence.windScore >= 85);

  const siteComparisons = compareSiteAcrossCyclones(19.8135, 85.8312, cyclones, 86, 24);
  assert.equal(siteComparisons.length, cyclones.length);
});

test("Phase 3 data validation pipeline validates GeoJSON and IMD cyclone CSVs", () => {
  const hudhudSample = SAMPLE_INGESTION_PRESETS.find((s) => s.id === "imd-hudhud-csv");
  const csvResult = validateCycloneCSVInput(
    hudhudSample.payload,
    hudhudSample.name,
    hudhudSample.year,
    hudhudSample.landfallRegion
  );
  assert.equal(csvResult.valid, true);
  assert.equal(csvResult.normalizedCyclone?.maxWindSpeed, 185);
  assert.equal(csvResult.featureCount, 7);

  const badCsv = validateCycloneCSVInput("col1,col2\n1,2\n3,4", "Bad", 2020, "Odisha");
  assert.equal(badCsv.valid, false);

  const shelterSample = SAMPLE_INGESTION_PRESETS.find(
    (s) => s.id === "osm-shelters-geojson"
  );
  const geoResult = validateGeoJSONInput(shelterSample.payload, shelterSample.name);
  assert.equal(geoResult.valid, true);
  assert.equal(geoResult.featureCount, 4);
  assert.ok(geoResult.geometryTypes.includes("Point"));

  const badJson = validateGeoJSONInput("{not-valid-json", "Broken");
  assert.equal(badJson.valid, false);

  const emptyGeo = validateGeoJSONInput(
    JSON.stringify({ type: "FeatureCollection", features: [] }),
    "Empty"
  );
  assert.equal(emptyGeo.valid, false);
});
