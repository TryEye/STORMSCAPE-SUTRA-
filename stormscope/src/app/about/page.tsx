import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Compass,
  Globe,
  GraduationCap,
  Layers,
  Radar,
  XCircle,
} from "lucide-react";
import { PageHeader, SectionCard } from "@/components/ui/Cards";

const DOES_LIST = [
  "Reconstructs historical cyclone trajectories and intensity milestones",
  "Visualizes regional hazard tiers across Odisha administrative districts",
  "Summarizes potentially exposed buildings, roads, and coastal settlements",
  "Evaluates proposed coordinates for historical environmental exposure indicators",
  "Communicates assumptions, limitations, and planning guidance transparently",
];

const DOES_NOT_LIST = [
  "Does not forecast future weather patterns or cyclone tracks",
  "Does not perform structural engineering or finite-element analysis",
  "Does not predict building collapse, failure, or confirmed structural damage",
  "Does not issue safety certifications or construction approvals",
  "Does not act as an operational real-time emergency response platform",
];

const TECH_STACK = [
  { name: "Next.js App Router", role: "Modular routing & server rendering" },
  { name: "TypeScript", role: "Strict geospatial & domain typing" },
  { name: "Tailwind CSS", role: "8-point design system & tokens" },
  { name: "MapLibre GL", role: "Cartographic vector & GeoJSON layers" },
  { name: "Recharts", role: "Meteorological & exposure charts" },
  { name: "Framer Motion", role: "Restrained state-transition motion" },
];

