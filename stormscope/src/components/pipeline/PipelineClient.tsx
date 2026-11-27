"use client";

import { useState } from "react";
import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  CloudRain,
  Database,
  FileCode2,
  Layers,
  Map as MapIcon,
  Mountain,
  Radar,
  Satellite,
  Trash2,
  Upload,
  XCircle,
} from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui/Cards";
import { useDataRegistry } from "@/context/DataRegistryContext";
import {
  SAMPLE_INGESTION_PRESETS,
  validateCycloneCSVInput,
  validateGeoJSONInput,
  type DatasetValidationResult,
} from "@/lib/pipeline";
import { cn } from "@/lib/utils";

const INTEGRATED_SOURCES = [
  {
    id: "imd",
    name: "IMD Best-Track Archive",
    provider: "India Meteorological Department",
    format: "Normalized JSON / CSV",
    coverage: "Fani (2019), Phailin (2013), Dana (2024)",
    status: "Integrated",
    icon: Radar,
  },
  {
    id: "srtm",
    name: "SRTM 30m DEM Bands",
    provider: "NASA / USGS Elevation",
    format: "GeoJSON Polygons (EPSG:4326)",
    coverage: "Odisha Coastal (<15m) to Highland (>150m)",
    status: "Integrated",
    icon: Mountain,
  },
  {
    id: "gpm",
    name: "NASA GPM / IMD Rainfall",
    provider: "NASA EarthData / IMD",
    format: "GeoJSON Precipitation Bands",
    coverage: "24h Extreme & Very Heavy Rainfall Swaths",
    status: "Integrated",
    icon: CloudRain,
  },
  {
    id: "osm",
    name: "OpenStreetMap Infrastructure",
    provider: "OSM Highway & Facility Extracts",
    format: "GeoJSON LineString & Point",
    coverage: "NH-16/316/53/55, Ports, Hospitals, Shelters",
    status: "Integrated",
    icon: MapIcon,
  },
  {
    id: "sentinel",
    name: "Sentinel-1 SAR Flood Extent",
    provider: "Copernicus / ESA",
    format: "GeoJSON Inundation Polygons",
    coverage: "Coastal Delta + Custom Ingestion Ready",
    status: "Pipeline Ready",
    icon: Satellite,
  },
];

