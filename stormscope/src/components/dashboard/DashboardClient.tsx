"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as maplibregl from "maplibre-gl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  Compass,
  Download,
  Filter,
  Layers,
  MapPin,
  Maximize2,
  Mountain,
  Radar,
  RotateCcw,
  Route,
  ShieldAlert,
  SlidersHorizontal,
  Users,
} from "lucide-react";
import {
  LocalReportingService,
  downloadReportFile,
} from "@/services";
import MapView from "@/components/maps/MapView";
import { HazardBadge, MetricCard, SectionCard } from "@/components/ui/Cards";
import {
  getAssetCategoryBreakdown,
  getDistricts,
  getExposureSummary,
  getInsights,
} from "@/data";
import { useDataRegistry } from "@/context/DataRegistryContext";
import type { StormScopeGeoData } from "@/data/geo.server";
import {
  buildScenarioDistrictsGeoJSON,
  computeScenarioDistrictAnalysis,
} from "@/lib/engine";
import {
  addDistrictLayers,
  updateDistrictLayerData,
  addHazardZoneLayers,
  addFloodZoneLayers,
  addElevationLayers,
  addRainfallLayers,
  addCycloneTrackLayers,
  updateCycloneTrackData,
  upsertCustomOverlayLayer,
  addInfrastructureLayers,
  setLayerGroupVisibility,
  setLayerOpacity,
  type HoveredDistrictInfo,
} from "@/maps/layers";
import { ODISHA_CENTER, ODISHA_ZOOM } from "@/lib/constants";
import { cn, formatNumber, getHazardColor } from "@/lib/utils";
import type { HazardLevel } from "@/types";

const HAZARD_FILTERS: Array<HazardLevel | "All"> = [
  "All",
  "Extreme",
  "High",
  "Moderate",
  "Low",
];

function getInsightIcon(iconName: string) {
  switch (iconName) {
    case "AlertTriangle":
      return AlertTriangle;
    case "Building2":
      return Building2;
    case "Mountain":
      return Mountain;
    default:
      return Compass;
  }
}

interface DashboardClientProps {
  geoData: StormScopeGeoData;
}

