"use client";

import { useCallback, useState } from "react";
import type * as maplibregl from "maplibre-gl";
import MapView from "@/components/maps/MapView";
import { MetricCard, HazardBadge } from "@/components/ui/Cards";
import { getCycloneById, getExposureSummary } from "@/data";
import type { StormScopeGeoData } from "@/data/geo.server";
import {
  addDistrictLayers,
  addHazardZoneLayers,
  addFloodZoneLayers,
  addCycloneTrackLayers,
  type HoveredDistrictInfo,
} from "@/maps/layers";
import { formatNumber } from "@/lib/utils";
import { Building2, Compass, MapPin, ShieldAlert } from "lucide-react";

interface PreviewMapProps {
  geoData: StormScopeGeoData;
}

export default function PreviewMap({ geoData }: PreviewMapProps) {
  const summary = getExposureSummary();
  const [hovered, setHovered] = useState<HoveredDistrictInfo | null>(null);

  const handleMapLoad = useCallback(
    (map: maplibregl.Map) => {
      const fani = getCycloneById("fani");
      addDistrictLayers(map, geoData.districts, {
        onDistrictHover: (info) => setHovered(info),
      });
      addHazardZoneLayers(map, geoData.hazardZones);
      addFloodZoneLayers(map, geoData.floodZones);
      if (fani) {
        addCycloneTrackLayers(map, fani);
      }
    },
    [geoData]
  );

  return (
    <div className="space-y-6">
      <div className="relative rounded-[24px] overflow-hidden border border-border bg-ocean-surface">
        <MapView
          center={[84.8, 20.3]}
          zoom={6.4}
          scrollZoom={false}
          bayOfBengalLand={geoData.bayOfBengalLand}
          odishaGeo={geoData.odisha}
          onLoad={handleMapLoad}
          className="h-[440px] w-full border-0 rounded-none"
        >
          {/* Floating Map Legend Overlay */}
          <div className="pointer-events-none absolute top-4 left-4 z-10 rounded-[14px] glass-panel px-4 py-3 max-w-xs">
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs font-medium uppercase tracking-wider text-horizon-blue">
                30-District Odisha View
              </span>
              <HazardBadge level={hovered ? hovered.hazardCategory : "Extreme"} size="sm" />
            </div>
            <p className="mt-1 font-heading text-sm font-semibold text-cloud-white">
              {hovered
                ? `${hovered.name} · Index ${hovered.exposureIndex}/100`
                : "Cyclone Fani (2019) · Odisha"}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-mist-gray">
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-hazard-extreme" />
                Extreme
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-hazard-high" />
                High
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-hazard-moderate" />
                Moderate
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-horizon-blue" />
                Flood / Track
              </span>
            </div>
          </div>
        </MapView>
      </div>

      {/* Supporting Snapshot Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Highest Exposure District"
          value={summary.highestExposureDistrict}
          interpretation="Exposure Index 92/100 at Puri landfall corridor"
          hazardLevel="Extreme"
          icon={MapPin}
        />
        <MetricCard
          label="Potentially Exposed Buildings"
          value={formatNumber(summary.totalExposedBuildings)}
          interpretation="Aggregated across all 30 Odisha districts"
          icon={Building2}
        />
        <MetricCard
          label="Estimated Hazard Area"
          value={`${formatNumber(summary.estimatedHazardArea)} km²`}
          interpretation="Combined wind-corridor & coastal surge zones"
          icon={ShieldAlert}
        />
        <MetricCard
          label="Coastal vs. Inland Mean"
          value={`${summary.coastalAverageIndex ?? 72.2} vs ${summary.inlandAverageIndex ?? 32.8}`}
          interpretation="Coastal exposure index averages 2.2x inland districts"
          hazardLevel="High"
          icon={Compass}
        />
      </div>
    </div>
  );
}
