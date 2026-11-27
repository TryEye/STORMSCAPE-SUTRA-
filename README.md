# StormScope

**Historical Cyclone Exposure Assessment and Infrastructure Planning Platform**

StormScope is a presentation-quality geospatial analysis MVP focused on **Odisha, India** and the **Cyclone Fani (2019)** case study. It transforms archived cyclone tracks, administrative boundaries, hazard corridors, and infrastructure layers into an interactive, map-first planning experience.

## Quick Start

```bash
cd stormscope
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

For verification and production build:

```bash
cd stormscope
npm test
npm run lint
npm run build
npm run start
```

## Platform Routes

- `/` — **Landing Page**: Problem overview, platform workflow, interactive Odisha map preview, and research context.
- `/dashboard` — **Dashboard**: Multi-cyclone scenario selector, 30-district selector & hover inspection, layer opacity controls (Districts, Wind Hazard, Coastal Flood/Surge, SRTM DEM, GPM Rainfall, Track, Infrastructure), exposure snapshot, district & asset charts, and Markdown brief export.
- `/explorer` — **Cyclone Explorer**: Multi-cyclone trajectory map with interactive node-by-node playback, wind & central pressure charts, chronological timeline, and impact summary.
- `/assessment` — **Assessment & Scenario Engine**: Site coordinate & building profile evaluation (with point-in-polygon district/flood intersection, factor weights, multi-cyclone sensitivity, JSON/Markdown export) plus a 30-district Scenario & Hazard Comparison matrix.
- `/pipeline` — **Data Hub**: Phase 3 local GeoJSON and IMD-style CSV schema/bounds validation pipeline with one-click reference samples and live session layer registration.
- `/methodology` — **Methodology**: Data sources, 5-stage pipeline, analytical assumptions, limitations, and future service-oriented architecture.
- `/about` — **About**: Academic context, explicit scope boundaries, technology stack, and roadmap.

## Architecture & Constraints

- **100% Local Data**: Operates completely offline using local JSON and GeoJSON assets under `stormscope/src/data/` (`cyclones.json`, `districts.json`, `exposure.json`, `assessment.json`, `statistics.json`, and `geo/*.geojson`) with a self-contained MapLibre cartographic style.
- **Analytical Scope**: Evaluates historical exposure indicators and planning guidance only. Does not perform weather forecasting, structural engineering analysis, building collapse prediction, or construction approval.