export default function DashboardClient({ geoData }: DashboardClientProps) {
  const { cyclones, customOverlays, toggleOverlayVisibility } = useDataRegistry();
  const districts = getDistricts();
  const summary = getExposureSummary();
  const assetCategories = getAssetCategoryBreakdown();
  const insights = getInsights();

  const [selectedCycloneId, setSelectedCycloneId] = useState<string>(
    cyclones[0]?.id ?? "fani"
  );
  const [selectedDistrictId, setSelectedDistrictId] = useState<string>("all");
  const [hazardFilter, setHazardFilter] = useState<HazardLevel | "All">("All");
  const [regionFilter, setRegionFilter] = useState<"all" | "coastal" | "inland">(
    "all"
  );
  const [hoveredDistrict, setHoveredDistrict] =
    useState<HoveredDistrictInfo | null>(null);
  const [showLayerDrawer, setShowLayerDrawer] = useState<boolean>(false);
  const [hazardOpacity, setHazardOpacity] = useState<number>(0.24);

  // Independent layer visibility controls (DataStrategy.md §10 & Phases.md Phase 2/3)
  const [layers, setLayers] = useState({
    districts: true,
    hazard: true,
    flood: true,
    elevation: false,
    rainfall: false,
    cyclone: true,
    infrastructure: true,
  });

  const mapInstanceRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);

  const selectedCyclone = useMemo(
    () => cyclones.find((c) => c.id === selectedCycloneId) ?? cyclones[0],
    [cyclones, selectedCycloneId]
  );

  // Phase 4: Repeatable scenario-based district scoring
  const scenarioAnalyses = useMemo(
    () => computeScenarioDistrictAnalysis(selectedCyclone, districts),
    [selectedCyclone, districts]
  );

  const scenarioDistrictsGeo = useMemo(
    () => buildScenarioDistrictsGeoJSON(geoData.districts, scenarioAnalyses),
    [geoData.districts, scenarioAnalyses]
  );

  const scenarioSummary = useMemo(() => {
    const totalBuildings = scenarioAnalyses.reduce(
      (acc, d) => acc + d.potentiallyExposedBuildings,
      0
    );
    const totalRoads = scenarioAnalyses.reduce(
      (acc, d) => acc + d.potentiallyExposedRoads,
      0
    );
    const totalSettlements = scenarioAnalyses.reduce(
      (acc, d) => acc + d.potentiallyExposedSettlements,
      0
    );
    const avgIndex = Number(
      (
        scenarioAnalyses.reduce((acc, d) => acc + d.exposureIndex, 0) /
        Math.max(1, scenarioAnalyses.length)
      ).toFixed(1)
    );
    const coastal = scenarioAnalyses.filter((d) => d.coastal);
    const inland = scenarioAnalyses.filter((d) => !d.coastal);
    const coastalMean = Number(
      (
        coastal.reduce((acc, d) => acc + d.exposureIndex, 0) /
        Math.max(1, coastal.length)
      ).toFixed(1)
    );
    const inlandMean = Number(
      (
        inland.reduce((acc, d) => acc + d.exposureIndex, 0) /
        Math.max(1, inland.length)
      ).toFixed(1)
    );
    const topDistrict = scenarioAnalyses[0];
    return {
      totalBuildings,
      totalRoads,
      totalSettlements,
      avgIndex,
      coastalMean,
      inlandMean,
      topDistrict,
    };
  }, [scenarioAnalyses]);

  const selectedDistrict = useMemo(
    () => districts.find((d) => d.id === selectedDistrictId) ?? null,
    [districts, selectedDistrictId]
  );

  const selectedDistrictScenario = useMemo(
    () =>
      scenarioAnalyses.find((d) => d.districtId === selectedDistrictId) ?? null,
    [scenarioAnalyses, selectedDistrictId]
  );

  const filteredChartData = useMemo(() => {
    let base =
      hazardFilter === "All"
        ? scenarioAnalyses
        : scenarioAnalyses.filter((d) => d.hazardCategory === hazardFilter);
    if (regionFilter === "coastal") {
      base = base.filter((d) => d.coastal);
    } else if (regionFilter === "inland") {
      base = base.filter((d) => !d.coastal);
    }
    return [...base]
      .sort((a, b) => b.exposureIndex - a.exposureIndex)
      .slice(0, 12);
  }, [scenarioAnalyses, hazardFilter, regionFilter]);

  const activeBounds = useMemo(
    () => (selectedDistrict?.bbox ? selectedDistrict.bbox : null),
    [selectedDistrict]
  );

  const activeCenter: [number, number] = useMemo(() => {
    if (selectedDistrict?.centroid) {
      return selectedDistrict.centroid;
    }
    return ODISHA_CENTER;
  }, [selectedDistrict]);

  const activeZoom = selectedDistrict ? 8.2 : ODISHA_ZOOM;

  const handleMapLoad = useCallback(
    (map: maplibregl.Map) => {
      mapInstanceRef.current = map;

      addDistrictLayers(map, scenarioDistrictsGeo, {
        selectedDistrictId:
          selectedDistrictId === "all" ? null : selectedDistrictId,
        onDistrictHover: (info) => setHoveredDistrict(info),
        onDistrictClick: (id, name, exposureIndex, hazardCategory, lngLat) => {
          setSelectedDistrictId(id);
          popupRef.current?.remove();
          popupRef.current = new maplibregl.Popup({
            closeButton: true,
            offset: 10,
          })
            .setLngLat(lngLat)
            .setHTML(
              `<div class="space-y-1">
                <p class="font-semibold text-sm text-[#F8FAFC]">${name} District</p>
                <p class="text-xs text-[#94A3B8]">Exposure Index: <span class="text-[#38BDF8] font-medium">${exposureIndex}/100</span></p>
                <p class="text-xs text-[#94A3B8]">Hazard Level: <span class="font-medium text-[#F8FAFC]">${hazardCategory}</span></p>
              </div>`
            )
            .addTo(map);
        },
      });

      addHazardZoneLayers(map, geoData.hazardZones);
      addFloodZoneLayers(map, geoData.floodZones);
      addElevationLayers(map, geoData.demElevation, false);
      addRainfallLayers(map, geoData.rainfallBands, false);

      if (selectedCyclone) {
        addCycloneTrackLayers(map, selectedCyclone, {
          onTrackPointClick: (props) => {
            popupRef.current?.remove();
            popupRef.current = new maplibregl.Popup({
              closeButton: true,
              offset: 10,
            })
              .setLngLat(props.lngLat)
              .setHTML(
                `<div class="space-y-1">
                  <p class="font-semibold text-sm text-[#F8FAFC]">${props.category}</p>
                  <p class="text-xs text-[#94A3B8]">Wind: <span class="text-[#38BDF8] font-medium">${props.windSpeed} km/h</span></p>
                  <p class="text-xs text-[#94A3B8]">Pressure: ${props.pressure} hPa</p>
                </div>`
              )
              .addTo(map);
          },
        });
      }

      addInfrastructureLayers(map, geoData.infrastructure, {
        onAssetClick: (props) => {
          popupRef.current?.remove();
          popupRef.current = new maplibregl.Popup({
            closeButton: true,
            offset: 10,
          })
            .setLngLat(props.lngLat)
            .setHTML(
              `<div class="space-y-1">
                <p class="font-semibold text-sm text-[#F8FAFC]">${props.name}</p>
                <p class="text-xs text-[#94A3B8]">Category: ${props.category} · Exposure: ${props.exposure}</p>
                ${
                  props.buildings
                    ? `<p class="text-xs text-[#2DD4BF]">Cluster Buildings: ${props.buildings.toLocaleString("en-IN")}</p>`
                    : ""
                }
              </div>`
            )
            .addTo(map);
        },
      });

      for (const ov of customOverlays) {
        upsertCustomOverlayLayer(map, ov.id, ov.geojson, ov.color, ov.visible);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // Sync district selection, hazard filter & opacity to MapLibre layers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (map.getLayer("districts-highlight")) {
      map.setFilter("districts-highlight", [
        "==",
        ["get", "id"],
        selectedDistrictId === "all" ? "" : selectedDistrictId,
      ]);
    }

    if (map.getLayer("districts-fill")) {
      if (hazardFilter === "All") {
        map.setFilter("districts-fill", null);
        map.setPaintProperty("districts-fill", "fill-opacity", [
          "case",
          ["==", ["get", "id"], selectedDistrictId],
          Math.min(0.65, hazardOpacity + 0.18),
          hazardOpacity,
        ]);
      } else {
        map.setFilter("districts-fill", [
          "==",
          ["get", "hazardCategory"],
          hazardFilter,
        ]);
        map.setPaintProperty(
          "districts-fill",
          "fill-opacity",
          Math.min(0.65, hazardOpacity + 0.12)
        );
      }
    }

    setLayerOpacity(
      map,
      "hazard-zones-fill",
      "fill-opacity",
      Math.max(0.08, hazardOpacity * 0.75)
    );
    setLayerOpacity(
      map,
      "flood-zones-fill",
      "fill-opacity",
      Math.max(0.1, hazardOpacity * 0.9)
    );
  }, [selectedDistrictId, hazardFilter, hazardOpacity]);

  // Sync layer visibility toggles + cyclone track + custom ingested overlays
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !map.isStyleLoaded()) return;

    if (selectedCyclone) {
      updateCycloneTrackData(map, selectedCyclone);
    }
    updateDistrictLayerData(map, scenarioDistrictsGeo);

    setLayerGroupVisibility(
      map,
      [
        "districts-fill",
        "districts-outline",
        "districts-hover",
        "districts-highlight",
      ],
      layers.districts
    );
    setLayerGroupVisibility(
      map,
      ["hazard-zones-fill", "hazard-zones-outline"],
      layers.hazard
    );
    setLayerGroupVisibility(
      map,
      ["flood-zones-fill", "flood-zones-outline"],
      layers.flood
    );
    setLayerGroupVisibility(
      map,
      ["dem-elevation-fill", "dem-elevation-outline"],
      layers.elevation
    );
    setLayerGroupVisibility(
      map,
      ["rainfall-fill", "rainfall-outline"],
      layers.rainfall
    );
    setLayerGroupVisibility(
      map,
      ["cyclone-track-glow", "cyclone-track-line", "cyclone-track-points"],
      layers.cyclone
    );
    setLayerGroupVisibility(
      map,
      ["infrastructure-roads", "infrastructure-settlements"],
      layers.infrastructure
    );

    for (const ov of customOverlays) {
      upsertCustomOverlayLayer(map, ov.id, ov.geojson, ov.color, ov.visible);
    }
  }, [layers, selectedCyclone, scenarioDistrictsGeo, customOverlays]);

  const handleReset = () => {
    setSelectedCycloneId(cyclones[0]?.id ?? "fani");
    setSelectedDistrictId("all");
    setHazardFilter("All");
    setRegionFilter("all");
    setHazardOpacity(0.24);
    setLayers({
      districts: true,
      hazard: true,
      flood: true,
      elevation: false,
      rainfall: false,
      cyclone: true,
      infrastructure: true,
    });
    popupRef.current?.remove();
    mapInstanceRef.current?.flyTo({
      center: ODISHA_CENTER,
      zoom: ODISHA_ZOOM,
      duration: 450,
    });
  };

  // Active metrics for Top Summary & Exposure Snapshot (Phase 4 scenario-driven)
  const activeHazardCategory: HazardLevel = selectedDistrictScenario
    ? selectedDistrictScenario.hazardCategory
    : scenarioSummary.topDistrict?.hazardCategory ?? "High";
  const activeExposureIndex = selectedDistrictScenario
    ? selectedDistrictScenario.exposureIndex
    : scenarioSummary.avgIndex;

  const exposedBuildings = selectedDistrictScenario
    ? selectedDistrictScenario.potentiallyExposedBuildings
    : scenarioSummary.totalBuildings;
  const exposedRoads = selectedDistrictScenario
    ? selectedDistrictScenario.potentiallyExposedRoads
    : scenarioSummary.totalRoads;
  const exposedSettlements = selectedDistrictScenario
    ? selectedDistrictScenario.potentiallyExposedSettlements
    : scenarioSummary.totalSettlements;
  const areaMetric = selectedDistrict
    ? selectedDistrict.area
    : summary.estimatedHazardArea;

  return (
    <div className="min-h-screen bg-deep-ocean text-cloud-white py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
        {/* ── Header Title Row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-horizon-blue">
              Phase 4 Assessment Engine · 30 Odisha Districts
            </p>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold text-cloud-white mt-1">
              Historical Exposure Dashboard
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (!selectedCyclone) return;
                const md = LocalReportingService.buildScenarioMarkdownReport(
                  selectedCyclone,
                  scenarioAnalyses
                );
                downloadReportFile(
                  `stormscope-${selectedCyclone.id}-exposure-brief.md`,
                  md
                );
              }}
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-border bg-ocean-surface px-3.5 py-2 text-xs font-medium text-cloud-white hover:border-horizon-blue/40 transition-colors duration-[150ms]"
            >
              <Download className="h-3.5 w-3.5 text-horizon-blue" />
              Export Brief
            </button>
            <Link
              href="/pipeline"
              className="rounded-[10px] border border-monsoon-teal/35 bg-monsoon-teal/10 px-3.5 py-2 text-xs font-medium text-monsoon-teal hover:bg-monsoon-teal/15 transition-colors duration-[150ms]"
            >
              Ingest / Validate Data
            </Link>
            <Link
              href="/explorer"
              className="rounded-[10px] border border-border bg-ocean-surface px-3.5 py-2 text-xs font-medium text-mist-gray hover:text-cloud-white hover:border-horizon-blue/35 transition-colors duration-[150ms]"
            >
              Inspect Cyclone Track
            </Link>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-horizon-blue px-3.5 py-2 text-xs font-semibold text-deep-ocean hover:bg-horizon-blue/90 transition-colors duration-[150ms]"
            >
              Site Assessment
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ── 1. Top Summary Layer ── */}
        <section aria-label="Dashboard Summary">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Cyclone Selected"
              value={`${selectedCyclone?.name ?? "Cyclone Fani"} (${selectedCyclone?.year ?? 2019})`}
              interpretation={`${selectedCyclone?.category ?? "Extremely Severe"} · Landfall ${selectedCyclone?.landfallRegion ?? "Puri"}`}
              icon={Radar}
            />
            <MetricCard
              label="District Selected"
              value={selectedDistrict ? selectedDistrict.name : "All Odisha (30)"}
              interpretation={
                selectedDistrict
                  ? `${selectedDistrict.elevationTier ?? "Regional Zone"} · Pop. ${formatNumber(selectedDistrict.population)}`
                  : "Hover or click any of Odisha's 30 districts on the map"
              }
              icon={MapPin}
            />
            <MetricCard
              label="Hazard Category"
              value={activeHazardCategory}
              interpretation={
                selectedDistrictScenario
                  ? `${selectedDistrictScenario.coastal ? "Coastal" : "Inland"} · Wind ${selectedDistrictScenario.windScore}/100 · Surge ${selectedDistrictScenario.surgeScore}/100`
                  : `Peak district: ${scenarioSummary.topDistrict?.districtName ?? "Puri"} (${scenarioSummary.topDistrict?.exposureIndex ?? 92}/100)`
              }
              hazardLevel={activeHazardCategory}
              icon={ShieldAlert}
            />
            <MetricCard
              label="Historical Exposure Index"
              value={`${activeExposureIndex} / 100`}
              interpretation={
                selectedDistrictScenario
                  ? `${selectedDistrictScenario.districtName} under ${selectedCyclone?.name}`
                  : `Coastal mean ${scenarioSummary.coastalMean} vs Inland ${scenarioSummary.inlandMean}`
              }
              hazardLevel={activeHazardCategory}
              icon={Compass}
            />
          </div>
        </section>

        {/* ── 2. Analysis Controls (Above Map) ── */}
        <section aria-label="Analysis Controls">
          <div className="rounded-[18px] bg-ocean-surface border border-border-subtle p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Cyclone Selector */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="cyclone-select"
                  className="text-xs font-medium text-mist-gray"
                >
                  Cyclone
                </label>
                <select
                  id="cyclone-select"
                  value={selectedCycloneId}
                  onChange={(e) => setSelectedCycloneId(e.target.value)}
                  className="rounded-[10px] bg-deep-ocean border border-border px-3 py-1.5 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                >
                  {cyclones.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.year})
                    </option>
                  ))}
                </select>
              </div>

              {/* District Selector (All 30 Districts) */}
              <div className="flex items-center gap-2">
                <label
                  htmlFor="district-select"
                  className="text-xs font-medium text-mist-gray"
                >
                  District
                </label>
                <select
                  id="district-select"
                  value={selectedDistrictId}
                  onChange={(e) => setSelectedDistrictId(e.target.value)}
                  className="rounded-[10px] bg-deep-ocean border border-border px-3 py-1.5 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                >
                  <option value="all">All Odisha Districts (30)</option>
                  {scenarioAnalyses.map((d) => (
                    <option key={d.districtId} value={d.districtId}>
                      {d.districtName} — {d.exposureIndex}/100 ({d.hazardCategory})
                    </option>
                  ))}
                </select>
              </div>

              {/* Risk Filter */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-mist-gray mr-1">
                  <Filter className="h-3.5 w-3.5" />
                  Risk:
                </span>
                {HAZARD_FILTERS.map((level) => {
                  const active = hazardFilter === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setHazardFilter(level)}
                      className={cn(
                        "rounded-[10px] px-2.5 py-1 text-xs font-medium transition-colors duration-[150ms] border",
                        active
                          ? "bg-horizon-blue/15 text-horizon-blue border-horizon-blue/40"
                          : "bg-deep-ocean/70 text-mist-gray border-border-subtle hover:text-cloud-white"
                      )}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Layer Drawer Toggle & Reset */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowLayerDrawer((prev) => !prev)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-[10px] border px-3 py-1.5 text-xs font-medium transition-colors duration-[150ms]",
                  showLayerDrawer
                    ? "bg-monsoon-teal/15 text-monsoon-teal border-monsoon-teal/40"
                    : "bg-deep-ocean text-mist-gray border-border-subtle hover:text-cloud-white"
                )}
              >
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Layer Controls
              </button>

              <button
                type="button"
                onClick={() => setSelectedDistrictId("all")}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-border-subtle bg-deep-ocean px-3 py-1.5 text-xs font-medium text-mist-gray hover:text-cloud-white hover:border-border transition-colors duration-[150ms]"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                Fit Odisha
              </button>

              <button
                type="button"
                onClick={handleReset}
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-border-subtle bg-deep-ocean px-3 py-1.5 text-xs font-medium text-mist-gray hover:text-cloud-white hover:border-border transition-colors duration-[150ms]"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                Reset
              </button>
            </div>
          </div>
        </section>

        {/* ── 3. Map Layer (Primary Dominant Surface) ── */}
        <section aria-label="Geospatial Exposure Map">
          <div className="relative">
            <MapView
              center={activeCenter}
              zoom={activeZoom}
              fitBounds={activeBounds}
              bayOfBengalLand={geoData.bayOfBengalLand}
              odishaGeo={geoData.odisha}
              onLoad={handleMapLoad}
              className="h-[540px] lg:h-[640px] w-full"
            >
              {/* Hover / Selection Telemetry Pill */}
              <div className="absolute top-4 left-4 z-10 rounded-[16px] glass-panel px-4 py-3 max-w-xs">
                {hoveredDistrict ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] uppercase tracking-wider text-monsoon-teal">
                        District Inspection
                      </span>
                      <HazardBadge level={hoveredDistrict.hazardCategory} />
                    </div>
                    <p className="font-heading text-base font-semibold text-cloud-white">
                      {hoveredDistrict.name}
                    </p>
                    <p className="text-xs text-mist-gray">
                      Exposure Index:{" "}
                      <span className="text-horizon-blue font-semibold">
                        {hoveredDistrict.exposureIndex}/100
                      </span>
                      {hoveredDistrict.elevationTier
                        ? ` · ${hoveredDistrict.elevationTier}`
                        : ""}
                    </p>
                  </div>
                ) : selectedDistrict ? (
                  <div className="flex items-center gap-3">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-horizon-blue">
                        Focused District
                      </p>
                      <p className="font-heading text-base font-semibold text-cloud-white">
                        {selectedDistrict.name} ({selectedDistrict.exposureIndex}/100)
                      </p>
                      <p className="text-[11px] text-mist-gray">
                        {selectedDistrict.elevationTier}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedDistrictId("all")}
                      className="rounded-[8px] border border-border-subtle px-2 py-1 text-[11px] text-mist-gray hover:text-cloud-white"
                    >
                      All
                    </button>
                  </div>
                ) : (
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-horizon-blue">
                      Active Coverage
                    </p>
                    <p className="font-heading text-sm font-semibold text-cloud-white mt-0.5">
                      Odisha · 30 Administrative Districts
                    </p>
                    <p className="text-[11px] text-mist-gray mt-0.5">
                      Hover or click any district, track node, or facility
                    </p>
                  </div>
                )}
              </div>

              {/* Floating Interactive Layer & Opacity Drawer */}
              {showLayerDrawer && (
                <div className="absolute top-4 right-14 z-10 w-64 rounded-[16px] glass-panel p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-cloud-white">
                      <Layers className="h-3.5 w-3.5 text-horizon-blue" />
                      Spatial Layers
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowLayerDrawer(false)}
                      className="text-[11px] text-mist-gray hover:text-cloud-white"
                    >
                      Close
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    {(
                      [
                        ["districts", "30 District Boundaries"],
                        ["hazard", "Wind Hazard Corridors"],
                        ["flood", "Coastal Flood / Surge Zones"],
                        ["elevation", "SRTM DEM Elevation Bands"],
                        ["rainfall", "GPM / IMD Rainfall Swaths"],
                        ["cyclone", "Selected Cyclone Track"],
                        ["infrastructure", "Roads & Critical Assets"],
                      ] as const
                    ).map(([key, label]) => (
                      <label
                        key={key}
                        className="flex items-center justify-between rounded-[8px] bg-deep-ocean/60 px-2.5 py-1.5 text-xs text-mist-gray hover:text-cloud-white cursor-pointer"
                      >
                        <span>{label}</span>
                        <input
                          type="checkbox"
                          checked={layers[key]}
                          onChange={() =>
                            setLayers((prev) => ({
                              ...prev,
                              [key]: !prev[key],
                            }))
                          }
                          className="accent-[#38BDF8]"
                        />
                      </label>
                    ))}
                  </div>

                  {customOverlays.length > 0 && (
                    <div className="pt-1 space-y-1.5 border-t border-border-subtle">
                      <p className="text-[10px] font-medium uppercase tracking-wider text-monsoon-teal">
                        Ingested Datasets ({customOverlays.length})
                      </p>
                      {customOverlays.map((ov) => (
                        <label
                          key={ov.id}
                          className="flex items-center justify-between rounded-[8px] bg-deep-ocean/60 px-2.5 py-1.5 text-xs text-mist-gray hover:text-cloud-white cursor-pointer"
                        >
                          <span className="truncate pr-2">{ov.name}</span>
                          <input
                            type="checkbox"
                            checked={ov.visible}
                            onChange={() => toggleOverlayVisibility(ov.id)}
                            className="accent-[#2DD4BF]"
                          />
                        </label>
                      ))}
                    </div>
                  )}

                  <div className="pt-1 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-mist-gray">
                      <span>Overlay Opacity</span>
                      <span className="font-mono text-horizon-blue">
                        {Math.round(hazardOpacity * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0.1}
                      max={0.6}
                      step={0.05}
                      value={hazardOpacity}
                      onChange={(e) => setHazardOpacity(Number(e.target.value))}
                      className="w-full accent-[#38BDF8]"
                      aria-label="Overlay Opacity"
                    />
                  </div>
                </div>
              )}

              {/* Floating Cartographic Legend */}
              <div className="absolute bottom-4 left-4 z-10 rounded-[16px] glass-panel px-4 py-3 max-w-md">
                <div className="flex items-center justify-between gap-4 mb-2">
                  <span className="text-xs font-semibold uppercase tracking-wider text-cloud-white">
                    Cartographic Legend
                  </span>
                  {selectedDistrict && (
                    <HazardBadge level={selectedDistrict.hazardCategory} />
                  )}
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-1.5 text-[11px] text-mist-gray">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-hazard-extreme" />
                    Extreme
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-hazard-high" />
                    High
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-hazard-moderate" />
                    Moderate
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-hazard-low" />
                    Low
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-sm bg-[#0EA5E9]" />
                    Flood / Surge
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-terrain-sand" />
                    Shelters / Roads
                  </span>
                </div>
              </div>
            </MapView>
          </div>
        </section>

        {/* ── 4. Exposure Snapshot Layer ── */}
        <section aria-label="Infrastructure Exposure Snapshot">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Potentially Exposed Buildings"
              value={formatNumber(exposedBuildings)}
              interpretation={
                selectedDistrict
                  ? `Estimated structures within ${selectedDistrict.name}`
                  : "Cumulative structures across 30 Odisha districts"
              }
              icon={Building2}
            />
            <MetricCard
              label="Potentially Exposed Roads"
              value={`${formatNumber(exposedRoads)} km`}
              interpretation="Coastal highways & district arterial corridors"
              icon={Route}
            />
            <MetricCard
              label="Potentially Exposed Settlements"
              value={formatNumber(exposedSettlements)}
              interpretation="Urban hubs and rural cluster nodes"
              icon={Users}
            />
            <MetricCard
              label={
                selectedDistrict ? "District Area" : "Estimated Hazard Area"
              }
              value={`${formatNumber(areaMetric)} km²`}
              interpretation={
                selectedDistrict
                  ? `Coastline: ${selectedDistrict.coastalLength ?? 0} km`
                  : "Spatial extent of elevated wind & surge corridor"
              }
              icon={ShieldAlert}
            />
          </div>
        </section>

        {/* ── 5. Phase 2 Analytics: District Comparison + Asset Breakdown + Insights ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* District Exposure Horizontal Bar Chart */}
          <SectionCard
            title="District Historical Exposure Comparison"
            subtitle="Top 12 districts matching active filters (click a bar to zoom)"
            className="lg:col-span-7"
          >
            <div className="flex flex-wrap items-center gap-2 pb-3">
              {(
                [
                  ["all", "All (30)"],
                  ["coastal", "Coastal Only"],
                  ["inland", "Inland Only"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setRegionFilter(key)}
                  className={cn(
                    "rounded-[8px] px-2.5 py-1 text-xs font-medium border transition-colors duration-[150ms]",
                    regionFilter === key
                      ? "bg-horizon-blue/15 text-horizon-blue border-horizon-blue/40"
                      : "bg-deep-ocean/60 text-mist-gray border-border-subtle hover:text-cloud-white"
                  )}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="h-[340px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={filteredChartData}
                  layout="vertical"
                  margin={{ top: 4, right: 20, left: 20, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.1)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    domain={[0, 100]}
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="districtName"
                    stroke="#F8FAFC"
                    fontSize={12}
                    width={105}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(56, 189, 248, 0.06)" }}
                    contentStyle={{
                      backgroundColor: "#0F1E33",
                      border: "1px solid rgba(56, 189, 248, 0.2)",
                      borderRadius: "10px",
                      color: "#F8FAFC",
                      fontSize: "12px",
                    }}
                    formatter={(value) => [`${value} / 100`, "Exposure Index"]}
                  />
                  <Bar
                    dataKey="exposureIndex"
                    radius={[0, 6, 6, 0]}
                    barSize={18}
                    onClick={(_entry, index) => {
                      const clicked = filteredChartData[index];
                      if (clicked?.districtId) {
                        setSelectedDistrictId(clicked.districtId);
                      }
                    }}
                    className="cursor-pointer"
                  >
                    {filteredChartData.map((entry) => (
                      <Cell
                        key={entry.districtId}
                        fill={getHazardColor(entry.hazardCategory)}
                        fillOpacity={
                          selectedDistrictId === "all" ||
                          selectedDistrictId === entry.districtId
                            ? 0.9
                            : 0.35
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          {/* Insights & Coastal Contrast Panel */}
          <div className="lg:col-span-5 space-y-4">
            {insights.map((insight) => {
              const Icon = getInsightIcon(insight.icon);
              return (
                <div
                  key={insight.id}
                  className="rounded-[18px] bg-ocean-surface border border-border-subtle p-5 hover:border-border transition-colors duration-[250ms]"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-horizon-blue/10 border border-horizon-blue/20 mt-0.5">
                      <Icon className="h-4 w-4 text-horizon-blue" />
                    </div>
                    <div>
                      <h3 className="font-heading text-sm font-semibold text-cloud-white">
                        {insight.title}
                      </h3>
                      <p className="mt-1 text-xs text-mist-gray leading-relaxed">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 6. Asset Category Exposure Breakdown (Phase 2 Analytics) ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SectionCard
            title="Potentially Exposed Structures by Asset Category"
            subtitle="Distribution across Odisha built-environment categories"
            className="lg:col-span-7"
          >
            <div className="h-[250px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={assetCategories}
                  layout="vertical"
                  margin={{ top: 4, right: 24, left: 20, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.1)"
                    horizontal={false}
                  />
                  <XAxis
                    type="number"
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="category"
                    stroke="#F8FAFC"
                    fontSize={12}
                    width={130}
                    tickLine={false}
                  />
                  <Tooltip
                    cursor={{ fill: "rgba(45, 212, 191, 0.06)" }}
                    contentStyle={{
                      backgroundColor: "#0F1E33",
                      border: "1px solid rgba(45, 212, 191, 0.25)",
                      borderRadius: "10px",
                      color: "#F8FAFC",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [
                      `${Number(val).toLocaleString("en-IN")} structures`,
                      "Exposed Estimate",
                    ]}
                  />
                  <Bar
                    dataKey="exposedCount"
                    radius={[0, 6, 6, 0]}
                    barSize={18}
                    fill="#38BDF8"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Coastal vs. Inland Exposure Contrast"
            subtitle="Comparative vulnerability across Odisha topography"
            className="lg:col-span-5"
          >
            <div className="space-y-4 pt-2">
              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-mist-gray">
                    Coastal Districts (6 districts)
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-hazard-high">
                    {scenarioSummary.coastalMean} / 100
                  </p>
                </div>
                <HazardBadge level="High" size="md" />
              </div>

              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4 flex items-center justify-between">
                <div>
                  <p className="text-xs text-mist-gray">
                    Inland & Highland Districts (24 districts)
                  </p>
                  <p className="mt-1 font-heading text-xl font-bold text-hazard-low">
                    {scenarioSummary.inlandMean} / 100
                  </p>
                </div>
                <HazardBadge level="Low" size="md" />
              </div>

              <p className="text-xs text-mist-gray leading-relaxed">
                Coastal districts along the Chilika–Puri–Mahanadi delta corridor
                exhibit over twice the historical exposure score of western plateau
                districts due to direct landfall winds and low-lying surge zones.
              </p>
            </div>
          </SectionCard>
        </section>

        {/* ── 7. Recommendations Layer ── */}
        <section aria-label="Planning Recommendations">
          <SectionCard
            title="Planning Context & Next Steps"
            subtitle="Historical exposure indicators support preliminary spatial planning rather than structural engineering certification."
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-hazard-high">
                  Coastal Corridor Priority
                </p>
                <p className="mt-1.5 text-sm text-cloud-white font-medium">
                  Puri, Jagatsinghpur & Kendrapara
                </p>
                <p className="mt-1 text-xs text-mist-gray leading-relaxed">
                  Direct coastal exposure and low deltaic elevation warrant
                  detailed flood-surge and elevation review before critical
                  facility siting.
                </p>
              </div>

              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-monsoon-teal">
                  Infrastructure Lifelines
                </p>
                <p className="mt-1.5 text-sm text-cloud-white font-medium">
                  NH-16, NH-316 & Port Corridors
                </p>
                <p className="mt-1 text-xs text-mist-gray leading-relaxed">
                  Major arterial highways and deep-water ports (Paradeep, Dhamra)
                  intersect elevated wind and tidal flood zones along the coast.
                </p>
              </div>

              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4 flex flex-col justify-between">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wider text-horizon-blue">
                    Site-Level Spatial Query
                  </p>
                  <p className="mt-1.5 text-sm text-cloud-white font-medium">
                    Evaluate Proposed Coordinates
                  </p>
                  <p className="mt-1 text-xs text-mist-gray leading-relaxed">
                    Click any point in Odisha in the Assessment workstation to run
                    live district, flood-zone, and hazard-corridor intersection.
                  </p>
                </div>
                <Link
                  href="/assessment"
                  className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-horizon-blue hover:underline"
                >
                  Open Assessment Workstation
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          </SectionCard>
        </section>
      </div>
    </div>
  );
}
