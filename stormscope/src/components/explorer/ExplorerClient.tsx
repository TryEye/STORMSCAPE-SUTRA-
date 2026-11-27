"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import * as maplibregl from "maplibre-gl";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Compass,
  Gauge,
  Home,
  IndianRupee,
  MapPin,
  Pause,
  Play,
  RotateCcw,
  Sprout,
  Users,
  Wind,
} from "lucide-react";
import MapView from "@/components/maps/MapView";
import {
  HazardBadge,
  MetricCard,
  PageHeader,
  SectionCard,
} from "@/components/ui/Cards";
import { getImpactSummary } from "@/data";
import { useDataRegistry } from "@/context/DataRegistryContext";
import type { StormScopeGeoData } from "@/data/geo.server";
import {
  addCycloneTrackLayers,
  updateCycloneTrackData,
  addDistrictLayers,
  addFloodZoneLayers,
  addHazardZoneLayers,
  addInfrastructureLayers,
} from "@/maps/layers";
import { cn, formatCompact, formatNumber } from "@/lib/utils";

interface ExplorerClientProps {
  geoData: StormScopeGeoData;
}

export default function ExplorerClient({ geoData }: ExplorerClientProps) {
  const { cyclones } = useDataRegistry();
  const [selectedCycloneId, setSelectedCycloneId] = useState(
    cyclones[0]?.id ?? "fani"
  );
  const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const impactSummary = getImpactSummary();

  const mapRef = useRef<maplibregl.Map | null>(null);
  const popupRef = useRef<maplibregl.Popup | null>(null);
  const eyeMarkerRef = useRef<maplibregl.Marker | null>(null);

  const cyclone = useMemo(
    () => cyclones.find((c) => c.id === selectedCycloneId) ?? cyclones[0],
    [cyclones, selectedCycloneId]
  );

  const windTimeline = useMemo(
    () =>
      (cyclone?.track ?? []).map((pt) => ({
        date: pt.timestamp.slice(5, 10),
        speed: pt.windSpeed,
      })),
    [cyclone]
  );

  const pressureTimeline = useMemo(
    () =>
      (cyclone?.track ?? []).map((pt) => ({
        date: pt.timestamp.slice(5, 10),
        pressure: pt.pressure,
      })),
    [cyclone]
  );

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded() || !cyclone) return;
    updateCycloneTrackData(map, cyclone);
    popupRef.current?.remove();
  }, [cyclone]);

  // Sync storm-eye marker to current track index
  useEffect(() => {
    const map = mapRef.current;
    const pt = cyclone?.track[selectedTrackIndex];
    if (!map || !pt) return;

    eyeMarkerRef.current?.remove();
    const el = document.createElement("div");
    el.innerHTML = `<div style="width:20px;height:20px;border-radius:9999px;background:rgba(56,189,248,0.28);border:2px solid #38BDF8;display:flex;align-items:center;justify-content:center;box-shadow:0 0 14px rgba(56,189,248,0.5);"><div style="width:6px;height:6px;border-radius:9999px;background:#F8FAFC;"></div></div>`;
    eyeMarkerRef.current = new maplibregl.Marker({ element: el })
      .setLngLat([pt.lng, pt.lat])
      .addTo(map);
  }, [cyclone, selectedTrackIndex]);

  // Playback timer advancing track nodes calmly
  useEffect(() => {
    if (!isPlaying || !cyclone?.track.length) return;
    const timer = setInterval(() => {
      setSelectedTrackIndex((prev) => {
        if (prev >= cyclone.track.length - 1) {
          setIsPlaying(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1100);
    return () => clearInterval(timer);
  }, [isPlaying, cyclone]);

  const selectedTrackPoint =
    cyclone?.track[selectedTrackIndex] ?? cyclone?.track[0];

  const handleMapLoad = useCallback(
    (map: maplibregl.Map) => {
      mapRef.current = map;
      addDistrictLayers(map, geoData.districts);
      addHazardZoneLayers(map, geoData.hazardZones);
      addFloodZoneLayers(map, geoData.floodZones);
      addInfrastructureLayers(map, geoData.infrastructure);

      if (cyclone) {
        addCycloneTrackLayers(map, cyclone, {
          onTrackPointClick: (props) => {
            const idx = cyclone.track.findIndex(
              (pt) => pt.timestamp === props.timestamp
            );
            if (idx >= 0) setSelectedTrackIndex(idx);

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
                  <p class="text-xs text-[#94A3B8]">Central Pressure: ${props.pressure} hPa</p>
                </div>`
              )
              .addTo(map);
          },
        });
      }
    },
    [cyclone, geoData]
  );

  const focusTrackNode = (index: number) => {
    const safeIdx = Math.min(index, (cyclone?.track.length ?? 1) - 1);
    setSelectedTrackIndex(safeIdx);
    const pt = cyclone?.track[safeIdx];
    const map = mapRef.current;
    if (pt && map) {
      map.flyTo({
        center: [pt.lng, pt.lat],
        zoom: 7.2,
        duration: 450,
      });
      popupRef.current?.remove();
      popupRef.current = new maplibregl.Popup({ closeButton: true, offset: 10 })
        .setLngLat([pt.lng, pt.lat])
        .setHTML(
          `<div class="space-y-1">
            <p class="font-semibold text-sm text-[#F8FAFC]">${pt.category}</p>
            <p class="text-xs text-[#94A3B8]">Wind: <span class="text-[#38BDF8] font-medium">${pt.windSpeed} km/h</span> · ${pt.pressure} hPa</p>
          </div>`
        )
        .addTo(map);
    }
  };

  if (!cyclone) return null;

  return (
    <div className="min-h-screen bg-deep-ocean text-cloud-white py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Page Header & Event Selector ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <PageHeader
            title="Historical Cyclone Explorer"
            subtitle="Inspect archived storm trajectories, meteorological intensity, and historical event timelines across Odisha and the Bay of Bengal."
          />

          <div className="flex items-center gap-3 pb-8">
            <label
              htmlFor="explorer-cyclone-select"
              className="text-xs font-medium uppercase tracking-wider text-mist-gray"
            >
              Event
            </label>
            <select
              id="explorer-cyclone-select"
              value={selectedCycloneId}
              onChange={(e) => {
                setSelectedCycloneId(e.target.value);
                setSelectedTrackIndex(0);
              }}
              className="rounded-[10px] bg-ocean-surface border border-border px-3.5 py-2 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
            >
              {cyclones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.year})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ── 1. Cyclone Overview Card ── */}
        <SectionCard>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-2">
            <div className="lg:col-span-7 space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="font-heading text-2xl font-bold text-cloud-white">
                  {cyclone.name} ({cyclone.year})
                </h2>
                <HazardBadge level="Extreme" size="md" />
              </div>
              <p className="text-sm font-medium text-horizon-blue">
                {cyclone.category}
              </p>
              <p className="text-sm text-mist-gray leading-relaxed">
                {cyclone.description}
              </p>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-mist-gray mb-2">
                  Primary Affected Districts ({cyclone.affectedDistricts.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {cyclone.affectedDistricts.map((d) => (
                    <span
                      key={d}
                      className="rounded-full bg-deep-ocean border border-border-subtle px-3 py-1 text-xs capitalize text-cloud-white"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4">
                <div className="flex items-center gap-2 text-xs text-mist-gray">
                  <MapPin className="h-3.5 w-3.5 text-horizon-blue" />
                  Landfall Region
                </div>
                <p className="mt-2 font-heading text-lg font-semibold text-cloud-white">
                  {cyclone.landfallRegion}
                </p>
              </div>
              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4">
                <div className="flex items-center gap-2 text-xs text-mist-gray">
                  <Calendar className="h-3.5 w-3.5 text-monsoon-teal" />
                  Landfall Date
                </div>
                <p className="mt-2 font-heading text-lg font-semibold text-cloud-white">
                  {cyclone.landfallDate}
                </p>
              </div>
              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4">
                <div className="flex items-center gap-2 text-xs text-mist-gray">
                  <Wind className="h-3.5 w-3.5 text-hazard-high" />
                  Peak Sustained Wind
                </div>
                <p className="mt-2 font-heading text-lg font-semibold text-hazard-high">
                  {cyclone.maxWindSpeed} km/h
                </p>
              </div>
              <div className="rounded-[14px] bg-deep-ocean/70 border border-border-subtle p-4">
                <div className="flex items-center gap-2 text-xs text-mist-gray">
                  <Gauge className="h-3.5 w-3.5 text-terrain-sand" />
                  Minimum Pressure
                </div>
                <p className="mt-2 font-heading text-lg font-semibold text-terrain-sand">
                  {cyclone.minPressure} hPa
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* ── 2. Path Visualization Map ── */}
        <section aria-label="Cyclone Path Visualization">
          <div className="relative">
            <MapView
              center={[86.0, 17.8]}
              zoom={5.4}
              bayOfBengalLand={geoData.bayOfBengalLand}
              odishaGeo={geoData.odisha}
              onLoad={handleMapLoad}
              className="h-[460px] lg:h-[550px] w-full"
            >
              {/* Track Telemetry Overlay */}
              {selectedTrackPoint && (
                <div className="absolute top-4 left-4 z-10 rounded-[16px] glass-panel px-4 py-3 max-w-xs">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-horizon-blue">
                    Track Node Telemetry
                  </p>
                  <p className="mt-1 font-heading text-sm font-semibold text-cloud-white">
                    {selectedTrackPoint.category}
                  </p>
                  <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-mist-gray">
                    <span>
                      Coord:{" "}
                      <strong className="text-cloud-white">
                        {selectedTrackPoint.lat.toFixed(1)}°N,{" "}
                        {selectedTrackPoint.lng.toFixed(1)}°E
                      </strong>
                    </span>
                    <span>
                      Wind:{" "}
                      <strong className="text-horizon-blue">
                        {selectedTrackPoint.windSpeed} km/h
                      </strong>
                    </span>
                    <span>
                      Pressure:{" "}
                      <strong className="text-terrain-sand">
                        {selectedTrackPoint.pressure} hPa
                      </strong>
                    </span>
                    <span>
                      Date:{" "}
                      <strong className="text-cloud-white">
                        {selectedTrackPoint.timestamp.slice(0, 10)}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              {/* Map Legend */}
              <div className="absolute bottom-4 left-4 z-10 rounded-[14px] glass-panel px-4 py-2.5">
                <div className="flex flex-wrap items-center gap-4 text-xs text-mist-gray">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-monsoon-teal" />
                    Track Point
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-hazard-moderate" />
                    Peak Intensity
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-hazard-high" />
                    Landfall
                  </span>
                </div>
              </div>
            </MapView>

            {/* Track Playback Controller */}
            <div className="mt-4 rounded-[18px] bg-ocean-surface border border-border-subtle p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (
                      selectedTrackIndex >= cyclone.track.length - 1 &&
                      !isPlaying
                    ) {
                      setSelectedTrackIndex(0);
                    }
                    setIsPlaying((p) => !p);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-[10px] bg-horizon-blue px-3.5 py-2 text-xs font-semibold text-deep-ocean hover:bg-horizon-blue/90 transition-colors duration-[150ms]"
                >
                  {isPlaying ? (
                    <>
                      <Pause className="h-3.5 w-3.5" />
                      Pause Track
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5" />
                      Play Track
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setSelectedTrackIndex((prev) => Math.max(0, prev - 1));
                  }}
                  aria-label="Previous track node"
                  className="rounded-[10px] border border-border-subtle bg-deep-ocean p-2 text-mist-gray hover:text-cloud-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setSelectedTrackIndex((prev) =>
                      Math.min(cyclone.track.length - 1, prev + 1)
                    );
                  }}
                  aria-label="Next track node"
                  className="rounded-[10px] border border-border-subtle bg-deep-ocean p-2 text-mist-gray hover:text-cloud-white"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsPlaying(false);
                    setSelectedTrackIndex(0);
                  }}
                  aria-label="Reset track playback"
                  className="rounded-[10px] border border-border-subtle bg-deep-ocean p-2 text-mist-gray hover:text-cloud-white"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 flex items-center gap-3">
                <span className="text-[11px] font-mono text-mist-gray shrink-0">
                  Node {selectedTrackIndex + 1}/{cyclone.track.length}
                </span>
                <input
                  type="range"
                  min={0}
                  max={Math.max(0, cyclone.track.length - 1)}
                  value={selectedTrackIndex}
                  onChange={(e) => {
                    setIsPlaying(false);
                    setSelectedTrackIndex(Number(e.target.value));
                  }}
                  aria-label="Cyclone track node scrubber"
                  className="w-full accent-[#38BDF8]"
                />
                {selectedTrackPoint && (
                  <span className="text-xs font-mono text-horizon-blue shrink-0">
                    {selectedTrackPoint.windSpeed} km/h ·{" "}
                    {selectedTrackPoint.pressure} hPa
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── 3. Wind Speed & Pressure Charts ── */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SectionCard
            title="Maximum Wind Speed Evolution"
            subtitle="Sustained wind speed (km/h) from formation through dissipation"
          >
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={windTimeline}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="windFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38BDF8" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#38BDF8" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.1)"
                    vertical={false}
                  />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    unit=" km/h"
                    width={68}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F1E33",
                      border: "1px solid rgba(56, 189, 248, 0.2)",
                      borderRadius: "10px",
                      color: "#F8FAFC",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [`${val} km/h`, "Wind Speed"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="speed"
                    stroke="#38BDF8"
                    strokeWidth={2}
                    fill="url(#windFill)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>

          <SectionCard
            title="Estimated Central Pressure"
            subtitle="Core atmospheric pressure drop (hPa) during intensification"
          >
            <div className="h-[280px] w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={pressureTimeline}
                  margin={{ top: 8, right: 12, left: 0, bottom: 0 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(148, 163, 184, 0.1)"
                    vertical={false}
                  />
                  <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickLine={false} />
                  <YAxis
                    domain={[925, 1010]}
                    stroke="#94A3B8"
                    fontSize={12}
                    tickLine={false}
                    unit=" hPa"
                    width={68}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0F1E33",
                      border: "1px solid rgba(45, 212, 191, 0.2)",
                      borderRadius: "10px",
                      color: "#F8FAFC",
                      fontSize: "12px",
                    }}
                    formatter={(val) => [`${val} hPa`, "Pressure"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="pressure"
                    stroke="#2DD4BF"
                    strokeWidth={2.5}
                    dot={{ r: 3.5, fill: "#2DD4BF", stroke: "#07111D", strokeWidth: 1.5 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </SectionCard>
        </section>

        {/* ── 4. Event Timeline ── */}
        <SectionCard
          title="Chronological Event Timeline"
          subtitle="Click any milestone to focus the map on the corresponding storm track node"
        >
          <div className="relative pl-6 sm:pl-8 space-y-5 pt-2 before:absolute before:left-2.5 sm:before:left-3.5 before:top-4 before:bottom-4 before:w-px before:bg-border">
            {cyclone.timeline.map((entry, idx) => {
              const mappedTrackIdx = Math.min(idx, cyclone.track.length - 1);
              const isSelected = selectedTrackIndex === mappedTrackIdx;
              const isLandfall = entry.event === "Landfall";
              return (
                <div key={`${entry.date}-${entry.event}`} className="relative">
                  <span
                    className={cn(
                      "absolute -left-[22px] sm:-left-[26px] top-1.5 h-3.5 w-3.5 rounded-full border-2 border-deep-ocean transition-colors",
                      isLandfall
                        ? "bg-hazard-high"
                        : isSelected
                          ? "bg-horizon-blue"
                          : "bg-monsoon-teal/70"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => focusTrackNode(mappedTrackIdx)}
                    className={cn(
                      "w-full text-left rounded-[14px] border p-4 transition-colors duration-[150ms]",
                      isSelected
                        ? "bg-ocean-mid border-horizon-blue/40"
                        : "bg-deep-ocean/60 border-border-subtle hover:border-border"
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xs font-mono text-horizon-blue">
                          {entry.date}
                        </span>
                        <h3 className="font-heading text-base font-semibold text-cloud-white">
                          {entry.event}
                        </h3>
                      </div>
                      <span className="text-[11px] text-mist-gray">
                        Focus on map →
                      </span>
                    </div>
                    <p className="mt-1.5 text-sm text-mist-gray leading-relaxed">
                      {entry.description}
                    </p>
                  </button>
                </div>
              );
            })}
          </div>
        </SectionCard>

        {/* ── 5. Impact Summary ── */}
        <section aria-label="Historical Impact Summary">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="People Affected"
              value={formatCompact(impactSummary.peopleAffected)}
              interpretation="Estimated population across impacted Odisha & coastal regions"
              icon={Users}
            />
            <MetricCard
              label="Buildings Impacted"
              value={formatCompact(impactSummary.buildingsDamaged)}
              interpretation="Historical structures reported damaged across affected zones"
              hazardLevel="High"
              icon={Home}
            />
            <MetricCard
              label="Agricultural Area Affected"
              value={`${formatNumber(impactSummary.cropAreaAffected)} km²`}
              interpretation="Coastal cropland exposed to high winds and inundation"
              hazardLevel="Moderate"
              icon={Sprout}
            />
            <MetricCard
              label="Estimated Economic Loss"
              value={`₹${formatNumber(impactSummary.economicLoss)} Cr`}
              interpretation="Reported multi-sector regional infrastructure & asset impact"
              icon={IndianRupee}
            />
          </div>
        </section>

        {/* ── 6. Historical Context ── */}
        <SectionCard
          title="Historical Significance & Lessons for Infrastructure Planning"
          subtitle="Why Cyclone Fani (2019) serves as StormScope's primary reference case study"
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2 items-center">
            <div className="lg:col-span-8 space-y-3 text-sm text-mist-gray leading-relaxed">
              <p>
                Cyclone Fani formed in late April 2019 over the equatorial Indian Ocean
                and underwent rapid intensification in the Bay of Bengal, reaching
                Extremely Severe Cyclonic Storm intensity prior to making landfall near
                Puri, Odisha on 3 May 2019. Unlike most pre-monsoon Bay of Bengal
                cyclones, Fani sustained high energy along a prolonged northward track.
              </p>
              <p>
                While coordinated mass evacuations significantly reduced loss of life,
                power transmission networks, coastal settlements, healthcare facilities,
                and road corridors experienced prolonged disruption. Studying Fani&apos;s
                spatial footprint provides clear empirical grounding for evaluating
                coastal site exposure before future development.
              </p>
            </div>
            <div className="lg:col-span-4 rounded-[16px] bg-deep-ocean/70 border border-border-subtle p-5 space-y-3">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-monsoon-teal">
                <Compass className="h-4 w-4" />
                Apply Historical Context
              </div>
              <p className="text-xs text-mist-gray leading-relaxed">
                Explore how these coastal hazard patterns translate to specific
                coordinates and building profiles in the Assessment Workstation.
              </p>
              <Link
                href="/assessment"
                className="inline-flex items-center gap-1.5 rounded-[10px] bg-horizon-blue px-4 py-2 text-xs font-semibold text-deep-ocean hover:bg-horizon-blue/90 transition-colors duration-[150ms]"
              >
                Open Site Assessment
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}
