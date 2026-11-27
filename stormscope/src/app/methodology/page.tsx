import Link from "next/link";
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CheckCircle2,
  Cpu,
  Database,
  Globe,
  Layers,
  Map as MapIcon,
  Mountain,
  Radar,
  ShieldAlert,
} from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui/Cards";

const DATA_SOURCES = [
  {
    name: "Historical Cyclone Tracks",
    type: "Meteorological Archive (IMD Context)",
    description:
      "Cyclone Fani (2019), Phailin (2013), and Dana (2024) best-track coordinates, wind progression, central pressure drops, plus CSV track ingestion.",
    status: "Integrated" as const,
    icon: Radar,
  },
  {
    name: "Administrative Boundaries",
    type: "Geospatial Polygons (GeoJSON)",
    description:
      "Real Odisha state coastline and all 30 district boundary polygons supporting hover inspection, bounding-box zoom, and spatial point-in-polygon queries.",
    status: "Integrated" as const,
    icon: Globe,
  },
  {
    name: "Infrastructure & Flood Layers",
    type: "Corridors, Ports, Hospitals & Surge Zones",
    description:
      "Odisha highway corridors (NH-16, NH-316, NH-53, NH-55), deep-water ports, medical hubs, cyclone shelters, and coastal storm surge zones.",
    status: "Integrated" as const,
    icon: Building2,
  },
  {
    name: "Terrain & Precipitation Layers",
    type: "SRTM 30m DEM & NASA GPM Rainfall",
    description:
      "Coastal-to-highland elevation bands (<15m, 15–150m, >150m MSL) and 24h precipitation swath layers integrated with custom GeoJSON validation.",
    status: "Integrated" as const,
    icon: Mountain,
  },
];

const PIPELINE_STEPS = [
  {
    step: "01",
    title: "Collection",
    description:
      "Gather cyclone track records, administrative polygons, terrain context, and infrastructure layers.",
    icon: Database,
  },
  {
    step: "02",
    title: "Processing",
    description:
      "Normalize spatial coordinates, standardize hazard tiers (Low–Extreme), and align JSON/GeoJSON schemas.",
    icon: Cpu,
  },
  {
    step: "03",
    title: "Hazard Assessment",
    description:
      "Delineate historical wind corridors and coastal storm surge zones relative to landfall proximity.",
    icon: ShieldAlert,
  },
  {
    step: "04",
    title: "Exposure Assessment",
    description:
      "Intersect hazard zones with buildings, roads, and settlements to derive district exposure indices.",
    icon: Layers,
  },
  {
    step: "05",
    title: "Visualization",
    description:
      "Present cartographic layers, charts, and planning guidance through an accessible map-first interface.",
    icon: MapIcon,
  },
];

const ASSUMPTIONS = [
  "Historical cyclone tracks and district boundaries represent archived regional conditions rather than real-time or future meteorological forecasts.",
  "Exposure indices (0–100) are relative comparative indicators designed to highlight spatial concentration across districts, not absolute damage counts.",
  "Demonstration GeoJSON boundaries and infrastructure nodes prioritize clarity and laptop responsiveness over cadastral survey precision.",
  "Site-level assessment indicators incorporate distance from historical landfall corridors, regional terrain tier, and building sensitivity context.",
];

const LIMITATIONS = [
  "Current MVP coverage focuses on Odisha, India with Cyclone Fani (2019) as the primary reference case study.",
  "Local JSON and GeoJSON demonstration datasets are internally consistent approximations and should not be cited as official validated engineering audits.",
  "No live satellite ingestion, hydrodynamic flood simulation, or real-time weather API feeds are connected in Phase 1.",
  "Outputs provide historical planning context only and never predict structural performance, building collapse, or construction approval.",
];

