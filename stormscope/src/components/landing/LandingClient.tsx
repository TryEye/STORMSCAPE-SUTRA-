"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Compass,
  Database,
  FileSearch,
  Layers,
  Map as MapIcon,
  Radar,
  ShieldAlert,
  TrendingUp,
} from "lucide-react";
import CycloneHeroVisual from "@/components/landing/CycloneHeroVisual";
import PreviewMap from "@/components/landing/PreviewMap";
import { SectionHeading } from "@/components/ui/Cards";
import { motionPresets, viewportOptions } from "@/lib/motion";
import type { StormScopeGeoData } from "@/data/geo.server";

const PROBLEM_CARDS = [
  {
    stat: "5+ Sources",
    title: "Fragmented Records",
    description:
      "Meteorological tracks, satellite imagery, elevation models, and infrastructure datasets sit in separate technical silos.",
    icon: Database,
  },
  {
    stat: "10+ Districts",
    title: "Spatial Complexity",
    description:
      "Evaluating how coastal topography and settlement density interact during a cyclone traditionally requires specialist GIS software.",
    icon: Layers,
  },
  {
    stat: "Planning Gap",
    title: "Limited Accessibility",
    description:
      "Students, researchers, and urban planners lack an intuitive visual workflow to translate historical events into site context.",
    icon: FileSearch,
  },
];

const CAPABILITIES = [
  {
    title: "Historical Analysis",
    description:
      "Reconstruct storm intensity, pressure drops, and landfall timelines from archived cyclone tracks.",
    icon: Radar,
    href: "/explorer",
  },
  {
    title: "Hazard Mapping",
    description:
      "Visualize wind and coastal surge corridors layered directly over Odisha administrative boundaries.",
    icon: MapIcon,
    href: "/dashboard",
  },
  {
    title: "Exposure Assessment",
    description:
      "Quantify buildings, roads, and settlements intersecting historical cyclone hazard zones.",
    icon: Building2,
    href: "/dashboard",
  },
  {
    title: "Construction Assessment",
    description:
      "Evaluate proposed coordinates against historical exposure, terrain elevation, and flood indicators.",
    icon: Compass,
    href: "/assessment",
  },
];

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Historical Data",
    description: "Cyclone tracks, boundaries & terrain",
    icon: Database,
  },
  {
    step: "02",
    title: "Hazard Estimation",
    description: "Wind corridor & surge zones",
    icon: ShieldAlert,
  },
  {
    step: "03",
    title: "Exposure Analysis",
    description: "Infrastructure spatial intersection",
    icon: Layers,
  },
  {
    step: "04",
    title: "Assessment",
    description: "Location-specific indicator scoring",
    icon: Compass,
  },
  {
    step: "05",
    title: "Insights",
    description: "Interpretable planning guidance",
    icon: TrendingUp,
  },
];

interface LandingClientProps {
  geoData: StormScopeGeoData;
}

