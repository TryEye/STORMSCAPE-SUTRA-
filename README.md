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

For production build verification:

```bash
cd stormscope
npm run lint
npm run build
npm run start
```

## Platform Routes

- `/` — **Landing Page**: Problem overview, platform workflow, interactive Odisha map preview, and research context.
- `/dashboard` — **Dashboard**: Summary metrics, cyclone/district/risk/layer controls, dominant MapLibre exposure map, exposure snapshot, district comparison chart, and planning recommendations.
- `/explorer` — **Cyclone Explorer**: Cyclone Fani trajectory map, wind & central pressure evolution charts, interactive chronological timeline, and impact summary.
- `/assessment` — **Site Assessment Workstation**: Location coordinate & building profile evaluation yielding historical exposure indicators and planning guidance.
- `/methodology` — **Methodology**: Data sources, 5-stage pipeline, analytical assumptions, limitations, and future service-oriented architecture.
- `/about` — **About**: Academic context, explicit scope boundaries, technology stack, and roadmap.

## Architecture & Constraints

- **100% Local Data**: Operates completely offline using local JSON and GeoJSON assets under `stormscope/src/data/` (`cyclones.json`, `districts.json`, `exposure.json`, `assessment.json`, `statistics.json`, and `geo/*.geojson`) with a self-contained MapLibre cartographic style.
- **Analytical Scope**: Evaluates historical exposure indicators and planning guidance only. Does not perform weather forecasting, structural engineering analysis, building collapse prediction, or construction approval.
