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

Phase 1 — Presentation MVP

Status:

Documentation and planning phase.

The project architecture, visual direction, page structure, and development strategy have been defined.

Implementation has not yet begun.

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