const FUTURE_EXPANSIONS = [
  "Additional Bay of Bengal cyclone archives (e.g., 1999 Super Cyclone, Yaas, Mocha)",
  "Automated satellite & live IMD/Sentinel API ingestion pipelines",
  "High-resolution 30m DEM & hydrodynamic flood-depth modeling",
  "Multi-state eastern Indian coastline coverage (West Bengal, Andhra Pradesh)",
  "Containerized backend Hazard, Exposure, and Validation engines behind API Gateway",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-deep-ocean text-cloud-white py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
        <PageHeader
          title="About StormScope"
          subtitle="Project context, academic scope, and long-term architectural vision for the Historical Cyclone Exposure Assessment Platform."
        />

        {/* ── 1. Project Overview & Academic Context ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <SectionCard
            title="Project Overview"
            subtitle="Environmental intelligence built for clarity, research, and planning education"
            className="lg:col-span-7"
          >
            <div className="space-y-4 pt-2 text-sm text-mist-gray leading-relaxed">
              <p>
                StormScope is a geospatial analysis and visualization platform designed
                to transform historical cyclone archives, regional terrain context, and
                infrastructure datasets into accessible exposure assessments.
              </p>
              <p>
                Rather than presenting dense meteorological tables or opaque GIS
                workflows, StormScope places interactive cartography at the center of
                every screen—allowing students, researchers, academic evaluators, and
                infrastructure planners to explore storm trajectories and spatial
                vulnerability intuitively.
              </p>
              <p>
                Built across Phases 1–4 around Odisha, India, StormScope covers all
                30 administrative districts and multiple historical cyclone
                scenarios—Cyclone Fani (2019), Cyclone Phailin (2013), and Cyclone
                Dana (2024)—alongside SRTM elevation bands, GPM rainfall swaths, and
                a local GeoJSON/CSV validation pipeline. All datasets operate
                locally via JSON and GeoJSON behind future-compatible service
                adapters for offline-capable academic demonstrations.
              </p>
            </div>
          </SectionCard>

          <SectionCard
            title="Academic & Project Context"
            subtitle="Phases 1–4 Reference Profile"
            className="lg:col-span-5"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4">
                <div className="flex items-center gap-2 text-xs text-mist-gray">
                  <GraduationCap className="h-3.5 w-3.5 text-horizon-blue" />
                  Project Type
                </div>
                <p className="mt-1.5 font-heading text-sm font-semibold text-cloud-white">
                  Academic Research & Planning MVP
                </p>
              </div>
              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4">
                <div className="flex items-center gap-2 text-xs text-mist-gray">
                  <Globe className="h-3.5 w-3.5 text-terrain-sand" />
                  Geographic Focus
                </div>
                <p className="mt-1.5 font-heading text-sm font-semibold text-cloud-white">
                  Odisha (30 Districts)
                </p>
              </div>
              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4">
                <div className="flex items-center gap-2 text-xs text-mist-gray">
                  <Radar className="h-3.5 w-3.5 text-monsoon-teal" />
                  Case Studies
                </div>
                <p className="mt-1.5 font-heading text-sm font-semibold text-cloud-white">
                  Fani, Phailin & Dana
                </p>
              </div>
              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4">
                <div className="flex items-center gap-2 text-xs text-mist-gray">
                  <Compass className="h-3.5 w-3.5 text-horizon-blue" />
                  Primary Focus
                </div>
                <p className="mt-1.5 font-heading text-sm font-semibold text-cloud-white">
                  Historical Exposure & Planning
                </p>
              </div>
            </div>
          </SectionCard>
        </section>

        {/* ── 2. Scope Boundaries ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard
            title="What StormScope Does"
            subtitle="Core MVP capabilities and analytical outputs"
          >
            <ul className="space-y-3 pt-2">
              {DOES_LIST.map((item) => (
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
            title="What StormScope Does NOT Do"
            subtitle="Non-negotiable operational and engineering exclusions"
          >
            <ul className="space-y-3 pt-2">
              {DOES_NOT_LIST.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-mist-gray leading-relaxed"
                >
                  <XCircle className="h-4 w-4 text-hazard-high shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>
        </section>

        {/* ── 3. Technology Stack ── */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-horizon-blue">
              Architecture Stack
            </p>
            <h2 className="font-heading text-2xl font-bold text-cloud-white mt-1">
              Frontend & Visualization Technologies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {TECH_STACK.map((tech) => (
              <div
                key={tech.name}
                className="rounded-[18px] bg-ocean-surface border border-border-subtle p-5 flex items-start gap-3.5"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-horizon-blue/10 border border-horizon-blue/20">
                  <Layers className="h-4 w-4 text-horizon-blue" />
                </div>
                <div>
                  <h3 className="font-heading text-sm font-semibold text-cloud-white">
                    {tech.name}
                  </h3>
                  <p className="mt-1 text-xs text-mist-gray">{tech.role}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 4. Future Development & Philosophy ── */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <SectionCard
            title="Future Platform Roadmap"
            subtitle="Planned progression beyond Phase 1 Presentation MVP"
            className="lg:col-span-7"
          >
            <ul className="space-y-2.5 pt-2">
              {FUTURE_EXPANSIONS.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-sm text-mist-gray leading-relaxed"
                >
                  <ArrowRight className="h-4 w-4 text-horizon-blue shrink-0 mt-1" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </SectionCard>

          <div className="lg:col-span-5 rounded-[24px] bg-ocean-surface border border-border p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider text-monsoon-teal">
                Guiding Philosophy
              </p>
              <blockquote className="font-heading text-xl font-semibold text-cloud-white leading-snug">
                &ldquo;Historical analysis over forecasting. Exposure assessment over
                damage prediction. Transparency over certainty.&rdquo;
              </blockquote>
              <p className="text-xs text-mist-gray leading-relaxed">
                Designed to feel like a storm observed from orbit—calm, analytical,
                and grounded in geographic context.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-horizon-blue px-4 py-2 text-xs font-semibold text-deep-ocean hover:bg-horizon-blue/90 transition-colors duration-[150ms]"
              >
                Open Dashboard
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
              <Link
                href="/methodology"
                className="inline-flex items-center gap-1.5 rounded-[10px] border border-border px-4 py-2 text-xs font-medium text-cloud-white hover:border-horizon-blue/40 transition-colors duration-[150ms]"
              >
                Review Methodology
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
