import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { HazardLevel } from "@/types";

/** Merge Tailwind classes safely */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Map hazard level to its design system color */
export function getHazardColor(level: HazardLevel): string {
  const colors: Record<HazardLevel, string> = {
    Low: "#22C55E",
    Moderate: "#F59E0B",
    High: "#EF4444",
    Extreme: "#B91C1C",
  };
  return colors[level];
}

/** Map hazard level to Tailwind text color class */
export function getHazardTextClass(level: HazardLevel): string {
  const classes: Record<HazardLevel, string> = {
    Low: "text-hazard-low",
    Moderate: "text-hazard-moderate",
    High: "text-hazard-high",
    Extreme: "text-hazard-extreme",
  };
  return classes[level];
}

/** Map hazard level to Tailwind bg color class */
export function getHazardBgClass(level: HazardLevel): string {
  const classes: Record<HazardLevel, string> = {
    Low: "bg-hazard-low",
    Moderate: "bg-hazard-moderate",
    High: "bg-hazard-high",
    Extreme: "bg-hazard-extreme",
  };
  return classes[level];
}

/** Format large numbers with commas */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-IN");
}

/** Format a number as a compact string (1.2K, 3.4M) */
export function formatCompact(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}
