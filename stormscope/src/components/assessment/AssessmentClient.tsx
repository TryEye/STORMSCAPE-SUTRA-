"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import {
  AlertCircle,
  Compass,
  Download,
  Droplets,
  GitCompare,
  Info,
  MapPin,
  Mountain,
  Radar,
  ShieldAlert,
} from "lucide-react";
import MapView from "@/components/maps/MapView";
import ScenarioComparison from "@/components/assessment/ScenarioComparison";
import {
  HazardBadge,
  MetricCard,
  PageHeader,
  SectionCard,
} from "@/components/ui/Cards";
import {
  getAssessmentPresets,
  getBuildingCategories,
  getHeightRanges,
} from "@/data";
import { useDataRegistry } from "@/context/DataRegistryContext";
import type { StormScopeGeoData } from "@/data/geo.server";
import { evaluateSiteExposure } from "@/lib/assessment";
import {
  LocalReportingService,
  downloadReportFile,
} from "@/services";
import {
  addCycloneTrackLayers,
  addDistrictLayers,
  addFloodZoneLayers,
  addHazardZoneLayers,
  addInfrastructureLayers,
} from "@/maps/layers";
import { cn, getHazardColor } from "@/lib/utils";
import type { AssessmentResult, BuildingCategory } from "@/types";

interface AssessmentClientProps {
  geoData: StormScopeGeoData;
}

