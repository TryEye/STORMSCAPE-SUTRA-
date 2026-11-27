import { cn } from "@/lib/utils";
import type { HazardLevel } from "@/types";
import { getHazardColor } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// ── MetricCard: single metric + interpretation (DesignSystem.md §10) ──

interface MetricCardProps {
  value: string | number;
  label: string;
  interpretation?: string;
  hazardLevel?: HazardLevel;
  icon?: LucideIcon;
  className?: string;
}

export function MetricCard({
  value,
  label,
  interpretation,
  hazardLevel,
  icon: Icon,
  className,
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-[18px] bg-ocean-surface border border-border-subtle p-5",
        "hover:border-border transition-colors duration-[250ms]",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm text-mist-gray">{label}</p>
          <p
            className="text-2xl font-heading font-semibold"
            style={hazardLevel ? { color: getHazardColor(hazardLevel) } : undefined}
          >
            {value}
          </p>
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-horizon-blue/8 border border-horizon-blue/12">
            <Icon className="h-5 w-5 text-horizon-blue" />
          </div>
        )}
      </div>
      {interpretation && (
        <p className="mt-3 text-xs text-mist-gray leading-relaxed">
          {interpretation}
        </p>
      )}
    </div>
  );
}

// ── SectionCard: generic container ──

interface SectionCardProps {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({
  title,
  subtitle,
  children,
  className,
  noPadding,
}: SectionCardProps) {
  return (
    <div
      className={cn(
        "rounded-[18px] bg-ocean-surface border border-border-subtle overflow-hidden",
        className
      )}
    >
      {(title || subtitle) && (
        <div className="px-6 pt-5 pb-3">
          {title && (
            <h3 className="font-heading text-lg font-semibold text-cloud-white">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-mist-gray">{subtitle}</p>
          )}
        </div>
      )}
      <div className={noPadding ? "" : "px-6 pb-5"}>{children}</div>
    </div>
  );
}

// ── HazardBadge ──

interface HazardBadgeProps {
  level: HazardLevel;
  size?: "sm" | "md";
  className?: string;
}

export function HazardBadge({ level, size = "sm", className }: HazardBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium border",
        size === "sm" ? "px-2.5 py-0.5 text-xs" : "px-3 py-1 text-sm",
        className
      )}
      style={{
        color: getHazardColor(level),
        borderColor: `${getHazardColor(level)}30`,
        backgroundColor: `${getHazardColor(level)}12`,
      }}
    >
      {level}
    </span>
  );
}

// ── PageHeader ──

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, subtitle, children }: PageHeaderProps) {
  return (
    <div className="mb-8">
      <h1 className="font-heading text-3xl sm:text-4xl font-bold text-cloud-white">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-base text-mist-gray max-w-2xl">{subtitle}</p>
      )}
      {children}
    </div>
  );
}

// ── SectionHeading (for landing page sections) ──

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "mb-10",
        align === "center" && "text-center mx-auto max-w-2xl"
      )}
    >
      {eyebrow && (
        <p className="text-sm font-medium text-horizon-blue uppercase tracking-wider mb-2">
          {eyebrow}
        </p>
      )}
      <h2 className="font-heading text-2xl sm:text-3xl font-bold text-cloud-white">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base text-mist-gray leading-relaxed">
          {description}
        </p>
      )}
    </div>
  );
}
