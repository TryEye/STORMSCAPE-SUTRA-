import type {
  AssessmentInput,
  AssessmentResult,
  BuildingCategory,
  CycloneEvent,
  HazardLevel,
} from "@/types";
import { getAssessmentPresets, getCyclones } from "@/data";
import {
  findAllContainingFeatures,
  findContainingFeature,
} from "@/lib/spatial";
import {
  compareSiteAcrossCyclones,
  computeTerrainScore,
  computeTrackInfluence,
} from "@/lib/engine";

function categorySensitivityAdjustment(category: BuildingCategory): number {
  switch (category) {
    case "Hospital":
    case "School":
      return 6;
    case "Government":
    case "Industrial":
      return 4;
    case "Commercial":
      return 2;
    default:
      return 0;
  }
}

function heightWindModifier(heightMeters: number): number {
  if (heightMeters >= 24) return 6;
  if (heightMeters >= 12) return 3;
  return 0;
}

const HAZARD_RANK: Record<HazardLevel, number> = {
  Low: 1,
  Moderate: 2,
  High: 3,
  Extreme: 4,
};

export interface SpatialGeoContext {
  districts?: GeoJSON.FeatureCollection;
  hazardZones?: GeoJSON.FeatureCollection;
  floodZones?: GeoJSON.FeatureCollection;
  cyclones?: CycloneEvent[];
}

/**
 * Repeatable Phase 4 Site Exposure Evaluator.
 * Intersects [lng, lat] with Odisha's 30 district polygons, wind hazard swaths,
 * coastal flood/surge zones, and evaluates sensitivity across all historical cyclones.
 */
