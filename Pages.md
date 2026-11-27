## Pages

This document defines every screen, route, section, and primary user flow within the application.

The MVP should focus on demonstrating the complete StormScope workflow rather than implementing every future capability.

Every page should have a clear purpose.

No page should exist solely to fill navigation space.

---

# Application Navigation

Primary Navigation

- Home
- Dashboard
- Explorer
- Assessment
- Methodology
- About

---

# 1. Home

Route:

```text
/
```

Purpose:

Introduce the platform and immediately communicate what the system does.

The homepage should function as a narrative rather than a dashboard.

---

## Section 1

Hero

Purpose:

Establish identity.

Content:

- Project title
- Project description
- Primary action button
- Background cyclone visualization

Primary Message:

Historical Cyclone Exposure Assessment and Infrastructure Planning Platform

---

## Section 2

The Problem

Purpose:

Explain why StormScope exists.

Topics:

- Fragmented historical datasets
- Difficulty understanding cyclone impacts
- Need for accessible analysis tools

---

## Section 3

Platform Overview

Purpose:

Introduce core capabilities.

Cards:

- Historical Analysis
- Hazard Mapping
- Exposure Assessment
- Construction Assessment

---

## Section 4

How It Works

Purpose:

Explain workflow.

Visual Sequence:

Historical Data

↓

Hazard Estimation

↓

Exposure Analysis

↓

Assessment

↓

Insights

---

## Section 5

Interactive Preview

Purpose:

Show a preview of the dashboard.

Allow users to see example outputs.

---

## Section 6

Project Context

Purpose:

Explain academic background.

Topics:

- Odisha focus
- Cyclone Fani case study
- Educational objectives

---

## Section 7

Footer

Standard project information.

---

# 2. Dashboard

Route:

```text
/dashboard
```

Purpose:

Central analysis interface.

This is the most important screen in the application.

Users should gain value within seconds.

---

## Dashboard Layout

Top Summary Layer

↓

Map Layer

↓

Exposure Layer

↓

Recommendation Layer

---

## Top Summary Layer

Contains:

- Cyclone Selected
- District Selected
- Hazard Category
- Historical Exposure Index

Displayed as compact summary cards.

---

## Analysis Controls

Location:

Above map.

Controls:

- Cyclone Selector
- District Selector
- Risk Filter
- Reset Filter

---

## Map Layer

Purpose:

Show geographical context.

Display:

- Odisha
- District boundaries
- Cyclone layer
- Hazard layer
- Infrastructure layer

The map should dominate the visible viewport.

---

## Exposure Snapshot

Metrics:

- Potentially Exposed Buildings
- Potentially Exposed Roads
- Potentially Exposed Settlements
- Estimated Hazard Area

---

## Insights Panel

Purpose:

Translate numbers into understandable observations.

Examples:

- Highest exposure district
- Infrastructure concentration
- Terrain observations

---

# 3. Explorer

Route:

```text
/explorer
```

Purpose:

Explore historical cyclone scenarios.

Focus:

Understanding the event itself.

---

## Cyclone Overview

Display:

- Cyclone name
- Year
- Landfall region
- Impact summary

---

## Event Timeline

Visual timeline showing:

- Formation
- Intensification
- Landfall
- Dissipation

---

## Path Visualization

Display cyclone track.

Purpose:

Help understand geographical movement.

---

## Historical Context

Explain event significance.

---

# 4. Assessment

Route:

```text
/assessment
```

Purpose:

Evaluate a proposed development location.

This page should feel like a planning workstation.

---

## Input Panel

Fields:

- Latitude
- Longitude
- Building Category
- Building Height

Examples:

- School
- Hospital
- Residential
- Commercial

---

## Site Overview

Display:

Chosen location.

Map centered on site.

---

## Exposure Indicators

Display:

- Historical Exposure Index
- Flood Susceptibility Indicator
- Terrain Indicator
- Cyclone Frequency Indicator

---

## Assessment Summary

Purpose:

Provide interpretation.

Categories:

- Low Historical Exposure
- Moderate Historical Exposure
- High Historical Exposure

---

## Development Guidance

Examples:

Suitable For Development

Additional Investigation Recommended

Requires Detailed Assessment

Use guidance language.

Never use approval language.

---

# 5. Methodology

Route:

```text
/methodology
```

Purpose:

Explain how the platform works.

Transparency is important.

---

## Section 1

Objective

What the platform aims to achieve.

---

## Section 2

Data Sources

Examples:

- Cyclone Data
- Elevation Data
- Infrastructure Data
- Geospatial Data

---

## Section 3

Workflow

Visual workflow.

Collection

↓

Processing

↓

Hazard Assessment

↓

Exposure Assessment

↓

Visualization

---

## Section 4

Assumptions

Clearly explain assumptions.

---

## Section 5

Limitations

Clearly explain limitations.

---

# 6. About

Route:

```text
/about
```

Purpose:

Provide project context.

---

## Project Overview

Description of StormScope.

---

## Academic Context

Institution

Department

Project Type

---

## Scope

What the project does.

What the project does not do.

---

## Future Development

Potential future expansion.

Examples:

- Additional cyclone case studies
- Real geospatial integration
- Advanced validation workflows

---

# Route Summary

```text
/
/dashboard
/explorer
/assessment
/methodology
/about
```

No authentication is required for the MVP.

No user management is required for the MVP.

No database is required for the MVP.

All pages should function using local sample data.

The application should feel complete even while operating entirely in demonstration mode.
