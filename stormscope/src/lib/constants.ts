// ═══════════════════════════════════════════════════════
// Design System Constants
// Single source of truth for DesignSystem.md values
// ═══════════════════════════════════════════════════════

export const colors = {
  deepOcean: "#07111D",
  oceanSurface: "#0F1E33",
  oceanMid: "#132842",
  horizonBlue: "#38BDF8",
  monsoonTeal: "#2DD4BF",
  terrainSand: "#D6C3A5",
  cloudWhite: "#F8FAFC",
  mistGray: "#94A3B8",
  stormGray: "#64748B",

  hazard: {
    low: "#22C55E",
    moderate: "#F59E0B",
    high: "#EF4444",
    extreme: "#B91C1C",
  },
} as const;

export const NAV_ITEMS = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Explorer", href: "/explorer" },
  { label: "Assessment", href: "/assessment" },
  { label: "Data Hub", href: "/pipeline" },
  { label: "Methodology", href: "/methodology" },
  { label: "About", href: "/about" },
] as const;

/** Odisha center coordinates for map initialization */
export const ODISHA_CENTER: [number, number] = [84.4, 20.5];
export const ODISHA_ZOOM = 6.8;
