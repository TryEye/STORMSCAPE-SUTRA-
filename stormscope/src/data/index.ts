// ═══════════════════════════════════════════════════════
// StormScope — Centralized Data Access Layer
// All MVP data is loaded from local JSON/GeoJSON files.
// ═══════════════════════════════════════════════════════

import type {
  CycloneEvent,
  District,
  ExposureMetrics,
  DistrictExposure,
  AssetCategoryExposure,
  InsightItem,
  AssessmentResult,
} from "@/types";

import cyclonesData from "./cyclones.json";
import districtsData from "./districts.json";
import exposureData from "./exposure.json";
import assessmentData from "./assessment.json";
import statisticsData from "./statistics.json";

// ── Cyclones ──

export function getCyclones(): CycloneEvent[] {
  return cyclonesData as CycloneEvent[];
}

export function getCycloneById(id: string): CycloneEvent | undefined {
  return getCyclones().find((c) => c.id === id);
}

// ── Districts ──

export function getDistricts(): District[] {
  return districtsData as District[];
}

export function getDistrictById(id: string): District | undefined {
  return getDistricts().find((d) => d.id === id);
}

// ── Exposure ──

export function getExposureSummary(): ExposureMetrics {
  return exposureData.summary as ExposureMetrics;
}

export function getDistrictExposures(): DistrictExposure[] {
  return exposureData.districtExposure as DistrictExposure[];
}

export function getAssetCategoryBreakdown(): AssetCategoryExposure[] {
  return (exposureData.assetCategoryBreakdown ?? []) as AssetCategoryExposure[];
}

export function getInsights(): InsightItem[] {
  return exposureData.insights as InsightItem[];
}

// ── Assessment ──

export function getAssessmentPresets(): AssessmentResult[] {
  return assessmentData.presets as AssessmentResult[];
}

export function getBuildingCategories(): string[] {
  return assessmentData.buildingCategories;
}

export function getHeightRanges() {
  return assessmentData.heightRanges;
}

// ── Statistics / Charts ──

export function getWindSpeedTimeline() {
  return statisticsData.cycloneFani.windSpeedTimeline;
}

export function getPressureTimeline() {
  return statisticsData.cycloneFani.pressureTimeline;
}

export function getDistrictExposureChart() {
  return statisticsData.cycloneFani.districtExposureChart;
}

export function getImpactSummary() {
  return statisticsData.cycloneFani.impactSummary;
}
