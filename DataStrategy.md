## Data Strategy

This document defines how data will be sourced, stored, represented, and displayed throughout the platform.

The purpose of this strategy is to support development of a complete demonstration-ready experience while preserving compatibility with future geospatial processing workflows.

---

# 1. Current Development Constraints

The current implementation is being developed as a presentation-ready platform.

At this stage:

- Docker services are not required.
- External data pipelines are not required.
- Database infrastructure is not required.
- Live GIS processing is not required.

The platform must remain fully functional without external dependencies.

---

# 2. Development Principle

Visual communication is more important than infrastructure complexity during the MVP phase.

The objective is to demonstrate:

- System workflow
- User experience
- Platform capabilities
- Visualization quality

before integrating advanced processing systems.

---

# 3. MVP Data Sources

The MVP uses local datasets stored directly within the project.

Primary Sources:

### JSON

Structured records for:

- Cyclone information
- District information
- Exposure metrics
- Dashboard summaries
- Assessment results

---

### GeoJSON

Geographic boundaries and map layers.

Examples:

- Odisha boundary
- District boundaries
- Demonstration hazard zones
- Example infrastructure layers

---

# 4. Recommended Folder Structure

```text
data/

├── cyclones.json
├── districts.json
├── assessment.json
├── exposure.json
├── statistics.json

├── geo/
│   ├── odisha.geojson
│   ├── districts.geojson
│   ├── hazard-zones.geojson
│   └── infrastructure.geojson
```

All demonstration datasets should remain human-readable.

Avoid unnecessary complexity.

---

# 5. Cyclone Dataset Structure

Each cyclone record should contain:

```json
{
  "id": "fani",
  "name": "Cyclone Fani",
  "year": 2019,
  "category": "Extremely Severe Cyclonic Storm",
  "landfallRegion": "Odisha",
  "description": "Historical case study event."
}
```

The structure should remain extensible for future cyclone additions.

---

# 6. District Dataset Structure

District records should contain:

```json
{
  "id": "puri",
  "name": "Puri",
  "exposureIndex": 82,
  "hazardCategory": "High"
}
```

The objective is to support map interactions and dashboard summaries.

---

# 7. Assessment Dataset Structure

Assessment outputs should contain:

```json
{
  "location": "Puri",
  "exposureIndex": 78,
  "floodIndicator": "Moderate",
  "terrainIndicator": "Low Elevation",
  "recommendation": "Additional Assessment Recommended"
}
```

Assessment records represent platform outputs rather than engineering conclusions.

---

# 8. Hazard Representation

Hazards should be represented categorically.

Categories:

```text
Low
Moderate
High
Extreme
```

Avoid displaying unexplained numerical scores without interpretation.

Users should understand what every metric means.

---

# 9. Demonstration Data Rules

The MVP may use demonstration data.

However:

- Values should appear realistic.
- Values should remain internally consistent.
- Values should not be presented as validated scientific findings.

---

# 10. Map Layers

The geospatial system should support:

Base Map

↓

Administrative Layer

↓

Cyclone Layer

↓

Hazard Layer

↓

Infrastructure Layer

↓

Interaction Layer

Each layer should be independently controllable.

---

# 11. Future Data Sources

Potential future integrations include:

- Indian Meteorological Department (IMD)
- OpenStreetMap
- Sentinel Imagery
- NASA EarthData
- SRTM Elevation Data
- Government Disaster Reports

These sources are future possibilities and should not be assumed to be currently integrated.

---

# 12. Future Service Architecture

Current MVP

```text
Frontend

↓

Local Data

↓

Visualization
```

Future Platform

```text
Frontend

↓

API Layer

↓

Processing Services

↓

Data Sources
```

The frontend architecture should remain compatible with this progression.

---

# 13. Performance Strategy

The MVP should prioritize:

- Fast page loads
- Lightweight datasets
- Minimal requests
- Local processing where practical

Demonstration performance is more important than dataset size.

---

# 14. Data Integrity Principles

All future datasets should satisfy:

Accuracy

Consistency

Traceability

Transparency

When uncertainty exists, it should be communicated clearly.

The platform should never imply certainty where only estimates exist.

---

# 15. Data Philosophy

The purpose of the data layer is not to overwhelm users with information.

The purpose of the data layer is to provide enough information for meaningful understanding.

Every dataset included in the application should directly support a user-facing insight, visualization, or decision-support workflow.
