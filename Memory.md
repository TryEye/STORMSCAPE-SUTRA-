## Project Memory

Purpose:

This document acts as the project's operational memory.

Before beginning work, review this file.

After completing significant work, update this file.

The goal is to prevent repeated decisions, duplicated work, and project drift.

Keep entries factual and concise.

Newest information should appear first.

---

# Current State

Current Phase:

Phase 4 — Assessment Engine

Status:

Phases 1–4 implemented inside `/stormscope` (Presentation MVP, Geospatial Foundation, Data Integration, and Assessment Engine).

All routes (`/`, `/dashboard`, `/explorer`, `/assessment`, `/pipeline`, `/methodology`, `/about`) operate with repeatable multi-factor exposure scoring (`src/lib/engine.ts`), scenario-driven district choropleth & chart updates, multi-cyclone site sensitivity analysis, Scenario & District Comparison matrices, and JSON assessment summary export.

---

# Current Objective

Build a presentation-quality platform capable of demonstrating:

- Historical cyclone exploration
- Hazard visualization
- Exposure assessment
- Infrastructure planning workflows

The platform should be suitable for:

- Faculty reviews
- Academic presentations
- Project demonstrations
- Technical discussions

The immediate goal is not production deployment.

The immediate goal is a complete and convincing demonstration.

---

# What Exists

Documentation:

- PRD.md
- Architecture.md
- Design.md
- DesignSystem.md
- Pages.md
- Phases.md
- DataStrategy.md
- PresentationMode.md
- Memory.md

Project Direction:

- Odisha is the primary geographical focus.
- Cyclone Fani (2019) is the primary case study.
- Historical analysis is prioritized over forecasting.
- Exposure assessment is prioritized over damage prediction.

Design Direction:

- Cartographic
- Environmental intelligence
- Satellite-inspired
- Map-first experience

Technology Direction:

- Next.js
- TypeScript
- Tailwind CSS
- MapLibre
- Recharts
- Framer Motion

---

# What Does Not Exist Yet

The MVP currently does not include:

- Authentication
- User accounts
- Database infrastructure
- Docker processing services
- Real-time geospatial processing
- Operational datasets
- Administrative interfaces

These systems are intentionally deferred.

---

# Open Questions

### Data Availability

Which datasets will be available during future development phases?

Potential candidates:

- IMD
- Sentinel
- OpenStreetMap
- NASA EarthData
- SRTM DEM

Dataset acquisition remains unresolved.

---

### Additional Cyclone Case Studies

Potential expansion candidates remain undecided.

Examples:

- Dana
- Amphan
- Other Odisha cyclone events

Current MVP assumes Cyclone Fani only.

---

### Assessment Methodology

Historical exposure indicators have been defined.

Final scoring methodology remains open.

Scoring logic should remain interpretable rather than opaque.

---

### Real Geospatial Processing

The future processing architecture remains under consideration.

Current MVP uses demonstration datasets.

---

# Non-Negotiable Decisions

The platform is:

- A historical analysis platform.
- An educational and planning tool.
- A demonstration-oriented MVP.

The platform is NOT:

- A forecasting platform.
- A weather prediction platform.
- A building collapse prediction platform.
- An emergency response platform.

These boundaries must remain consistent across all future work.

---

# Development Priorities

Priority Order:

1. Visual Quality
2. User Experience
3. Map Experience
4. Information Architecture
5. Data Quality
6. Processing Complexity

The platform should communicate value clearly before introducing advanced infrastructure.

---

# Recommended Implementation Order

1. Landing Page
2. Shared Layout Components
3. Dashboard
4. Explorer
5. Assessment
6. Methodology
7. About
8. Map Enhancements
9. Visual Refinement

The dashboard and assessment pages represent the highest-value screens.

---

# Known Constraints

Current development assumes:

- No Docker access
- No production infrastructure
- No live processing services
- Limited development time

The architecture should remain compatible with future backend integration.

---

# Session Log

### Service-Adapter Readiness, Track Playback & Visual Polish

Implemented:

