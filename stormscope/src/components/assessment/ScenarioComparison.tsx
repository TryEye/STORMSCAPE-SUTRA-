"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ArrowUpDown, GitCompare, Search } from "lucide-react";
import { HazardBadge, MetricCard, SectionCard } from "@/components/ui/Cards";
import { getDistricts } from "@/data";
import { useDataRegistry } from "@/context/DataRegistryContext";
import { computeScenarioDistrictAnalysis } from "@/lib/engine";
import { cn } from "@/lib/utils";

export default function ScenarioComparison() {
  const { cyclones } = useDataRegistry();
  const districts = getDistricts();

  const [scenarioAId, setScenarioAId] = useState<string>(
    cyclones[0]?.id ?? "fani"
  );
  const [scenarioBId, setScenarioBId] = useState<string>(
    cyclones[1]?.id ?? cyclones[0]?.id ?? "phailin"
  );
  const [regionFilter, setRegionFilter] = useState<"all" | "coastal" | "inland">(
    "all"
  );
  const [searchTerm, setSearchTerm] = useState("");

  const cycloneA = useMemo(
    () => cyclones.find((c) => c.id === scenarioAId) ?? cyclones[0],
    [cyclones, scenarioAId]
  );
  const cycloneB = useMemo(
    () => cyclones.find((c) => c.id === scenarioBId) ?? cyclones[1] ?? cyclones[0],
    [cyclones, scenarioBId]
  );

  const analysisA = useMemo(
    () => computeScenarioDistrictAnalysis(cycloneA, districts),
    [cycloneA, districts]
  );
  const analysisB = useMemo(
    () => computeScenarioDistrictAnalysis(cycloneB, districts),
    [cycloneB, districts]
  );

  const mergedRows = useMemo(() => {
    const mapB = new Map(analysisB.map((b) => [b.districtId, b]));
    return analysisA
      .map((a) => {
        const b = mapB.get(a.districtId);
        const indexB = b?.exposureIndex ?? a.exposureIndex;
        return {
          districtId: a.districtId,
          districtName: a.districtName,
          coastal: a.coastal,
          elevationTier: a.elevationTier,
          indexA: a.exposureIndex,
          hazardA: a.hazardCategory,
          windA: a.windScore,
          surgeA: a.surgeScore,
          indexB,
          hazardB: b?.hazardCategory ?? a.hazardCategory,
          delta: a.exposureIndex - indexB,
        };
      })
      .filter((r) => {
        if (regionFilter === "coastal" && !r.coastal) return false;
        if (regionFilter === "inland" && r.coastal) return false;
        if (
          searchTerm.trim() &&
          !r.districtName.toLowerCase().includes(searchTerm.trim().toLowerCase())
        ) {
          return false;
        }
        return true;
      });
  }, [analysisA, analysisB, regionFilter, searchTerm]);

  const topChartRows = useMemo(
    () =>
      [...mergedRows]
        .sort((x, y) => Math.max(y.indexA, y.indexB) - Math.max(x.indexA, x.indexB))
        .slice(0, 10),
    [mergedRows]
  );

  const meanA = (
    mergedRows.reduce((s, r) => s + r.indexA, 0) / Math.max(1, mergedRows.length)
  ).toFixed(1);
  const meanB = (
    mergedRows.reduce((s, r) => s + r.indexB, 0) / Math.max(1, mergedRows.length)
  ).toFixed(1);
  const highExposureCountA = mergedRows.filter(
    (r) => r.hazardA === "Extreme" || r.hazardA === "High"
  ).length;
  const highExposureCountB = mergedRows.filter(
    (r) => r.hazardB === "Extreme" || r.hazardB === "High"
  ).length;

  return (
    <div className="space-y-8">
      {/* Scenario Selector Bar */}
      <div className="rounded-[18px] bg-ocean-surface border border-border-subtle p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-horizon-blue" />
            <label
              htmlFor="scenario-a"
              className="text-xs font-medium text-mist-gray"
            >
              Scenario A
            </label>
            <select
              id="scenario-a"
              value={scenarioAId}
              onChange={(e) => setScenarioAId(e.target.value)}
              className="rounded-[10px] bg-deep-ocean border border-border px-3 py-1.5 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
            >
              {cyclones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.year})
                </option>
              ))}
            </select>
          </div>

          <ArrowUpDown className="h-4 w-4 text-storm-gray hidden sm:block" />

          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-monsoon-teal" />
            <label
              htmlFor="scenario-b"
              className="text-xs font-medium text-mist-gray"
            >
              Scenario B
            </label>
            <select
              id="scenario-b"
              value={scenarioBId}
              onChange={(e) => setScenarioBId(e.target.value)}
              className="rounded-[10px] bg-deep-ocean border border-border px-3 py-1.5 text-sm text-cloud-white focus:border-horizon-blue focus:outline-none"
            >
              {cyclones.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.year})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "All 30 Districts"],
              ["coastal", "Coastal (6)"],
              ["inland", "Inland (24)"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setRegionFilter(key)}
              className={cn(
                "rounded-[10px] px-3 py-1.5 text-xs font-medium border transition-colors duration-[150ms]",
                regionFilter === key
                  ? "bg-horizon-blue/15 text-horizon-blue border-horizon-blue/40"
                  : "bg-deep-ocean/70 text-mist-gray border-border-subtle hover:text-cloud-white"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Comparative Summary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label={`${cycloneA?.name} Mean Index`}
          value={`${meanA} / 100`}
          interpretation={`Landfall: ${cycloneA?.landfallRegion}`}
          icon={GitCompare}
        />
        <MetricCard
          label={`${cycloneB?.name} Mean Index`}
          value={`${meanB} / 100`}
          interpretation={`Landfall: ${cycloneB?.landfallRegion}`}
          icon={GitCompare}
        />
        <MetricCard
          label={`${cycloneA?.name} High/Extreme`}
          value={`${highExposureCountA} Districts`}
          interpretation="Districts scoring >= 68 composite exposure"
          hazardLevel={highExposureCountA >= 4 ? "High" : "Moderate"}
        />
        <MetricCard
          label={`${cycloneB?.name} High/Extreme`}
          value={`${highExposureCountB} Districts`}
          interpretation="Districts scoring >= 68 composite exposure"
          hazardLevel={highExposureCountB >= 4 ? "High" : "Moderate"}
        />
      </div>

      {/* Grouped Horizontal Bar Chart */}
      <SectionCard
        title="Multi-Scenario District Exposure Comparison"
        subtitle={`Comparing top 10 affected Odisha districts between ${cycloneA?.name} (${cycloneA?.year}) and ${cycloneB?.name} (${cycloneB?.year})`}
      >
        <div className="h-[360px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={topChartRows}
              layout="vertical"
              margin={{ top: 8, right: 24, left: 24, bottom: 8 }}
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
                  border: "1px solid rgba(56, 189, 248, 0.25)",
                  borderRadius: "10px",
                  color: "#F8FAFC",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px", color: "#94A3B8" }} />
              <Bar
                name={`${cycloneA?.name} (${cycloneA?.year})`}
                dataKey="indexA"
                fill="#38BDF8"
                radius={[0, 4, 4, 0]}
                barSize={11}
              />
              <Bar
                name={`${cycloneB?.name} (${cycloneB?.year})`}
                dataKey="indexB"
                fill="#2DD4BF"
                radius={[0, 4, 4, 0]}
                barSize={11}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SectionCard>

      {/* District Analytical Matrix */}
      <SectionCard
        title="District Hazard & Scenario Comparison Matrix"
        subtitle="Repeatable wind, surge, terrain, and inter-scenario delta breakdown across Odisha districts"
      >
        <div className="pt-2 space-y-4">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-mist-gray" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter district name…"
              aria-label="Filter district name"
              className="w-full rounded-[10px] bg-deep-ocean border border-border pl-9 pr-3 py-1.5 text-xs text-cloud-white focus:border-horizon-blue focus:outline-none"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border-subtle text-mist-gray">
                  <th className="py-2.5 pr-4 font-medium">District</th>
                  <th className="py-2.5 pr-4 font-medium">Terrain Tier</th>
                  <th className="py-2.5 pr-4 font-medium">Wind (A)</th>
                  <th className="py-2.5 pr-4 font-medium">Surge (A)</th>
                  <th className="py-2.5 pr-4 font-medium">{cycloneA?.name}</th>
                  <th className="py-2.5 pr-4 font-medium">{cycloneB?.name}</th>
                  <th className="py-2.5 font-medium">Delta (A−B)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {mergedRows.map((row) => (
                  <tr key={row.districtId} className="hover:bg-ocean-mid/35">
                    <td className="py-2.5 pr-4 font-semibold text-cloud-white">
                      {row.districtName}
                    </td>
                    <td className="py-2.5 pr-4 text-mist-gray">
                      {row.elevationTier}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-horizon-blue">
                      {row.windA}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-monsoon-teal">
                      {row.surgeA}
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="font-mono font-semibold text-cloud-white">
                          {row.indexA}
                        </span>
                        <HazardBadge level={row.hazardA} />
                      </span>
                    </td>
                    <td className="py-2.5 pr-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="font-mono font-semibold text-cloud-white">
                          {row.indexB}
                        </span>
                        <HazardBadge level={row.hazardB} />
                      </span>
                    </td>
                    <td
                      className={cn(
                        "py-2.5 font-mono font-semibold",
                        row.delta > 0
                          ? "text-hazard-high"
                          : row.delta < 0
                            ? "text-monsoon-teal"
                            : "text-mist-gray"
                      )}
                    >
                      {row.delta > 0 ? `+${row.delta}` : row.delta}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}