export default function LandingClient({ geoData }: LandingClientProps) {
  return (
    <div className="bg-deep-ocean text-cloud-white">
      {/* ── 1. Hero Section ── */}
      <section className="relative min-h-[calc(100vh-4rem)] flex items-center overflow-hidden border-b border-border-subtle">
        <CycloneHeroVisual />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 lg:py-24 w-full">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-horizon-blue/25 bg-ocean-surface/80 px-3.5 py-1.5 text-xs font-medium text-horizon-blue mb-6">
              <span className="h-2 w-2 rounded-full bg-monsoon-teal" />
              Odisha Geospatial Intelligence · Cyclone Fani (2019) Case Study
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-cloud-white leading-[1.08]">
              Historical Cyclone Exposure Assessment and Infrastructure Planning Platform
            </h1>

            <p className="mt-6 text-base sm:text-lg text-mist-gray leading-relaxed max-w-2xl">
              StormScope transforms archived cyclone tracks, coastal terrain characteristics,
              and infrastructure datasets into clear, map-first exposure intelligence for
              research, education, and planning exploration.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 rounded-[10px] bg-horizon-blue px-6 py-3 text-sm font-semibold text-deep-ocean hover:bg-horizon-blue/90 transition-colors duration-[150ms]"
              >
                Explore Dashboard
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-2 rounded-[10px] border border-border bg-ocean-surface/80 px-6 py-3 text-sm font-medium text-cloud-white hover:border-horizon-blue/40 hover:bg-ocean-mid transition-colors duration-[150ms]"
              >
                Evaluate a Location
              </Link>
            </div>

            <div className="mt-12 grid grid-cols-3 gap-6 max-w-lg pt-8 border-t border-border-subtle">
              <div>
                <p className="font-heading text-2xl font-semibold text-cloud-white">
                  215 km/h
                </p>
                <p className="text-xs text-mist-gray mt-1">Peak Fani Wind Speed</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold text-cloud-white">
                  30 Districts
                </p>
                <p className="text-xs text-mist-gray mt-1">Odisha Spatial Coverage</p>
              </div>
              <div>
                <p className="font-heading text-2xl font-semibold text-monsoon-teal">
                  Historical
                </p>
                <p className="text-xs text-mist-gray mt-1">Non-Forecast Analysis</p>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── 2. Problem Statement ── */}
      <section className="py-20 lg:py-24 border-b border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={motionPresets.fadeInUp.initial}
            whileInView={motionPresets.fadeInUp.animate}
            viewport={viewportOptions}
            transition={motionPresets.fadeInUp.transition}
          >
            <SectionHeading
              eyebrow="The Challenge"
              title="Why Historical Cyclone Data Remains Difficult to Interpret"
              description="Understanding how a tropical cyclone affected coastal communities and built infrastructure requires synthesizing records that rarely live in one accessible system."
            />
          </motion.div>

          <motion.div
            variants={motionPresets.staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={viewportOptions}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {PROBLEM_CARDS.map((item) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.title}
                  variants={motionPresets.fadeInUp}
                  className="rounded-[18px] bg-ocean-surface border border-border-subtle p-6 hover:border-border transition-colors duration-[250ms]"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-horizon-blue/10 border border-horizon-blue/20">
                      <Icon className="h-5 w-5 text-horizon-blue" />
                    </div>
                    <span className="font-heading text-sm font-semibold text-terrain-sand">
                      {item.stat}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-cloud-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-mist-gray leading-relaxed">
                    {item.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── 3. Platform Overview & Capabilities ── */}
      <section className="py-20 lg:py-24 bg-ocean-surface/30 border-b border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={motionPresets.fadeInUp.initial}
            whileInView={motionPresets.fadeInUp.animate}
            viewport={viewportOptions}
            transition={motionPresets.fadeInUp.transition}
          >
            <SectionHeading
              eyebrow="Platform Overview"
              title="One Unified Geospatial Analysis Workflow"
              description="StormScope bridges meteorological archives, regional terrain context, and infrastructure layers so students, researchers, and planners can evaluate exposure visually."
            />
          </motion.div>

          <motion.div
            variants={motionPresets.staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={viewportOptions}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {CAPABILITIES.map((cap) => {
              const Icon = cap.icon;
              return (
                <motion.div key={cap.title} variants={motionPresets.fadeInUp}>
                  <Link
                    href={cap.href}
                    className="group flex flex-col h-full rounded-[18px] bg-ocean-surface border border-border-subtle p-6 hover:border-horizon-blue/35 transition-colors duration-[250ms]"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-[10px] bg-monsoon-teal/10 border border-monsoon-teal/20 mb-5">
                      <Icon className="h-5 w-5 text-monsoon-teal" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold text-cloud-white group-hover:text-horizon-blue transition-colors duration-[150ms]">
                      {cap.title}
                    </h3>
                    <p className="mt-2 text-sm text-mist-gray leading-relaxed flex-1">
                      {cap.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-horizon-blue">
                      Open module
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-[150ms] group-hover:translate-x-0.5" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ── 4. How It Works (Methodology Flow) ── */}
      <section className="py-20 lg:py-24 border-b border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={motionPresets.fadeInUp.initial}
            whileInView={motionPresets.fadeInUp.animate}
            viewport={viewportOptions}
            transition={motionPresets.fadeInUp.transition}
          >
            <SectionHeading
              eyebrow="How It Works"
              title="From Archived Storm Tracks to Site Guidance"
              description="Each layer in StormScope operates transparently, transforming raw historical context into structured indicators without black-box claims."
            />
          </motion.div>

          <div className="relative grid grid-cols-1 md:grid-cols-5 gap-4">
            {WORKFLOW_STEPS.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.step} className="relative flex flex-col">
                  <div className="rounded-[18px] bg-ocean-surface border border-border-subtle p-5 h-full">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-semibold text-horizon-blue">
                        STEP {item.step}
                      </span>
                      <Icon className="h-4 w-4 text-monsoon-teal" />
                    </div>
                    <h3 className="font-heading text-base font-semibold text-cloud-white">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-mist-gray leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {index < WORKFLOW_STEPS.length - 1 && (
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
        </div>
      </section>

      {/* ── 5. Interactive Preview ── */}
      <section className="py-20 lg:py-24 bg-ocean-surface/20 border-b border-border-subtle">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <p className="text-sm font-medium text-horizon-blue uppercase tracking-wider mb-2">
                Interactive Preview
              </p>
              <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cloud-white">
                Odisha Exposure Landscape — Cyclone Fani (2019)
              </h2>
              <p className="mt-2 text-base text-mist-gray max-w-2xl">
                Inspect district hazard corridors, storm track geometry, and infrastructure
                exposure directly on the interactive cartographic preview below.
              </p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-[10px] border border-horizon-blue/30 bg-horizon-blue/10 px-4 py-2.5 text-sm font-medium text-horizon-blue hover:bg-horizon-blue/15 transition-colors duration-[150ms] shrink-0"
            >
              Launch Full Dashboard
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <PreviewMap geoData={geoData} />
        </div>
      </section>

      {/* ── 6. Project Context ── */}
      <section className="py-20 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[24px] bg-ocean-surface border border-border-subtle p-8 sm:p-10 lg:p-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                <p className="text-sm font-medium text-monsoon-teal uppercase tracking-wider">
                  Research & Academic Context
                </p>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cloud-white">
                  Focused on Odisha Coastlines & Educational Transparency
                </h2>
                <p className="text-base text-mist-gray leading-relaxed">
                  StormScope is designed as a transparent academic and planning-oriented MVP.
                  Using Odisha and Cyclone Fani (2019) as the primary case study, it demonstrates
                  how historical meteorological events and local geospatial layers can inform
                  early-stage infrastructure awareness.
                </p>
                <p className="text-sm text-storm-gray leading-relaxed">
                  Note: Outputs reflect historical exposure indicators and planning context
                  only—StormScope does not forecast weather or predict structural failure.
                </p>
              </div>

              <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                <div className="rounded-[18px] bg-deep-ocean/70 border border-border-subtle p-5">
                  <p className="text-xs text-mist-gray">Geographic Focus</p>
                  <p className="mt-1 font-heading text-lg font-semibold text-terrain-sand">
                    Odisha, India
                  </p>
                </div>
                <div className="rounded-[18px] bg-deep-ocean/70 border border-border-subtle p-5">
                  <p className="text-xs text-mist-gray">Case Study Event</p>
                  <p className="mt-1 font-heading text-lg font-semibold text-horizon-blue">
                    Cyclone Fani
                  </p>
                </div>
                <div className="rounded-[18px] bg-deep-ocean/70 border border-border-subtle p-5">
                  <p className="text-xs text-mist-gray">Analysis Mode</p>
                  <p className="mt-1 font-heading text-lg font-semibold text-cloud-white">
                    Historical
                  </p>
                </div>
                <div className="rounded-[18px] bg-deep-ocean/70 border border-border-subtle p-5">
                  <p className="text-xs text-mist-gray">Architecture</p>
                  <p className="mt-1 font-heading text-lg font-semibold text-monsoon-teal">
                    Map-First MVP
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
