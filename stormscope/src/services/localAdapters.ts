import type {
  AssessmentInput,
  AssessmentResult,
  CycloneEvent,
  District,
  DistrictScenarioAnalysis,
} from "@/types";
import { computeScenarioDistrictAnalysis } from "@/lib/engine";
import {
  evaluateSiteExposure,
  type SpatialGeoContext,
} from "@/lib/assessment";
import {
  validateCycloneCSVInput,
  validateGeoJSONInput,
} from "@/lib/pipeline";
import type {
  IAssessmentEngine,
  IExposureEngine,
  IHazardEngine,
  IReportingEngine,
  IValidationEngine,
} from "@/services/contracts";

export const LocalHazardService: IHazardEngine = {
  async analyzeDistricts(cyclone: CycloneEvent, districts: District[]) {
    return computeScenarioDistrictAnalysis(cyclone, districts);
  },
  getHealth() {
    return {
      service: "HazardEngine",
      mode: "local-mvp-adapter",
      ready: true,
    };
  },
};

export const LocalExposureService: IExposureEngine = {
  async summarizeScenario(analyses: DistrictScenarioAnalysis[]) {
    const totalBuildings = analyses.reduce(
      (sum, d) => sum + d.potentiallyExposedBuildings,
      0
    );
    const totalRoads = analyses.reduce(
      (sum, d) => sum + d.potentiallyExposedRoads,
      0
    );
    const totalSettlements = analyses.reduce(
      (sum, d) => sum + d.potentiallyExposedSettlements,
      0
    );
    const averageIndex = Number(
      (
        analyses.reduce((sum, d) => sum + d.exposureIndex, 0) /
        Math.max(1, analyses.length)
      ).toFixed(1)
    );
    const coastal = analyses.filter((d) => d.coastal);
    const inland = analyses.filter((d) => !d.coastal);
    const coastalAverage = Number(
      (
        coastal.reduce((sum, d) => sum + d.exposureIndex, 0) /
        Math.max(1, coastal.length)
      ).toFixed(1)
    );
    const inlandAverage = Number(
      (
        inland.reduce((sum, d) => sum + d.exposureIndex, 0) /
        Math.max(1, inland.length)
      ).toFixed(1)
    );
    return {
      totalBuildings,
      totalRoads,
      totalSettlements,
      averageIndex,
      coastalAverage,
      inlandAverage,
    };
  },
  getHealth() {
    return {
      service: "ExposureEngine",
      mode: "local-mvp-adapter",
      ready: true,
    };
  },
};

export const LocalAssessmentService: IAssessmentEngine = {
  async evaluateSite(input: AssessmentInput, context?: SpatialGeoContext) {
    return evaluateSiteExposure(input, context);
  },
  getHealth() {
    return {
      service: "AssessmentEngine",
      mode: "local-mvp-adapter",
      ready: true,
    };
  },
};

export const LocalValidationService: IValidationEngine = {
  async validateGeoJSON(raw, name, sourceLabel) {
    return validateGeoJSONInput(raw, name, sourceLabel);
  },
  async validateCycloneCSV(raw, name, year, landfallRegion, sourceLabel) {
    return validateCycloneCSVInput(raw, name, year, landfallRegion, sourceLabel);
  },
  getHealth() {
    return {
      service: "ValidationEngine",
      mode: "local-mvp-adapter",
      ready: true,
    };
  },
};

export const LocalReportingService: IReportingEngine = {
  buildScenarioMarkdownReport(
    cyclone: CycloneEvent,
    analyses: DistrictScenarioAnalysis[]
  ): string {
    const top5 = analyses.slice(0, 5);
    const totalBuildings = analyses.reduce(
      (sum, d) => sum + d.potentiallyExposedBuildings,
      0
    );
    const totalRoads = analyses.reduce(
      (sum, d) => sum + d.potentiallyExposedRoads,
      0
    );
    return [
      `# StormScope Historical Exposure Brief`,
      ``,
      `- **Event**: ${cyclone.name} (${cyclone.year})`,
      `- **Category**: ${cyclone.category}`,
      `- **Landfall Region**: ${cyclone.landfallRegion} (${cyclone.landfallDate})`,
      `- **Peak Wind / Min Pressure**: ${cyclone.maxWindSpeed} km/h | ${cyclone.minPressure} hPa`,
      `- **Potentially Exposed Buildings (Odisha)**: ${totalBuildings.toLocaleString("en-IN")}`,
      `- **Potentially Exposed Roads (Odisha)**: ${totalRoads.toLocaleString("en-IN")} km`,
      ``,
      `## Top 5 Exposed Districts`,
      ``,
      `| District | Composite Index | Hazard Tier | Wind Score | Surge Score | Terrain Score |`,
      `| --- | --- | --- | --- | --- | --- |`,
      ...top5.map(
        (d) =>
          `| ${d.districtName} | ${d.exposureIndex}/100 | ${d.hazardCategory} | ${d.windScore} | ${d.surgeScore} | ${d.terrainScore} |`
      ),
      ``,
      `---`,
      `*Note: Historical exposure indicators only. Not structural engineering analysis, weather forecasting, or construction approval.*`,
    ].join("\n");
  },

  buildAssessmentMarkdownReport(
    input: AssessmentInput,
    result: AssessmentResult
  ): string {
    return [
      `# StormScope Site Exposure Assessment Brief`,
      ``,
      `- **Location**: ${result.location}`,
      `- **Coordinates**: ${input.latitude.toFixed(4)}°N, ${input.longitude.toFixed(4)}°E`,
      `- **Building Profile**: ${input.buildingCategory} (${input.buildingHeight} m)`,
      `- **Historical Exposure Index**: ${result.exposureIndex} / 100 (${result.overallCategory})`,
      `- **Flood Susceptibility**: ${result.floodIndicator}`,
      `- **Terrain Indicator**: ${result.terrainIndicator}`,
      `- **Planning Guidance**: ${result.recommendation}`,
      ``,
      `## Indicator Details`,
      ...result.details.map(
        (d) => `- **${d.label} (${d.value} — ${d.level})**: ${d.interpretation}`
      ),
      ``,
      `---`,
      `*Disclaimer: Evaluates historical environmental exposure indicators only. Does not constitute structural engineering analysis, safety certification, or construction approval.*`,
    ].join("\n");
  },

  getHealth() {
    return {
      service: "ReportingEngine",
      mode: "local-mvp-adapter",
      ready: true,
    };
  },
};

/** Helper to trigger browser download of a text/JSON/Markdown report */
export function downloadReportFile(
  filename: string,
  content: string,
  mimeType = "text/markdown;charset=utf-8"
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