export function evaluateSiteExposure(
  input: AssessmentInput,
  geoContext?: SpatialGeoContext
): AssessmentResult {
  const presets = getAssessmentPresets();
  const cyclones = geoContext?.cyclones ?? getCyclones();
  const primaryCyclone = cyclones[0];

  const matchingPreset = presets.find(
    (p) =>
      Math.abs(p.coordinates.lat - input.latitude) < 0.01 &&
      Math.abs(p.coordinates.lng - input.longitude) < 0.01
  );

  const sensitivityDelta = categorySensitivityAdjustment(input.buildingCategory);
  const heightDelta = heightWindModifier(input.buildingHeight);
  const structureSensitivity = Math.min(
    95,
    Math.round(35 + sensitivityDelta * 6 + heightDelta * 5)
  );

  const districtFeature = findContainingFeature(
    input.longitude,
    input.latitude,
    geoContext?.districts
  );
  const hazardMatches = findAllContainingFeatures(
    input.longitude,
    input.latitude,
    geoContext?.hazardZones
  );
  const floodFeature = findContainingFeature(
    input.longitude,
    input.latitude,
    geoContext?.floodZones
  );

  const highestHazardFeature = hazardMatches.sort((a, b) => {
    const la = (a.properties?.hazardCategory as HazardLevel) ?? "Low";
    const lb = (b.properties?.hazardCategory as HazardLevel) ?? "Low";
    return HAZARD_RANK[lb] - HAZARD_RANK[la];
  })[0];

  const trackInfluence = primaryCyclone
    ? computeTrackInfluence(input.latitude, input.longitude, primaryCyclone)
    : { nearestKm: 80, estimatedWindAtPoint: 100, windScore: 55 };

  const isCoastalDistrict = Boolean(districtFeature?.properties?.coastal);
  const districtElevationTier = districtFeature?.properties?.elevationTier
    ? String(districtFeature.properties.elevationTier)
    : undefined;
  const terrainVulnerability = computeTerrainScore(
    isCoastalDistrict,
    districtElevationTier
  );
  const floodBonus = floodFeature ? 24 : 0;

  const scenarioComparisons = compareSiteAcrossCyclones(
    input.latitude,
    input.longitude,
    cyclones,
    terrainVulnerability,
    floodBonus
  );

  if (matchingPreset && !districtFeature) {
    const adjustedScore = Math.min(
      98,
      Math.max(
        10,
        matchingPreset.exposureIndex +
          Math.round((sensitivityDelta + heightDelta) / 2)
      )
    );
    const overallCategory: HazardLevel =
      adjustedScore >= 75 ? "High" : adjustedScore >= 40 ? "Moderate" : "Low";

    const recommendation =
      overallCategory === "High"
        ? "Requires Detailed Assessment"
        : overallCategory === "Moderate"
          ? "Additional Investigation Recommended"
          : "Suitable For Development";

    return {
      ...matchingPreset,
      exposureIndex: adjustedScore,
      overallCategory,
      recommendation,
      factorBreakdown: {
        windExposure: trackInfluence.windScore,
        floodSurge: floodFeature ? 84 : matchingPreset.floodIndicator === "High" ? 80 : 42,
        terrainVulnerability,
        structureSensitivity,
      },
      scenarioComparisons,
      details: matchingPreset.details.map((d, idx) =>
        idx === 0
          ? {
              ...d,
              value: adjustedScore,
              level: overallCategory,
              interpretation: `${d.interpretation} Adjusted for ${input.buildingCategory} profile (${input.buildingHeight}m height class).`,
            }
          : d
      ),
    };
  }

  const districtName = districtFeature?.properties?.name
    ? String(districtFeature.properties.name)
    : null;
  const districtBaseIndex = districtFeature?.properties?.exposureIndex
    ? Number(districtFeature.properties.exposureIndex)
    : null;

  const floodZoneLevel = floodFeature?.properties?.floodLevel
    ? (String(floodFeature.properties.floodLevel) as HazardLevel)
    : null;
  const floodZoneName = floodFeature?.properties?.name
    ? String(floodFeature.properties.name)
    : null;

  const hazardZoneName = highestHazardFeature?.properties?.name
    ? String(highestHazardFeature.properties.name)
    : null;

  const floodSurgeScore = Math.min(
    96,
    Math.max(
      14,
      Math.round(
        terrainVulnerability * 0.65 +
          floodBonus +
          (isCoastalDistrict ? 18 : 4)
      )
    )
  );

  const weightedEngineScore = Math.round(
    trackInfluence.windScore * 0.4 +
      floodSurgeScore * 0.25 +
      terrainVulnerability * 0.2 +
      structureSensitivity * 0.15
  );

  const baseScore =
    districtBaseIndex !== null
      ? Math.round(
          districtBaseIndex * 0.65 +
            weightedEngineScore * 0.35 +
            (floodFeature ? 4 : 0)
        )
      : weightedEngineScore;

  const exposureIndex = Math.min(97, Math.max(12, baseScore));

  const overallCategory: HazardLevel =
    exposureIndex >= 70 ? "High" : exposureIndex >= 40 ? "Moderate" : "Low";

  const floodIndicator: HazardLevel = floodZoneLevel
    ? floodZoneLevel
    : exposureIndex >= 72
      ? "High"
      : exposureIndex >= 45
        ? "Moderate"
        : "Low";

  const cycloneFrequencyIndicator: HazardLevel =
    isCoastalDistrict || trackInfluence.nearestKm < 120
      ? "High"
      : trackInfluence.nearestKm < 220
        ? "Moderate"
        : "Low";

  const terrainIndicator =
    districtElevationTier ??
    (input.longitude >= 85.5 && input.latitude <= 21.2
      ? "Low Elevation Coastal Zone"
      : input.longitude >= 84.8
        ? "Inland Transition Plain"
        : "Inland Elevated Plateau");

  const recommendation =
    overallCategory === "High"
      ? "Requires Detailed Assessment"
      : overallCategory === "Moderate"
        ? "Additional Investigation Recommended"
        : "Suitable For Development";

  const locationLabel = districtName
    ? `${districtName} District (${input.latitude.toFixed(3)}°N, ${input.longitude.toFixed(3)}°E)`
    : `Custom Coordinates (${input.latitude.toFixed(3)}°N, ${input.longitude.toFixed(3)}°E)`;

  return {
    location: locationLabel,
    coordinates: { lat: input.latitude, lng: input.longitude },
    exposureIndex,
    floodIndicator,
    terrainIndicator,
    cycloneFrequencyIndicator,
    overallCategory,
    recommendation,
    factorBreakdown: {
      windExposure: trackInfluence.windScore,
      floodSurge: floodSurgeScore,
      terrainVulnerability,
      structureSensitivity,
    },
    scenarioComparisons,
    details: [
      {
        label: "Historical Exposure Index",
        value: exposureIndex,
        interpretation: districtName
          ? `Intersected ${districtName} District (base index ${districtBaseIndex}/100)${hazardZoneName ? ` within ${hazardZoneName}` : ""}, weighted with ${input.buildingCategory} (${input.buildingHeight}m) sensitivity.`
          : `Located ${trackInfluence.nearestKm} km from primary cyclone track; evaluated for ${input.buildingCategory} (${input.buildingHeight}m).`,
        level: overallCategory,
      },
      {
        label: "Flood Susceptibility",
        value: floodIndicator,
        interpretation: floodZoneName
          ? `Site intersects ${floodZoneName} (${String(floodFeature?.properties?.elevationBand ?? "Low Elevation")}).`
          : floodIndicator === "High"
            ? "Low-lying coastal proximity elevates historical storm surge and drainage exposure."
            : floodIndicator === "Moderate"
              ? "Moderate rainfall runoff and riverine drainage exposure during cyclonic events."
              : "Outside primary coastal surge polygons; minimal storm surge susceptibility.",
        level: floodIndicator,
      },
      {
        label: "Terrain Assessment",
        value: terrainIndicator,
        interpretation:
          isCoastalDistrict || floodFeature
            ? "Coastal/deltaic terrain increases exposure to storm surge and sustained onshore winds."
            : exposureIndex >= 40
              ? "Transitional terrain buffer moderates surge risk while wind exposure remains relevant."
              : "Elevated inland topography provides natural attenuation of coastal storm impacts.",
        level:
          isCoastalDistrict || floodFeature
            ? "High"
            : exposureIndex >= 40
              ? "Moderate"
              : "Low",
      },
      {
        label: "Cyclone Frequency",
        value:
          cycloneFrequencyIndicator === "High"
            ? "1 per 3–4 years"
            : cycloneFrequencyIndicator === "Moderate"
              ? "1 per 4–6 years"
              : "Residual effects only",
        interpretation:
          cycloneFrequencyIndicator === "High"
            ? "Located within the active Bay of Bengal coastal impact corridor."
            : cycloneFrequencyIndicator === "Moderate"
              ? "Periodically experiences gale-force winds and heavy rainfall from regional cyclones."
              : "Primarily experiences attenuated wind gusts and precipitation bands.",
        level: cycloneFrequencyIndicator,
      },
    ],
  };
}