- Added future-compatible Service Adapter Layer (`src/services/contracts.ts`, `src/services/localAdapters.ts`) providing async interfaces and local MVP adapters for `HazardEngine`, `ExposureEngine`, `AssessmentEngine`, `ValidationEngine`, and `ReportingEngine` without introducing Docker or backend dependencies
- Added interactive node-by-node Cyclone Track Playback (`Play / Pause / Step / Scrubber` + moving storm-eye marker) to `/explorer`
- Added Markdown Exposure Brief export on `/dashboard` and `/assessment` via `LocalReportingService`
- Added collapsible 5-Minute Presenter Demo Guide (`DemoGuide.tsx`) in shared layout

### Phase 4 Assessment Engine Implementation

Implemented:

- Built repeatable multi-factor exposure scoring engine (`src/lib/engine.ts`) computing track-proximity wind attenuation, surge/flood susceptibility, terrain vulnerability, and composite district scores dynamically per cyclone scenario
- Wired dynamic scenario-based district GeoJSON updates and KPI/chart recalculation on `/dashboard`
- Added weighted factor decomposition, multi-cyclone site sensitivity table, exportable JSON summary, and a dedicated Scenario & District Comparison module (`ScenarioComparison.tsx`) on `/assessment`

### Phase 3 Data Integration & MapLibre Worker Fix

Implemented & Resolved:

- Resolved MapLibre GL v6 WebWorker 404 in Next.js 16 Turbopack by serving `public/maplibre-gl-worker.mjs` and calling `maplibregl.setWorkerUrl("/maplibre-gl-worker.mjs")` in `MapView.tsx`
- Added multi-cyclone IMD archives (`Fani 2019`, `Phailin 2013`, `Dana 2024`), SRTM DEM elevation bands (`dem-elevation.geojson`), and GPM/IMD rainfall swaths (`rainfall-bands.geojson`)
- Built Phase 3 Data Integration & Validation Hub (`/pipeline`) with schema/CRS/bounds validator (`src/lib/pipeline.ts`), sample ingestion presets (IMD Hudhud CSV, OSM Shelters GeoJSON, Sentinel-1 SAR Flood GeoJSON), and live `DataRegistryContext` wired into `/dashboard` and `/explorer`

### Phase 2 Geospatial Foundation Implementation

Implemented:

- Real simplified Odisha state boundary (`odisha.geojson`), Eastern India coastline context (`bay-of-bengal-land.geojson`), and all 30 Odisha districts (`districts.geojson` + `districts.json`) with bounding boxes, centroids, coastal flags, and elevation tiers
- Coastal storm surge & flood susceptibility polygons (`flood-zones.geojson`) and expanded Odisha critical infrastructure (`infrastructure.geojson`: NH-16/316/53/55, ports, hospitals, cyclone shelters, inland hubs)
- Upgraded `MapView` and `src/maps/layers.ts` with metric scale bar, live coordinate cursor readout, district hover highlight/inspection, `fitBounds` zooming, and layer opacity controls
- Added Coastal vs. Inland comparison & Asset Category exposure breakdown charts on `/dashboard`
- Added client-side point-in-polygon spatial intersection (`src/lib/spatial.ts`) in `/assessment` for real district, flood-zone, and hazard-corridor evaluation

### Phase 1 Presentation MVP Implementation

Implemented:

- Next.js App Router project in `/stormscope` with Tailwind CSS v4 design system tokens (`#07111D`, `#0F1E33`, `#38BDF8`, `#2DD4BF`, Space Grotesk + Inter)
- Local data layer (`cyclones.json`, `districts.json`, `exposure.json`, `assessment.json`, `statistics.json`, `odisha.geojson`, `districts.geojson`, `hazard-zones.geojson`, `infrastructure.geojson`, `bay-of-bengal-land.geojson`)
- Self-contained offline-capable MapLibre cartographic style (`src/maps/cartoStyle.ts`) and shared layer builders (`src/maps/layers.ts`)
- Complete pages in priority order: Shared Layout, Landing Page (`/`), Dashboard (`/dashboard`), Explorer (`/explorer`), Assessment (`/assessment`), Methodology (`/methodology`), and About (`/about`)

### Initial Planning

Defined:

- Product direction
- Information architecture
- Design language
- Development phases
- Data strategy
- Page specifications

Outcome:

A complete documentation-driven MVP plan has been established.

Next Step:

Frontend implementation.

---

# Update Rules

After each work session:

Update:

- Current State
- Current Objective
- What Exists
- Open Questions
- Session Log

Do not delete historical decisions.

When requirements change, record the decision and reason for the change.

This file should always provide enough context for a contributor to understand the current state of the project within a few minutes.
