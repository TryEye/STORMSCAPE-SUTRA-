// ═══════════════════════════════════════════════════════
// StormScope — Core Type Definitions
// ═══════════════════════════════════════════════════════

/** Hazard severity levels per DesignSystem.md §2 */
export type HazardLevel = "Low" | "Moderate" | "High" | "Extreme";

/** Building categories for assessment per Pages.md §4 */
export type BuildingCategory = "Residential" | "Commercial" | "School" | "Hospital" | "Industrial" | "Government";

// ── Cyclone Data ──

export interface CycloneTrackPoint {
  lat: number;
  lng: number;
  timestamp: string;
  windSpeed: number; // km/h
  pressure: number; // hPa
  category: string;
}

export interface CycloneEvent {
  id: string;
  name: string;
  year: number;
  category: string;
  landfallRegion: string;
  landfallDate: string;
  maxWindSpeed: number;
  minPressure: number;
  affectedDistricts: string[];
  description: string;
  timeline: CycloneTimelineEntry[];
  track: CycloneTrackPoint[];
}

export interface CycloneTimelineEntry {
  date: string;
  event: string;
  description: string;
}

// ── District Data ──

export interface District {
  id: string;
  name: string;
  exposureIndex: number;
  hazardCategory: HazardLevel;
  coastal?: boolean;
  elevationTier?: string;
  population: number;
  area: number; // sq km
  coastalLength?: number; // km
  potentiallyExposedBuildings: number;
  potentiallyExposedRoads: number; // km
  potentiallyExposedSettlements: number;
  centroid?: [number, number];
  bbox?: [number, number, number, number];
}

// ── Exposure Data ──

export interface ExposureMetrics {
  totalExposedBuildings: number;
  totalExposedRoads: number; // km
  totalExposedSettlements: number;
  estimatedHazardArea: number; // sq km
  highestExposureDistrict: string;
  averageExposureIndex: number;
  coastalAverageIndex?: number;
  inlandAverageIndex?: number;
}

export interface AssetCategoryExposure {
  category: string;
  exposedCount: number;
  share: number;
  hazardFocus: HazardLevel;
}

export interface DistrictExposure {
  districtId: string;
  districtName: string;
  exposureIndex: number;
  hazardCategory: HazardLevel;
  coastal?: boolean;
  buildings: number;
  roads: number;
  settlements: number;
}

// ── Assessment Data ──

export interface AssessmentInput {
  latitude: number;
  longitude: number;
  buildingCategory: BuildingCategory;
  buildingHeight: number; // meters
}

export interface AssessmentResult {
  location: string;
  coordinates: { lat: number; lng: number };
  exposureIndex: number;
  floodIndicator: HazardLevel;
  terrainIndicator: string;
  cycloneFrequencyIndicator: HazardLevel;
  overallCategory: HazardLevel;
  recommendation: string;
  details: AssessmentDetail[];
  factorBreakdown?: ScoreFactorBreakdown;
  scenarioComparisons?: ScenarioSiteComparison[];
}

export interface AssessmentDetail {
  label: string;
  value: string | number;
  interpretation: string;
  level: HazardLevel;
}

export interface ScoreFactorBreakdown {
  windExposure: number;
  floodSurge: number;
  terrainVulnerability: number;
  structureSensitivity: number;
}

export interface ScenarioSiteComparison {
  cycloneId: string;
  cycloneName: string;
  year: number;
  exposureIndex: number;
  hazardCategory: HazardLevel;
  nearestTrackKm: number;
  estimatedPeakWindAtSite: number;
}

export interface DistrictScenarioAnalysis {
  districtId: string;
  districtName: string;
  coastal: boolean;
  elevationTier: string;
  windScore: number;
  surgeScore: number;
  terrainScore: number;
  exposureIndex: number;
  hazardCategory: HazardLevel;
  nearestTrackKm: number;
  potentiallyExposedBuildings: number;
  potentiallyExposedRoads: number;
  potentiallyExposedSettlements: number;
}

// ── Dashboard ──

export interface DashboardSummary {
  cycloneName: string;
  cycloneYear: number;
  selectedDistrict: string;
  hazardCategory: HazardLevel;
  exposureIndex: number;
}

export interface InsightItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "exposure" | "terrain" | "infrastructure" | "recommendation";
}

// ── Map Types ──

export type MapLayerType =
  | "base"
  | "districts"
  | "cyclone-path"
  | "hazard"
  | "infrastructure"
  | "interaction";

export interface MapLayerConfig {
  id: MapLayerType;
  label: string;
  visible: boolean;
  opacity: number;
}

// ── Methodology ──

export interface MethodologyStep {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface DataSource {
  name: string;
  type: string;
  description: string;
  status: "integrated" | "planned";
}
