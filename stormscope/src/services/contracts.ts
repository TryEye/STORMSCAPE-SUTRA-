import type {
  AssessmentInput,
  AssessmentResult,
  CycloneEvent,
  District,
  DistrictScenarioAnalysis,
} from "@/types";
import type {
  DatasetValidationResult,
} from "@/lib/pipeline";
import type { SpatialGeoContext } from "@/lib/assessment";

/**
 * Future-compatible service contracts per Architecture.md §10.
 * In Phase 1–4 MVP these are backed by local JSON/GeoJSON adapters;
 * future phases can swap in API Gateway / containerized GIS engines
 * without modifying UI components.
 */

export interface ServiceHealthInfo {
  service: string;
  mode: "local-mvp-adapter";
  ready: boolean;
}

export interface IHazardEngine {
  analyzeDistricts(
    cyclone: CycloneEvent,
    districts: District[]
  ): Promise<DistrictScenarioAnalysis[]>;
  getHealth(): ServiceHealthInfo;
}

export interface IExposureEngine {
  summarizeScenario(
    analyses: DistrictScenarioAnalysis[]
  ): Promise<{
    totalBuildings: number;
    totalRoads: number;
    totalSettlements: number;
    averageIndex: number;
    coastalAverage: number;
    inlandAverage: number;
  }>;
  getHealth(): ServiceHealthInfo;
}

export interface IAssessmentEngine {
  evaluateSite(
    input: AssessmentInput,
    context?: SpatialGeoContext
  ): Promise<AssessmentResult>;
  getHealth(): ServiceHealthInfo;
}

export interface IValidationEngine {
  validateGeoJSON(raw: string, name: string, sourceLabel?: string): Promise<DatasetValidationResult>;
  validateCycloneCSV(
    raw: string,
    name: string,
    year: number,
    landfallRegion: string,
    sourceLabel?: string
  ): Promise<DatasetValidationResult>;
  getHealth(): ServiceHealthInfo;
}

export interface IReportingEngine {
  buildScenarioMarkdownReport(
    cyclone: CycloneEvent,
    analyses: DistrictScenarioAnalysis[]
  ): string;
  buildAssessmentMarkdownReport(
    input: AssessmentInput,
    result: AssessmentResult
  ): string;
  getHealth(): ServiceHealthInfo;
}