export default function AssessmentClient({ geoData }: AssessmentClientProps) {
  const { cyclones } = useDataRegistry();
  const presets = getAssessmentPresets();
  const categories = getBuildingCategories() as BuildingCategory[];
  const heightRanges = getHeightRanges();
  const fani = cyclones[0];

  const [activeTab, setActiveTab] = useState<"site" | "comparison">("site");

  const defaultPreset = presets[0];
  const [latitude, setLatitude] = useState<string>(
    String(defaultPreset?.coordinates.lat ?? 19.8135)
  );
  const [longitude, setLongitude] = useState<string>(
    String(defaultPreset?.coordinates.lng ?? 85.8312)
  );
  const [buildingCategory, setBuildingCategory] =
    useState<BuildingCategory>("School");
  const [selectedHeightLabel, setSelectedHeightLabel] = useState<string>(
    heightRanges[0]?.label ?? "Low-rise (1-3 floors)"
  );

  const selectedHeightMeters = useMemo(() => {
    const found = heightRanges.find((h) => h.label === selectedHeightLabel);
    return found ? Math.round((found.min + found.max) / 2) : 8;
  }, [heightRanges, selectedHeightLabel]);

  const spatialContext = useMemo(
    () => ({
      districts: geoData.districts,
      hazardZones: geoData.hazardZones,
      floodZones: geoData.floodZones,
      cyclones,
    }),
    [geoData, cyclones]
  );

  const [result, setResult] = useState<AssessmentResult>(() =>
    evaluateSiteExposure(
      {
        latitude: defaultPreset?.coordinates.lat ?? 19.8135,
        longitude: defaultPreset?.coordinates.lng ?? 85.8312,
        buildingCategory: "School",
        buildingHeight: 8,
      },
      spatialContext
    )
  );

  const mapRef = useRef<maplibregl.Map | null>(null);
  const markerRef = useRef<maplibregl.Marker | null>(null);

  const parsedLat = Number.isFinite(Number(latitude))
    ? Number(latitude)
    : 19.8135;
  const parsedLng = Number.isFinite(Number(longitude))
    ? Number(longitude)
    : 85.8312;

  const syncMarker = useCallback(
    (lat: number, lng: number, levelColor: string) => {
      const map = mapRef.current;
      if (!map) return;

      markerRef.current?.remove();
      const el = document.createElement("div");
      el.className = "flex items-center justify-center";
      el.innerHTML = `<div style="width:18px;height:18px;border-radius:9999px;background:${levelColor};border:3px solid #07111D;box-shadow:0 0 0 6px ${levelColor}33;"></div>`;

      markerRef.current = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .addTo(map);
    },
    []
  );

  const handleMapLoad = useCallback(
    (map: maplibregl.Map) => {
      mapRef.current = map;
      addDistrictLayers(map, geoData.districts);
      addHazardZoneLayers(map, geoData.hazardZones);
      addFloodZoneLayers(map, geoData.floodZones);
      addInfrastructureLayers(map, geoData.infrastructure);
      if (fani) {
        addCycloneTrackLayers(map, fani);
      }

      syncMarker(
        result.coordinates.lat,
        result.coordinates.lng,
        getHazardColor(result.overallCategory)
      );

      map.on("click", (e) => {
        const nextLat = Number(e.lngLat.lat.toFixed(4));
        const nextLng = Number(e.lngLat.lng.toFixed(4));
        setLatitude(String(nextLat));
        setLongitude(String(nextLng));
        const evaluated = evaluateSiteExposure(
          {
            latitude: nextLat,
            longitude: nextLng,
            buildingCategory,
            buildingHeight: selectedHeightMeters,
          },
          spatialContext
        );
        setResult(evaluated);
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    syncMarker(
      result.coordinates.lat,
      result.coordinates.lng,
      getHazardColor(result.overallCategory)
    );
  }, [result, syncMarker]);

  const handleRunAssessment = (e: React.FormEvent) => {
    e.preventDefault();
    const evaluated = evaluateSiteExposure(
      {
        latitude: parsedLat,
        longitude: parsedLng,
        buildingCategory,
        buildingHeight: selectedHeightMeters,
      },
      spatialContext
    );
    setResult(evaluated);
  };

  const handleSelectPreset = (preset: AssessmentResult) => {
    setLatitude(String(preset.coordinates.lat));
    setLongitude(String(preset.coordinates.lng));
    const evaluated = evaluateSiteExposure(
      {
        latitude: preset.coordinates.lat,
        longitude: preset.coordinates.lng,
        buildingCategory,
        buildingHeight: selectedHeightMeters,
      },
      spatialContext
    );
    setResult(evaluated);
  };

  const handleExportSummary = () => {
    const payload = {
      platform: "StormScope — Phase 4 Assessment Engine",
      disclaimer:
        "Historical environmental exposure indicators only. Not structural engineering analysis or construction approval.",
      input: {
        latitude: result.coordinates.lat,
        longitude: result.coordinates.lng,
        buildingCategory,
        heightClass: selectedHeightLabel,
      },
      result,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `stormscope-assessment-${result.coordinates.lat.toFixed(2)}N-${result.coordinates.lng.toFixed(2)}E.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportMarkdown = () => {
    const md = LocalReportingService.buildAssessmentMarkdownReport(
      {
        latitude: result.coordinates.lat,
        longitude: result.coordinates.lng,
        buildingCategory,
        buildingHeight: selectedHeightMeters,
      },
      result
    );
    downloadReportFile(
      `stormscope-site-brief-${result.coordinates.lat.toFixed(2)}N-${result.coordinates.lng.toFixed(2)}E.md`,
      md
    );
  };

  const summaryCategoryLabel =
    result.overallCategory === "High"
      ? "High Historical Exposure"
      : result.overallCategory === "Moderate"
        ? "Moderate Historical Exposure"
        : "Low Historical Exposure";

  return (
    <div className="min-h-screen bg-deep-ocean text-cloud-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* ── Page Header + Mode Switcher ── */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <PageHeader
            title="Assessment & Scenario Engine"
            subtitle="Evaluate historical environmental exposure indicators for a proposed site or compare Odisha district hazard profiles across cyclone scenarios."
          />

          <div className="flex flex-wrap items-center gap-2 pb-8">
            <button
              type="button"
              onClick={() => setActiveTab("site")}
              className={cn(
                "inline-flex items-center gap-2 rounded-[10px] border px-4 py-2 text-xs font-semibold transition-colors duration-[150ms]",
                activeTab === "site"
                  ? "bg-horizon-blue text-deep-ocean border-horizon-blue"
                  : "bg-ocean-surface text-mist-gray border-border-subtle hover:text-cloud-white"
              )}
            >
              <Compass className="h-3.5 w-3.5" />
              Site Exposure Workstation
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("comparison")}
              className={cn(
                "inline-flex items-center gap-2 rounded-[10px] border px-4 py-2 text-xs font-semibold transition-colors duration-[150ms]",
                activeTab === "comparison"
                  ? "bg-horizon-blue text-deep-ocean border-horizon-blue"
                  : "bg-ocean-surface text-mist-gray border-border-subtle hover:text-cloud-white"
              )}
            >
              <GitCompare className="h-3.5 w-3.5" />
              Scenario & District Comparison
            </button>
          </div>
        </div>

        {activeTab === "comparison" ? (
          <ScenarioComparison />
        ) : (
          <>
            {/* ── Planning Workstation Split: Input Panel + Site Overview Map ── */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Input Panel */}
              <form
                onSubmit={handleRunAssessment}
                className="lg:col-span-5 rounded-[24px] bg-ocean-surface border border-border-subtle p-6 sm:p-8 space-y-6"
              >
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-horizon-blue">
                    Site Configuration
                  </p>
                  <h2 className="font-heading text-xl font-semibold text-cloud-white mt-1">
                    Location & Structure Profile
                  </h2>
                </div>

                {/* Preset Quick Locations */}
                <div className="space-y-2">
                  <p className="text-xs font-medium text-mist-gray">
                    Reference Odisha Locations
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {presets.map((preset) => {
                      const isActive =
                        Math.abs(preset.coordinates.lat - parsedLat) < 0.01 &&
                        Math.abs(preset.coordinates.lng - parsedLng) < 0.01;
                      return (
                        <button
                          key={preset.location}
                          type="button"
                          onClick={() => handleSelectPreset(preset)}
                          className={cn(
                            "rounded-[10px] border px-3 py-2 text-left transition-colors duration-[150ms]",
                            isActive
                              ? "bg-horizon-blue/15 border-horizon-blue/45 text-cloud-white"
                              : "bg-deep-ocean/70 border-border-subtle text-mist-gray hover:text-cloud-white hover:border-border"
                          )}
                        >
                          <p className="text-xs font-semibold truncate">
                            {preset.location}
                          </p>
                          <p
                            className="text-[11px] mt-0.5"
                            style={{
                              color: getHazardColor(preset.overallCategory),
                            }}
                          >
                            {preset.overallCategory}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="lat-input"
                      className="block text-xs font-medium text-mist-gray"
                    >
                      Latitude (°N)
                    </label>
                    <input
                      id="lat-input"
                      type="number"
                      step="0.0001"
                      min={17.0}
                      max={23.0}
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="w-full rounded-[10px] bg-deep-ocean border border-border px-3.5 py-2.5 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="lng-input"
                      className="block text-xs font-medium text-mist-gray"
                    >
                      Longitude (°E)
                    </label>
                    <input
                      id="lng-input"
                      type="number"
                      step="0.0001"
                      min={81.0}
                      max={88.0}
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="w-full rounded-[10px] bg-deep-ocean border border-border px-3.5 py-2.5 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* Building Category */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="building-category"
                    className="block text-xs font-medium text-mist-gray"
                  >
                    Building Category
                  </label>
                  <select
                    id="building-category"
                    value={buildingCategory}
                    onChange={(e) =>
                      setBuildingCategory(e.target.value as BuildingCategory)
                    }
                    className="w-full rounded-[10px] bg-deep-ocean border border-border px-3.5 py-2.5 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Building Height */}
                <div className="space-y-1.5">
                  <label
                    htmlFor="building-height"
                    className="block text-xs font-medium text-mist-gray"
                  >
                    Building Height Class
                  </label>
                  <select
                    id="building-height"
                    value={selectedHeightLabel}
                    onChange={(e) => setSelectedHeightLabel(e.target.value)}
                    className="w-full rounded-[10px] bg-deep-ocean border border-border px-3.5 py-2.5 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                  >
                    {heightRanges.map((hr) => (
                      <option key={hr.label} value={hr.label}>
                        {hr.label} ({hr.min}–{hr.max}m)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex flex-col sm:flex-row gap-2.5">
                  <button
                    type="submit"
                    className="flex-1 rounded-[10px] bg-horizon-blue px-5 py-3 text-sm font-semibold text-deep-ocean hover:bg-horizon-blue/90 transition-colors duration-[150ms]"
                  >
                    Run Assessment
                  </button>
                  <button
                    type="button"
                    onClick={handleExportSummary}
                    className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-border bg-deep-ocean px-3.5 py-3 text-xs font-medium text-cloud-white hover:border-horizon-blue/40 transition-colors duration-[150ms]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    JSON
                  </button>
                  <button
                    type="button"
                    onClick={handleExportMarkdown}
                    className="inline-flex items-center justify-center gap-1.5 rounded-[10px] border border-border bg-deep-ocean px-3.5 py-3 text-xs font-medium text-monsoon-teal hover:border-monsoon-teal/40 transition-colors duration-[150ms]"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Brief
                  </button>
                </div>

                <p className="text-[11px] text-storm-gray leading-relaxed">
                  Tip: Click any point on the Site Overview Map to evaluate
                  real-time district, flood-zone, and multi-cyclone intersection.
                </p>
              </form>

              {/* Site Overview Map */}
              <div className="lg:col-span-7 space-y-4">
                <MapView
                  center={[result.coordinates.lng, result.coordinates.lat]}
                  zoom={7.6}
                  bayOfBengalLand={geoData.bayOfBengalLand}
                  odishaGeo={geoData.odisha}
                  onLoad={handleMapLoad}
                  className="h-[420px] lg:h-[500px] w-full"
                >
                  <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-[14px] glass-panel px-4 py-3">
                    <div className="flex items-center gap-2 text-xs text-horizon-blue font-medium uppercase tracking-wider">
                      <MapPin className="h-3.5 w-3.5" />
                      Evaluated Site
                    </div>
                    <p className="mt-1 font-heading text-sm font-semibold text-cloud-white">
                      {result.location}
                    </p>
                    <p className="text-[11px] text-mist-gray mt-0.5">
                      {result.coordinates.lat.toFixed(4)}°N,{" "}
                      {result.coordinates.lng.toFixed(4)}°E · {buildingCategory}
                    </p>
                  </div>
                </MapView>
              </div>
            </section>

            {/* ── Exposure Indicators ── */}
            <section
              aria-label="Historical Exposure Indicators"
              className="space-y-4"
            >
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-horizon-blue">
                  Site Indicator Profile
                </p>
                <h2 className="font-heading text-xl font-semibold text-cloud-white mt-1">
                  Historical Exposure Indicators
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                  label="Historical Exposure Index"
                  value={`${result.exposureIndex} / 100`}
                  interpretation="Composite historical exposure score for selected site"
                  hazardLevel={result.overallCategory}
                  icon={Compass}
                />
                <MetricCard
                  label="Flood Susceptibility Indicator"
                  value={result.floodIndicator}
                  interpretation="Estimated historical storm surge & drainage exposure"
                  hazardLevel={result.floodIndicator}
                  icon={Droplets}
                />
                <MetricCard
                  label="Terrain Indicator"
                  value={result.terrainIndicator}
                  interpretation="Topographic elevation and coastal proximity context"
                  icon={Mountain}
                />
                <MetricCard
                  label="Cyclone Frequency Indicator"
                  value={result.cycloneFrequencyIndicator}
                  interpretation="Historical cyclonic track incidence in local corridor"
                  hazardLevel={result.cycloneFrequencyIndicator}
                  icon={Radar}
                />
              </div>
            </section>

            {/* ── Phase 4: Multi-Factor Score Decomposition & Multi-Cyclone Site Sensitivity ── */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {result.factorBreakdown && (
                <SectionCard
                  title="Analytical Factor Decomposition"
                  subtitle="Repeatable weighted sub-scores contributing to the site exposure index"
                  className="lg:col-span-5"
                >
                  <div className="space-y-4 pt-2">
                    {[
                      {
                        label: "Wind Corridor Proximity (40%)",
                        score: result.factorBreakdown.windExposure,
                        color: "#38BDF8",
                      },
                      {
                        label: "Flood & Surge Susceptibility (25%)",
                        score: result.factorBreakdown.floodSurge,
                        color: "#2DD4BF",
                      },
                      {
                        label: "Terrain Elevation Vulnerability (20%)",
                        score: result.factorBreakdown.terrainVulnerability,
                        color: "#F59E0B",
                      },
                      {
                        label: "Structure Profile Sensitivity (15%)",
                        score: result.factorBreakdown.structureSensitivity,
                        color: "#D6C3A5",
                      },
                    ].map((factor) => (
                      <div key={factor.label} className="space-y-1.5">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-mist-gray">{factor.label}</span>
                          <span className="font-mono font-semibold text-cloud-white">
                            {factor.score} / 100
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-deep-ocean overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-300"
                            style={{
                              width: `${factor.score}%`,
                              backgroundColor: factor.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              )}

              {result.scenarioComparisons && (
                <SectionCard
                  title="Multi-Cyclone Site Sensitivity"
                  subtitle="How this exact coordinate scores across historical Bay of Bengal cyclone tracks"
                  className="lg:col-span-7"
                >
                  <div className="overflow-x-auto pt-2">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-border-subtle text-mist-gray">
                          <th className="py-2 pr-4 font-medium">Scenario</th>
                          <th className="py-2 pr-4 font-medium">Track Dist.</th>
                          <th className="py-2 pr-4 font-medium">Est. Site Wind</th>
                          <th className="py-2 pr-4 font-medium">Exposure Index</th>
                          <th className="py-2 font-medium">Hazard Tier</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border-subtle">
                        {result.scenarioComparisons.map((sc) => (
                          <tr key={sc.cycloneId}>
                            <td className="py-2.5 pr-4 font-semibold text-cloud-white">
                              {sc.cycloneName} ({sc.year})
                            </td>
                            <td className="py-2.5 pr-4 font-mono text-mist-gray">
                              {sc.nearestTrackKm} km
                            </td>
                            <td className="py-2.5 pr-4 font-mono text-horizon-blue">
                              {sc.estimatedPeakWindAtSite} km/h
                            </td>
                            <td className="py-2.5 pr-4 font-mono font-semibold text-cloud-white">
                              {sc.exposureIndex} / 100
                            </td>
                            <td className="py-2.5">
                              <HazardBadge level={sc.hazardCategory} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              )}
            </section>

            {/* ── Assessment Summary & Development Guidance ── */}
            <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Assessment Summary */}
              <SectionCard
                title="Assessment Summary"
                subtitle="Interpretation of regional historical indicators"
                className="lg:col-span-5"
              >
                <div className="space-y-5 pt-2">
                  <div
                    className="rounded-[16px] border p-5"
                    style={{
                      borderColor: `${getHazardColor(result.overallCategory)}40`,
                      backgroundColor: `${getHazardColor(result.overallCategory)}10`,
                    }}
                  >
                    <p className="text-xs font-medium uppercase tracking-wider text-mist-gray">
                      Overall Exposure Classification
                    </p>
                    <p
                      className="mt-1.5 font-heading text-2xl font-bold"
                      style={{ color: getHazardColor(result.overallCategory) }}
                    >
                      {summaryCategoryLabel}
                    </p>
                    <p className="mt-2 text-xs text-mist-gray leading-relaxed">
                      Based on historical cyclone footprint data, terrain zone (
                      {result.terrainIndicator}), and {buildingCategory} profile.
                    </p>
                  </div>

                  <div className="rounded-[16px] bg-deep-ocean/70 border border-border-subtle p-5">
                    <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-horizon-blue">
                      <ShieldAlert className="h-4 w-4" />
                      Planning Guidance
                    </div>
                    <p className="mt-2 font-heading text-xl font-semibold text-cloud-white">
                      {result.recommendation}
                    </p>
                    <p className="mt-2 text-xs text-mist-gray leading-relaxed">
                      {result.recommendation === "Requires Detailed Assessment"
                        ? "High historical coastal exposure warrants comprehensive site-specific flood, elevation, and wind-corridor review during early planning."
                        : result.recommendation ===
                            "Additional Investigation Recommended"
                          ? "Moderate historical exposure suggests reviewing local drainage patterns and wind-corridor orientation prior to final site layout."
                          : "Low historical exposure relative to coastal Odisha; standard regional planning practices remain advisable."}
                    </p>
                  </div>
                </div>
              </SectionCard>

              {/* Indicator Breakdown */}
              <SectionCard
                title="Detailed Indicator Breakdown"
                subtitle="Transparent reasoning behind each historical exposure metric"
                className="lg:col-span-7"
              >
                <div className="space-y-3 pt-2">
                  {result.details.map((detail) => (
                    <div
                      key={detail.label}
                      className="rounded-[14px] bg-deep-ocean/60 border border-border-subtle p-4 flex flex-col sm:flex-row sm:items-start justify-between gap-3"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2.5">
                          <h3 className="font-heading text-sm font-semibold text-cloud-white">
                            {detail.label}
                          </h3>
                          <HazardBadge level={detail.level} />
                        </div>
                        <p className="text-xs text-mist-gray leading-relaxed">
                          {detail.interpretation}
                        </p>
                      </div>
                      <span className="font-heading text-base font-semibold text-horizon-blue shrink-0">
                        {detail.value}
                      </span>
                    </div>
                  ))}
                </div>
              </SectionCard>
            </section>
          </>
        )}

        {/* ── Non-Engineering Disclaimer Banner ── */}
        <section aria-label="Methodology Disclaimer">
          <div className="rounded-[18px] bg-ocean-surface/80 border border-border p-5 flex items-start gap-4">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-horizon-blue/10 border border-horizon-blue/20 mt-0.5">
              <Info className="h-4 w-4 text-horizon-blue" />
            </div>
            <div className="space-y-1">
              <h3 className="font-heading text-sm font-semibold text-cloud-white flex items-center gap-2">
                Scope & Analytical Boundary
                <AlertCircle className="h-3.5 w-3.5 text-mist-gray" />
              </h3>
              <p className="text-xs text-mist-gray leading-relaxed">
                This assessment evaluates historical environmental exposure
                indicators only. It does not perform structural engineering
                analysis, predict building collapse or structural performance,
                or constitute safety certification or construction approval.
                Outputs should be interpreted as historical planning context for
                research and educational use.
              </p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
