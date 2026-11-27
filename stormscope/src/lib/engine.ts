import type {
  CycloneEvent,
  District,
  DistrictScenarioAnalysis,
  HazardLevel,
  ScenarioSiteComparison,
} from "@/types";

/** Haversine distance in km between two WGS84 points */
export function haversineKm(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Map a 0-100 composite exposure index to the standardized Hazard Scale */
export function classifyHazardScore(score: number): HazardLevel {
  if (score >= 88) return "Extreme";
  if (score >= 68) return "High";
  if (score >= 42) return "Moderate";
  return "Low";
}

/**
 * Estimate wind intensity and proximity at a point [lat, lng] relative to a cyclone track.
 * Uses distance decay from each track observation weighted by its sustained wind speed.
 */
export function computeTrackInfluence(
  lat: number,
  lng: number,
  cyclone: CycloneEvent
): {
  nearestKm: number;
  estimatedWindAtPoint: number;
  windScore: number;
} {
  if (!cyclone.track.length) {
    return { nearestKm: 400, estimatedWindAtPoint: 30, windScore: 15 };
  }

  let nearestKm = Infinity;
  let maxLocalWind = 0;

  for (let i = 0; i < cyclone.track.length; i++) {
    const pt = cyclone.track[i];
    const d = haversineKm(lat, lng, pt.lat, pt.lng);
    if (d < nearestKm) nearestKm = d;

    // Sample midpoint to next node for smoother segment interpolation
    if (i < cyclone.track.length - 1) {
      const next = cyclone.track[i + 1];
      const midLat = (pt.lat + next.lat) / 2;
      const midLng = (pt.lng + next.lng) / 2;
      const midWind = (pt.windSpeed + next.windSpeed) / 2;
      const dMid = haversineKm(lat, lng, midLat, midLng);
      if (dMid < nearestKm) nearestKm = dMid;
      const attenuatedMid = midWind * Math.exp(-dMid / 145);
      if (attenuatedMid > maxLocalWind) maxLocalWind = attenuatedMid;
    }

    const attenuated = pt.windSpeed * Math.exp(-d / 145);
    if (attenuated > maxLocalWind) maxLocalWind = attenuated;
  }

  const estimatedWindAtPoint = Math.round(Math.max(25, maxLocalWind));
  const windScore = Math.min(
    100,
    Math.max(10, Math.round((estimatedWindAtPoint / 185) * 95))
  );

  return {
    nearestKm: Math.round(nearestKm),
    estimatedWindAtPoint,
    windScore,
  };
}

/** Compute terrain vulnerability score (0-100) from coastal status & elevation tier */
export function computeTerrainScore(
  coastal?: boolean,
  elevationTier?: string
): number {
  const tier = (elevationTier ?? "").toLowerCase();
  if (coastal && (tier.includes("delta") || tier.includes("low"))) return 86;
  if (coastal) return 72;
  if (tier.includes("transition") || tier.includes("alluvial") || tier.includes("delta"))
    return 54;
  if (tier.includes("valley") || tier.includes("upland")) return 34;
  return 22;
}

/**
 * Repeatable Phase 4 District Analysis Engine:
 * Evaluates all 30 Odisha districts dynamically under any cyclone scenario.
 * For Cyclone Fani, preserves baseline historical calibration while adding transparent sub-scores.
 */
export function computeScenarioDistrictAnalysis(
  cyclone: CycloneEvent,
  districts: District[]
): DistrictScenarioAnalysis[] {
  return districts
    .map((d) => {
      const [lng, lat] = d.centroid ?? [84.4, 20.5];
      const { nearestKm, windScore } = computeTrackInfluence(lat, lng, cyclone);
      const terrainScore = computeTerrainScore(d.coastal, d.elevationTier);

      // Surge & flood susceptibility rises sharply for coastal/delta districts near track
      const surgeBase = d.coastal ? 68 : terrainScore > 45 ? 38 : 16;
      const surgeProximityBoost = Math.max(0, Math.round((1 - nearestKm / 260) * 30));
      const surgeScore = Math.min(98, surgeBase + surgeProximityBoost);

      // Composite weighted exposure index:
      // 48% Wind Proximity + 28% Surge/Flood + 24% Terrain Vulnerability
      const computedComposite = Math.min(
        97,
        Math.max(
          12,
          Math.round(windScore * 0.48 + surgeScore * 0.28 + terrainScore * 0.24)
        )
      );

      // Preserve canonical Fani baseline when evaluating Cyclone Fani
      const exposureIndex =
        cyclone.id === "fani" ? d.exposureIndex : computedComposite;
      const hazardCategory =
        cyclone.id === "fani"
          ? d.hazardCategory
          : classifyHazardScore(exposureIndex);

      // Scale potentially exposed infrastructure proportionally to scenario severity ratio
      const ratio =
        cyclone.id === "fani"
          ? 1
          : Math.max(0.25, exposureIndex / Math.max(20, d.exposureIndex));

      return {
        districtId: d.id,
        districtName: d.name,
        coastal: Boolean(d.coastal),
        elevationTier: d.elevationTier ?? "Regional Zone",
        windScore,
        surgeScore,
        terrainScore,
        exposureIndex,
        hazardCategory,
        nearestTrackKm: nearestKm,
        potentiallyExposedBuildings: Math.round(
          d.potentiallyExposedBuildings * ratio
        ),
        potentiallyExposedRoads: Math.round(d.potentiallyExposedRoads * ratio),
        potentiallyExposedSettlements: Math.round(
          d.potentiallyExposedSettlements * ratio
        ),
      };
    })
    .sort((a, b) => b.exposureIndex - a.exposureIndex);
}

/**
 * Produce a scenario-updated GeoJSON copy of Odisha districts
 * so MapLibre choropleth colors update immediately per cyclone scenario.
 */
export function buildScenarioDistrictsGeoJSON(
  baseDistrictsGeo: GeoJSON.FeatureCollection,
  analyses: DistrictScenarioAnalysis[]
): GeoJSON.FeatureCollection {
  const byId = new Map(analyses.map((a) => [a.districtId, a]));

  return {
    type: "FeatureCollection",
    features: baseDistrictsGeo.features.map((f) => {
      const id = String(f.properties?.id ?? "");
      const match = byId.get(id);
      if (!match) return f;
      return {
        ...f,
        properties: {
          ...f.properties,
          exposureIndex: match.exposureIndex,
          hazardCategory: match.hazardCategory,
          windScore: match.windScore,
          surgeScore: match.surgeScore,
        },
      };
    }),
  };
}

/**
 * Evaluate a specific coordinate [lat, lng] across multiple historical cyclone scenarios
 * for comparative sensitivity analysis on the Assessment workstation.
 */
export function compareSiteAcrossCyclones(
  lat: number,
  lng: number,
  cyclones: CycloneEvent[],
  terrainScore: number,
  floodBonus: number
): ScenarioSiteComparison[] {
  return cyclones.map((c) => {
    const { nearestKm, estimatedWindAtPoint, windScore } = computeTrackInfluence(
      lat,
      lng,
      c
    );
    const surgeScore = Math.min(
      96,
      Math.max(12, Math.round(terrainScore * 0.65 + floodBonus + Math.max(0, (1 - nearestKm / 250) * 28)))
    );
    const exposureIndex = Math.min(
      97,
      Math.max(
        12,
        Math.round(windScore * 0.5 + surgeScore * 0.28 + terrainScore * 0.22)
      )
    );

    return {
      cycloneId: c.id,
      cycloneName: c.name,
      year: c.year,
      exposureIndex,
      hazardCategory: classifyHazardScore(exposureIndex),
      nearestTrackKm: nearestKm,
      estimatedPeakWindAtSite: estimatedWindAtPoint,
    };
  });
}