export default function MethodologyPage() {
  return (
    <div className="min-h-screen bg-deep-ocean text-cloud-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <PageHeader
          title="Methodology & Analytical Transparency"
          subtitle="How StormScope transforms historical cyclone archives, administrative boundaries, and infrastructure layers into interpretable exposure indicators."
        />

        {/* ── 1. Objective ── */}
        <SectionCard
          title="Analytical Objective"
          subtitle="Bridging fragmented disaster records and planning-oriented spatial exploration"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 text-sm text-mist-gray leading-relaxed">
            <div className="lg:col-span-8 space-y-4">
              <p>
                Historical cyclone documentation is typically spread across meteorological
                bulletins, static government reports, digital elevation models, and GIS
                shapefiles. Extracting practical geographic context from those sources
                often demands specialized desktop GIS tooling and domain expertise.
              </p>
              <p>
                StormScope establishes a transparent, reproducible visual workflow that
                aligns storm track geometry, regional hazard classification, and
                infrastructure footprints onto a single interactive map surface. Every
                score is paired with plain-language interpretation so reviewers, students,
                and planners can trace how indicators are formed.
              </p>
            </div>
            <div className="lg:col-span-4 rounded-[16px] bg-deep-ocean/70 border border-border-subtle p-5 space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-monsoon-teal">
                Core Principle
              </p>
              <p className="font-heading text-base font-semibold text-cloud-white">
                Transparency Over Certainty
              </p>
              <p className="text-xs text-mist-gray leading-relaxed">
                Where estimates or demonstration datasets are used, uncertainty and
                analytical boundaries remain explicitly visible alongside every result.
              </p>
            </div>
          </div>
        </SectionCard>

        {/* ── 2. Data Sources ── */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-horizon-blue">
              Information Layers
            </p>
            <h2 className="font-heading text-2xl font-bold text-cloud-white mt-1">
              Data Sources & MVP Representation
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {DATA_SOURCES.map((src) => {
              const Icon = src.icon;
              const isIntegrated = src.status === "Integrated";
              return (
                <div
                  key={src.name}
                  className="rounded-[18px] bg-ocean-surface border border-border-subtle p-6 flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-horizon-blue/10 border border-horizon-blue/20">
                          <Icon className="h-5 w-5 text-horizon-blue" />
                        </div>
                        <div>
                          <h3 className="font-heading text-base font-semibold text-cloud-white">
                            {src.name}
                          </h3>
                          <p className="text-xs text-mist-gray">{src.type}</p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium border ${
                          isIntegrated
                            ? "text-monsoon-teal border-monsoon-teal/30 bg-monsoon-teal/10"
                            : "text-terrain-sand border-terrain-sand/30 bg-terrain-sand/10"
                        }`}
                      >
                        {isIntegrated ? "MVP Local" : "Phase 2+ Planned"}
                      </span>
                    </div>
                    <p className="text-sm text-mist-gray leading-relaxed">
                      {src.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 3. Processing Pipeline Workflow ── */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-horizon-blue">
              System Pipeline
            </p>
            <h2 className="font-heading text-2xl font-bold text-cloud-white mt-1">
              End-to-End Assessment Workflow
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {PIPELINE_STEPS.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative">
                  <div className="rounded-[18px] bg-ocean-surface border border-border-subtle p-5 h-full">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-mono text-xs font-semibold text-horizon-blue">
                        {item.step}
                      </span>
                      <Icon className="h-4 w-4 text-monsoon-teal" />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-cloud-white">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-xs text-mist-gray leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {idx < PIPELINE_STEPS.length - 1 && (
                    <div
                      className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 h-6 w-6 items-center justify-center rounded-full bg-deep-ocean border border-border text-horizon-blue"
                      aria-hidden="true"
                    >
                      <ArrowRight className="h-3 w-3" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ── 4. Assumptions & Limitations ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard
            title="Key Analytical Assumptions"
            subtitle="Foundational modeling choices for the Phase 1 MVP"
          >
            <ul className="space-y-3 pt-2">
              {ASSUMPTIONS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-mist-gray leading-relaxed"
                >
                  <CheckCircle2 className="h-4 w-4 text-monsoon-teal shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <SectionCard
            title="Known Limitations & Boundaries"
            subtitle="Explicit scope constraints for academic & planning clarity"
          >
            <ul className="space-y-3 pt-2">
              {LIMITATIONS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-mist-gray leading-relaxed"
                >
                  <AlertTriangle className="h-4 w-4 text-hazard-moderate shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </section>

        {/* ── 5. Evolution Path ── */}
        <SectionCard
          title="Future Architecture Compatibility"
          subtitle="Designed to evolve from local demonstration datasets to modular geospatial processing services"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div className="rounded-[16px] bg-deep-ocean/70 border border-border-subtle p-5 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-horizon-blue">
                Phase 1 — Presentation MVP (Current)
              </p>
              <p className="font-heading text-base font-semibold text-cloud-white">
                Frontend → Local JSON / GeoJSON → MapLibre Visualization
              </p>
              <p className="text-xs text-mist-gray leading-relaxed">
                Zero external runtime dependencies, instantaneous startup, and
                reproducible demonstration behavior across all presentation laptops.
              </p>
            </div>
            <div className="rounded-[16px] bg-deep-ocean/70 border border-border-subtle p-5 space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-monsoon-teal">
                Phase 2–5 — Service-Oriented Geospatial Platform
              </p>
              <p className="font-heading text-base font-semibold text-cloud-white">
                Frontend → API Gateway → Hazard, Exposure & Validation Engines
              </p>
              <p className="text-xs text-mist-gray leading-relaxed">
                Modular data access abstractions allow swapping local files for live
                IMD, Sentinel, SRTM DEM, and OpenStreetMap processing containers
                without redesigning the frontend.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/pipeline"
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-monsoon-teal px-4 py-2 text-xs font-semibold text-deep-ocean hover:bg-monsoon-teal/90 transition-colors duration-[150ms]"
            >
              Open Data Integration Hub
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/assessment"
              className="inline-flex items-center gap-1.5 rounded-[10px] bg-horizon-blue px-4 py-2 text-xs font-semibold text-deep-ocean hover:bg-horizon-blue/90 transition-colors duration-[150ms]"
            >
              Try Site Assessment
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 rounded-[10px] border border-border px-4 py-2 text-xs font-medium text-cloud-white hover:border-horizon-blue/40 transition-colors duration-[150ms]"
            >
              Read Project Scope
            </Link>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
