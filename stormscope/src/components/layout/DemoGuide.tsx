"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, Compass, X } from "lucide-react";
import {
  LocalAssessmentService,
  LocalExposureService,
  LocalHazardService,
  LocalReportingService,
  LocalValidationService,
} from "@/services";

const DEMO_STAGES = [
  {
    href: "/",
    title: "1. Platform Narrative",
    summary:
      "Introduce StormScope's mission, fragmented cyclone data challenge, and Odisha preview map.",
  },
  {
    href: "/dashboard",
    title: "2. Operational Dashboard",
    summary:
      "Switch cyclone scenarios, hover any of the 30 Odisha districts, toggle hazard/flood/DEM layers, and export a brief.",
  },
  {
    href: "/explorer",
    title: "3. Cyclone Explorer",
    summary:
      "Play back historical cyclone tracks node-by-node and inspect wind speed and pressure timelines.",
  },
  {
    href: "/assessment",
    title: "4. Site Assessment & Comparison",
    summary:
      "Click on the Odisha map to evaluate point-in-polygon exposure, factor weights, and multi-scenario deltas.",
  },
  {
    href: "/pipeline",
    title: "5. Data Integration Hub",
    summary:
      "Validate and ingest sample IMD CSV or Sentinel/OSM GeoJSON datasets live into the map registry.",
  },
  {
    href: "/methodology",
    title: "6. Methodology & Scope",
    summary:
      "Review data sources, analytical assumptions, non-engineering boundaries, and service-adapter readiness.",
  },
] as const;

export default function DemoGuide() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const currentIndex = Math.max(
    0,
    DEMO_STAGES.findIndex((s) => s.href === pathname)
  );
  const current = DEMO_STAGES[currentIndex];

  const healthyEngines = [
    LocalHazardService.getHealth(),
    LocalExposureService.getHealth(),
    LocalAssessmentService.getHealth(),
    LocalValidationService.getHealth(),
    LocalReportingService.getHealth(),
  ].filter((h) => h.ready).length;

  const goTo = (index: number) => {
    const target = DEMO_STAGES[index];
    if (target) router.push(target.href);
  };

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-4 right-4 z-40 inline-flex items-center gap-2 rounded-full glass-panel px-3.5 py-2 text-xs font-medium text-cloud-white border border-horizon-blue/30 hover:border-horizon-blue transition-colors duration-[150ms]"
      >
        <Compass className="h-3.5 w-3.5 text-horizon-blue" />
        Demo Tour
      </button>
    );
  }

  return (
    <aside
      aria-label="5-Minute Presentation Guide"
      className="fixed bottom-4 right-4 z-40 w-80 rounded-[18px] glass-panel border border-horizon-blue/30 p-4 shadow-xl space-y-3"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-horizon-blue">
          5-Min Demo Guide · {currentIndex + 1}/{DEMO_STAGES.length}
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close demo guide"
          className="text-mist-gray hover:text-cloud-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div>
        <h4 className="font-heading text-sm font-semibold text-cloud-white">
          {current.title}
        </h4>
        <p className="mt-1 text-xs text-mist-gray leading-relaxed">
          {current.summary}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-border-subtle">
        <span className="text-[10px] font-mono text-monsoon-teal">
          {healthyEngines}/5 Local Engines Ready
        </span>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={currentIndex === 0}
            onClick={() => goTo(currentIndex - 1)}
            aria-label="Previous demo step"
            className="rounded-[8px] border border-border-subtle bg-deep-ocean px-2 py-1 text-xs text-mist-gray hover:text-cloud-white disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            disabled={currentIndex >= DEMO_STAGES.length - 1}
            onClick={() => goTo(currentIndex + 1)}
            aria-label="Next demo step"
            className="inline-flex items-center gap-1 rounded-[8px] bg-horizon-blue px-2.5 py-1 text-xs font-semibold text-deep-ocean hover:bg-horizon-blue/90 disabled:opacity-40"
          >
            Next
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
