## StormScope — System Architecture

### Historical Cyclone Exposure Assessment and Infrastructure Planning Platform

This document describes the planned architecture of StormScope, the responsibilities of each system layer, and the evolution path from the current presentation-oriented MVP toward a complete geospatial analysis platform.

---

## 1. Architectural Principles

The architecture follows five guiding principles:

### A. Visual First

Maps, spatial layers, exposure indicators, and summaries should communicate insights before users need to read technical details.

### B. Historical Analysis Over Forecasting

StormScope reconstructs and analyzes historical cyclone events.

The platform does not function as a forecasting system.

### C. Progressive Complexity

The initial MVP prioritizes usability and demonstration capability.

More advanced geospatial processing can be integrated later without redesigning the frontend.

### D. Modular Processing

Hazard analysis, exposure analysis, visualization, and reporting are treated as independent layers.

### E. Future Compatibility

The MVP must remain compatible with future Docker-based processing services, GIS workflows, and external data sources.

---

# 2. High Level System Flow

Visitor

↓

Landing Page

↓

Dashboard

↓

Cyclone Analysis Selection

↓

Processing Layer

↓

Visualization Layer

↓

Results & Insights

---

# 3. Application Flow

Visitor Opens Website

↓

Landing Page

↓

Select Historical Cyclone

↓

Select District or Location

↓

Configure Assessment

↓

Generate Exposure Assessment

↓

View Interactive Results

↓

Analyze Infrastructure Insights

↓

Export Summary

---

# 4. Frontend Layer

The frontend acts as the primary interaction layer for users.

Responsibilities:

- Interface rendering
- User interactions
- Data visualization
- Map rendering
- Dashboard presentation
- Reporting views

Recommended Technologies:

- Next.js
- TypeScript
- Tailwind CSS
- ShadCN UI
- Framer Motion
- MapLibre GL
- Recharts

---

# 5. Core Application Modules

## A. Cyclone Explorer

Purpose:

Allow exploration of historical cyclone events.

Current MVP:

- Cyclone Fani
- Odisha District Selection

Future:

- Multiple cyclone support

Outputs:

- Cyclone information
- Path visualization
- Event summary

---

## B. Hazard Assessment Module

Purpose:

Estimate historical hazard distribution.

Inputs:

- Cyclone
- District
- Terrain factors

Outputs:

- Hazard zones
- Regional severity indicators

Future Expansion:

- Rainfall integration
- DEM integration
- Flood extent integration

---

## C. Exposure Assessment Module

Purpose:

Measure infrastructure exposure.

Assets:

- Buildings
- Roads
- Settlements

Outputs:

- Potentially exposed structures
- Exposure indicators
- Spatial summaries

Important:

Exposure does not imply damage.

---

## D. Construction Suitability Module

Purpose:

Support infrastructure planning workflows.

User Inputs:

- Location
- Building Category
- Building Height

Outputs:

- Historical Exposure Score
- Hazard Indicator
- Terrain Insight
- Development Recommendation

The module evaluates historical exposure characteristics only.

It does not predict structural failure.

---

## E. Reporting Module

Purpose:

Present findings clearly.

Outputs:

- Charts
- Maps
- Summary cards
- Recommendation panels

---

# 6. MVP Data Layer

Current MVP operates without backend infrastructure.

Data Sources:

Local JSON

Example:

/data/cyclones.json
/data/districts.json
/data/exposure.json

GeoJSON

Example:

/data/odisha.geojson
/data/district-boundaries.geojson

Benefits:

- Fast deployment
- Demonstration ready
- No infrastructure dependency

---

# 7. Future Data Layer

Future versions may integrate:

- IMD datasets
- Sentinel data
- OpenStreetMap
- NASA EarthData
- SRTM DEM

Through service APIs and processing containers.

---

# 8. Visualization Architecture

Maps serve as the primary information surface.

Map Layers:

Base Map

↓

Administrative Boundaries

↓

Cyclone Layer

↓

Hazard Layer

↓

Infrastructure Layer

↓

Analysis Layer

↓

User Interactions

---

# 9. Performance Strategy

The application prioritizes perceived responsiveness.

Strategies:

- Static generation where possible
- Lazy loaded maps
- Progressive data loading
- Lightweight datasets
- Component reuse
- Route segmentation

---

# 10. Future Service Architecture

Current MVP

Frontend

↓

Local Data

↓

Visualization

Future Platform

Frontend

↓

API Gateway

↓

Docker Services

├── Hazard Engine
├── Exposure Engine
├── Validation Engine
└── Reporting Engine

↓

Geospatial Datasets

---

# 11. Folder Structure

```text
stormscope/src/
├── app/                # App Router pages (/, /dashboard, /explorer, /assessment, /pipeline, /methodology, /about)
├── components/         # Modular UI, layout, landing, dashboard, explorer, assessment, pipeline, maps
├── context/            # Session DataRegistryContext for validated custom tracks & overlays
├── data/               # Local JSON datasets + geo/ GeoJSON layers + geo.server.ts loader
├── lib/                # Spatial point-in-polygon, repeatable scoring engine, pipeline validator, utils
├── maps/               # Self-contained MapLibre style (cartoStyle.ts) & reusable layer builders (layers.ts)
├── services/           # Async service contracts & local MVP adapters (Hazard, Exposure, Assessment, Validation, Reporting)
└── types/              # Strict TypeScript domain models
```

---

# 12. Architectural Boundaries

StormScope shall not:

- Predict future cyclone events
- Predict confirmed infrastructure damage
- Predict building failure
- Replace disaster management authorities

StormScope shall:

- Reconstruct historical scenarios
- Visualize hazard indicators
- Assess infrastructure exposure
- Support educational and planning workflows

---

# Architecture Status

Current Phase:

Phases 1–4 Implemented (with Local Service Adapter Layer for Phase 5 Readiness)

Primary Goal:

Deliver a visually compelling historical cyclone exposure assessment platform suitable for academic demonstrations while preserving a clean migration path via `src/services/` toward containerized backend geospatial processing engines.