export default function PipelineClient() {
  const {
    cyclones,
    customCyclones,
    customOverlays,
    registerCyclone,
    registerOverlay,
    toggleOverlayVisibility,
    removeOverlay,
  } = useDataRegistry();

  const [datasetType, setDatasetType] = useState<"geojson" | "cyclone-track">(
    "cyclone-track"
  );
  const [datasetName, setDatasetName] = useState("Cyclone Hudhud");
  const [cycloneYear, setCycloneYear] = useState("2014");
  const [landfallRegion, setLandfallRegion] = useState(
    "Visakhapatnam / Southern Odisha"
  );
  const [sourceLabel, setSourceLabel] = useState(
    "IMD Best-Track Archive (Sample)"
  );
  const [rawInput, setRawInput] = useState(SAMPLE_INGESTION_PRESETS[0].payload);
  const [overlayColor, setOverlayColor] = useState("#2DD4BF");

  const [validation, setValidation] = useState<DatasetValidationResult | null>(
    () =>
      validateCycloneCSVInput(
        SAMPLE_INGESTION_PRESETS[0].payload,
        "Cyclone Hudhud",
        2014,
        "Visakhapatnam / Southern Odisha",
        "IMD Best-Track Archive (Sample)"
      )
  );
  const [ingestedBanner, setIngestedBanner] = useState<string | null>(null);

  const handleSelectSample = (
    sample: (typeof SAMPLE_INGESTION_PRESETS)[number]
  ) => {
    setIngestedBanner(null);
    setDatasetType(sample.kind);
    setDatasetName(sample.name);
    setSourceLabel(sample.sourceLabel);
    setRawInput(sample.payload);
    if (sample.kind === "cyclone-track") {
      setCycloneYear(String(sample.year));
      setLandfallRegion(sample.landfallRegion);
      setValidation(
        validateCycloneCSVInput(
          sample.payload,
          sample.name,
          sample.year,
          sample.landfallRegion,
          sample.sourceLabel
        )
      );
    } else {
      setOverlayColor(sample.color);
      setValidation(
        validateGeoJSONInput(sample.payload, sample.name, sample.sourceLabel)
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIngestedBanner(null);
    const reader = new FileReader();
    reader.onload = () => {
      const content = String(reader.result ?? "");
      const isCsv = file.name.toLowerCase().endsWith(".csv");
      const cleanName = file.name.replace(/\.(geojson|json|csv)$/i, "");
      setDatasetName(cleanName);
      setSourceLabel(`Uploaded File (${file.name})`);
      setRawInput(content);
      if (isCsv) {
        setDatasetType("cyclone-track");
        setValidation(
          validateCycloneCSVInput(
            content,
            cleanName,
            Number(cycloneYear) || 2020,
            landfallRegion,
            `Uploaded File (${file.name})`
          )
        );
      } else {
        setDatasetType("geojson");
        setValidation(
          validateGeoJSONInput(
            content,
            cleanName,
            `Uploaded File (${file.name})`
          )
        );
      }
    };
    reader.readAsText(file);
  };

  const handleValidate = () => {
    setIngestedBanner(null);
    if (datasetType === "cyclone-track") {
      setValidation(
        validateCycloneCSVInput(
          rawInput,
          datasetName || "Custom Cyclone",
          Number(cycloneYear) || 2020,
          landfallRegion || "Odisha Coast",
          sourceLabel
        )
      );
    } else {
      setValidation(
        validateGeoJSONInput(
          rawInput,
          datasetName || "Custom GeoJSON Layer",
          sourceLabel
        )
      );
    }
  };

  const handlePushToPlatform = () => {
    if (!validation || !validation.valid) return;

    if (
      validation.datasetType === "cyclone-track" &&
      validation.normalizedCyclone
    ) {
      registerCyclone(validation.normalizedCyclone);
      setIngestedBanner(
        `Registered "${validation.normalizedCyclone.name}" (${validation.featureCount} track nodes) into Dashboard & Cyclone Explorer.`
      );
    } else if (
      validation.datasetType === "geojson" &&
      validation.normalizedGeoJSON
    ) {
      const idSlug = (validation.name || "overlay")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      registerOverlay({
        id: idSlug || `layer-${Date.now()}`,
        name: validation.name,
        sourceLabel: validation.sourceLabel,
        color: overlayColor,
        featureCount: validation.featureCount,
        geojson: validation.normalizedGeoJSON,
        visible: true,
      });
      setIngestedBanner(
        `Registered GeoJSON overlay "${validation.name}" (${validation.featureCount} features) onto the Dashboard map.`
      );
    }
  };

  return (
    <div className="min-h-screen bg-deep-ocean text-cloud-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <PageHeader
            title="Data Integration & Validation Hub"
            subtitle="Phase 3 ingestion pipelines for IMD cyclone tracks, SRTM elevation, NASA GPM precipitation, OpenStreetMap assets, and Sentinel-1 flood extents."
          />
          <div className="flex items-center gap-3 pb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-horizon-blue px-4 py-2 text-xs font-semibold text-deep-ocean hover:bg-horizon-blue/90 transition-colors duration-[150ms]"
            >
              Open Dashboard Map
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>

        {/* ── 1. Integrated External Source Adapters ── */}
        <section className="space-y-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-horizon-blue">
              Phase 3 Source Catalog
            </p>
            <h2 className="font-heading text-xl font-bold text-cloud-white mt-1">
              Connected & Pipeline-Ready Environmental Datasets
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {INTEGRATED_SOURCES.map((src) => {
              const Icon = src.icon;
              return (
                <div
                  key={src.id}
                  className="rounded-[18px] bg-ocean-surface border border-border-subtle p-4 flex flex-col justify-between gap-3"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-horizon-blue/10 border border-horizon-blue/20">
                        <Icon className="h-4 w-4 text-horizon-blue" />
                      </div>
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-medium border border-monsoon-teal/30 bg-monsoon-teal/10 text-monsoon-teal">
                        {src.status}
                      </span>
                    </div>
                    <h3 className="font-heading text-sm font-semibold text-cloud-white">
                      {src.name}
                    </h3>
                    <p className="text-[11px] text-mist-gray leading-relaxed">
                      {src.coverage}
                    </p>
                  </div>
                  <p className="text-[10px] font-mono text-storm-gray pt-2 border-t border-border-subtle">
                    {src.format}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 2. Ingestion & Validation Workbench ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Dataset Input & Samples */}
          <SectionCard
            title="Dataset Import & Processing Pipeline"
            subtitle="Load a GeoJSON polygon/point layer or IMD-style cyclone track CSV, validate schema & bounds, and dispatch to map layers."
            className="lg:col-span-7"
          >
            <div className="space-y-5 pt-2">
              {/* One-Click Sample Presets */}
              <div className="space-y-2">
                <p className="text-xs font-medium text-mist-gray">
                  Load Reference Ingestion Sample
                </p>
                <div className="flex flex-wrap gap-2">
                  {SAMPLE_INGESTION_PRESETS.map((sample) => (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleSelectSample(sample)}
                      className={cn(
                        "rounded-[10px] border px-3 py-1.5 text-xs font-medium transition-colors duration-[150ms]",
                        datasetName === sample.name
                          ? "bg-horizon-blue/15 border-horizon-blue/40 text-horizon-blue"
                          : "bg-deep-ocean/70 border-border-subtle text-mist-gray hover:text-cloud-white"
                      )}
                    >
                      {sample.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Type + Upload */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="dataset-type"
                    className="block text-xs font-medium text-mist-gray"
                  >
                    Pipeline Schema Type
                  </label>
                  <select
                    id="dataset-type"
                    value={datasetType}
                    onChange={(e) =>
                      setDatasetType(
                        e.target.value as "geojson" | "cyclone-track"
                      )
                    }
                    className="w-full rounded-[10px] bg-deep-ocean border border-border px-3 py-2 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                  >
                    <option value="cyclone-track">
                      Cyclone Track (CSV: lat, lng, windSpeed, pressure)
                    </option>
                    <option value="geojson">
                      Geospatial Overlay (GeoJSON FeatureCollection)
                    </option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="dataset-file"
                    className="block text-xs font-medium text-mist-gray"
                  >
                    Upload Local File (.geojson, .json, .csv)
                  </label>
                  <label
                    htmlFor="dataset-file"
                    className="flex items-center justify-center gap-2 rounded-[10px] border border-dashed border-border bg-deep-ocean/60 px-3 py-2 text-xs text-mist-gray hover:border-horizon-blue/50 hover:text-cloud-white cursor-pointer transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5 text-horizon-blue" />
                    Choose GeoJSON or CSV file
                    <input
                      id="dataset-file"
                      type="file"
                      accept=".geojson,.json,.csv"
                      onChange={handleFileUpload}
                      className="sr-only"
                    />
                  </label>
                </div>
              </div>

              {/* Metadata Inputs */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label
                    htmlFor="dataset-name"
                    className="block text-xs font-medium text-mist-gray"
                  >
                    Dataset / Event Name
                  </label>
                  <input
                    id="dataset-name"
                    type="text"
                    value={datasetName}
                    onChange={(e) => setDatasetName(e.target.value)}
                    className="w-full rounded-[10px] bg-deep-ocean border border-border px-3 py-2 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                  />
                </div>

                {datasetType === "cyclone-track" ? (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="cyclone-year"
                        className="block text-xs font-medium text-mist-gray"
                      >
                        Year
                      </label>
                      <input
                        id="cyclone-year"
                        type="number"
                        value={cycloneYear}
                        onChange={(e) => setCycloneYear(e.target.value)}
                        className="w-full rounded-[10px] bg-deep-ocean border border-border px-3 py-2 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="landfall-region"
                        className="block text-xs font-medium text-mist-gray"
                      >
                        Landfall Region
                      </label>
                      <input
                        id="landfall-region"
                        type="text"
                        value={landfallRegion}
                        onChange={(e) => setLandfallRegion(e.target.value)}
                        className="w-full rounded-[10px] bg-deep-ocean border border-border px-3 py-2 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="source-label"
                        className="block text-xs font-medium text-mist-gray"
                      >
                        Source Attribution
                      </label>
                      <input
                        id="source-label"
                        type="text"
                        value={sourceLabel}
                        onChange={(e) => setSourceLabel(e.target.value)}
                        className="w-full rounded-[10px] bg-deep-ocean border border-border px-3 py-2 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label
                        htmlFor="overlay-color"
                        className="block text-xs font-medium text-mist-gray"
                      >
                        Layer Accent Color
                      </label>
                      <select
                        id="overlay-color"
                        value={overlayColor}
                        onChange={(e) => setOverlayColor(e.target.value)}
                        className="w-full rounded-[10px] bg-deep-ocean border border-border px-3 py-2 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
                      >
                        <option value="#2DD4BF">Monsoon Teal</option>
                        <option value="#38BDF8">Horizon Blue</option>
                        <option value="#F59E0B">Warning Amber</option>
                        <option value="#D6C3A5">Terrain Sand</option>
                      </select>
                    </div>
                  </>
                )}
              </div>

              {/* Raw Payload Editor */}
              <div className="space-y-1.5">
                <label
                  htmlFor="raw-payload"
                  className="flex items-center gap-1.5 text-xs font-medium text-mist-gray"
                >
                  <FileCode2 className="h-3.5 w-3.5 text-horizon-blue" />
                  Raw Dataset Payload
                </label>
                <textarea
                  id="raw-payload"
                  rows={8}
                  value={rawInput}
                  onChange={(e) => setRawInput(e.target.value)}
                  className="w-full rounded-[12px] bg-deep-ocean border border-border p-3 font-mono text-xs text-cloud-white focus:border-horizon-blue focus:outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={handleValidate}
                  className="rounded-[10px] border border-horizon-blue/40 bg-horizon-blue/10 px-4 py-2 text-xs font-semibold text-horizon-blue hover:bg-horizon-blue/15 transition-colors duration-[150ms]"
                >
                  Run Validation Pipeline
                </button>
                <button
                  type="button"
                  disabled={!validation?.valid}
                  onClick={handlePushToPlatform}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-[10px] px-4 py-2 text-xs font-semibold transition-colors duration-[150ms]",
                    validation?.valid
                      ? "bg-monsoon-teal text-deep-ocean hover:bg-monsoon-teal/90"
                      : "bg-ocean-mid text-storm-gray cursor-not-allowed"
                  )}
                >
                  <Database className="h-3.5 w-3.5" />
                  Register into Dashboard & Explorer
                </button>
              </div>

              {ingestedBanner && (
                <div className="rounded-[12px] border border-monsoon-teal/35 bg-monsoon-teal/10 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-cloud-white">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-monsoon-teal shrink-0" />
                    {ingestedBanner}
                  </span>
                  <Link
                    href={
                      validation?.datasetType === "cyclone-track"
                        ? "/explorer"
                        : "/dashboard"
                    }
                    className="font-semibold text-monsoon-teal hover:underline shrink-0"
                  >
                    View Live →
                  </Link>
                </div>
              )}
            </div>
          </SectionCard>

          {/* Right: Validation Report & Active Registry */}
          <div className="lg:col-span-5 space-y-6">
            <SectionCard
              title="Dataset Validation Report"
              subtitle="Automated schema, CRS, and spatial domain checks"
            >
              {validation ? (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between rounded-[12px] bg-deep-ocean/70 border border-border-subtle p-3.5">
                    <div>
                      <p className="text-[11px] uppercase tracking-wider text-mist-gray">
                        Validation Status
                      </p>
                      <p
                        className={cn(
                          "font-heading text-base font-semibold mt-0.5",
                          validation.valid
                            ? "text-hazard-low"
                            : "text-hazard-high"
                        )}
                      >
                        {validation.valid
                          ? "Passed · Ready for Registry"
                          : "Failed · Fix Schema Errors"}
                      </p>
                    </div>
                    <span className="font-mono text-xs text-horizon-blue">
                      {validation.featureCount} records
                    </span>
                  </div>

                  <div className="space-y-2">
                    {validation.checks.map((chk) => (
                      <div
                        key={chk.name}
                        className="rounded-[12px] bg-deep-ocean/60 border border-border-subtle p-3 flex items-start gap-2.5"
                      >
                        {chk.status === "passed" ? (
                          <CheckCircle2 className="h-4 w-4 text-hazard-low shrink-0 mt-0.5" />
                        ) : chk.status === "warning" ? (
                          <AlertTriangle className="h-4 w-4 text-hazard-moderate shrink-0 mt-0.5" />
                        ) : (
                          <XCircle className="h-4 w-4 text-hazard-high shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="text-xs font-semibold text-cloud-white">
                            {chk.name}
                          </p>
                          <p className="text-[11px] text-mist-gray mt-0.5">
                            {chk.detail}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-mist-gray pt-2">
                  Run validation to inspect schema compliance.
                </p>
              )}
            </SectionCard>

            {/* Active Registry State */}
            <SectionCard
              title="Active Session Data Registry"
              subtitle="Cyclone tracks & custom GeoJSON layers currently active across StormScope"
            >
              <div className="space-y-4 pt-2">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-mist-gray mb-2">
                    Registered Cyclones ({cyclones.length})
                  </p>
                  <div className="space-y-1.5">
                    {cyclones.map((c) => {
                      const isCustom = customCyclones.some(
                        (cc) => cc.id === c.id
                      );
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-[10px] bg-deep-ocean/60 border border-border-subtle px-3 py-2 text-xs"
                        >
                          <span className="font-medium text-cloud-white">
                            {c.name} ({c.year})
                          </span>
                          <span
                            className={cn(
                              "text-[11px]",
                              isCustom ? "text-monsoon-teal" : "text-mist-gray"
                            )}
                          >
                            {isCustom ? "Ingested" : "Core Archive"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wider text-mist-gray mb-2">
                    Custom Map Overlays ({customOverlays.length})
                  </p>
                  {customOverlays.length === 0 ? (
                    <p className="text-xs text-storm-gray">
                      No custom GeoJSON overlays registered yet. Load a sample
                      GeoJSON above to push it onto the Dashboard map.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {customOverlays.map((ov) => (
                        <div
                          key={ov.id}
                          className="flex items-center justify-between rounded-[10px] bg-deep-ocean/60 border border-border-subtle px-3 py-2 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <Layers
                              className="h-3.5 w-3.5 shrink-0"
                              style={{ color: ov.color }}
                            />
                            <span className="truncate text-cloud-white">
                              {ov.name} ({ov.featureCount})
                            </span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => toggleOverlayVisibility(ov.id)}
                              className="text-[11px] text-horizon-blue hover:underline"
                            >
                              {ov.visible ? "Visible" : "Hidden"}
                            </button>
                            <button
                              type="button"
                              onClick={() => removeOverlay(ov.id)}
                              aria-label={`Remove ${ov.name}`}
                              className="text-mist-gray hover:text-hazard-high"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </SectionCard>
          </div>
        </section>
      </div>
    </div>
  );
}
