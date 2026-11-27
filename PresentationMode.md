## Presentation Mode

This document defines the current delivery target of the platform.

The immediate objective is to produce a complete, visually polished, demonstration-ready experience suitable for academic presentations, project reviews, faculty evaluations, and technical discussions.

The current focus is communication, usability, and presentation quality.

The current focus is not production deployment.

---

# 1. Current Objective

The platform is currently being developed as a presentation-oriented MVP.

The purpose of the MVP is to demonstrate:

- Project vision
- User workflow
- Interface quality
- Data visualization
- Assessment methodology
- Future platform direction

The MVP should feel complete despite operating with simplified infrastructure.

---

# 2. Demonstration Goals

A reviewer should be able to:

- Understand the project purpose within one minute.
- Navigate the platform without guidance.
- Explore historical cyclone information.
- Interact with maps.
- Explore exposure metrics.
- Complete an infrastructure assessment workflow.
- Understand the project's value proposition.

The platform should communicate competence, clarity, and feasibility.

---

# 3. MVP Scope

The MVP includes:

- Landing page
- Dashboard
- Cyclone explorer
- Infrastructure assessment
- Methodology section
- Project information

The MVP should provide a coherent experience from beginning to end.

---

# 4. Deliberately Excluded

The following systems are intentionally excluded from the MVP:

### Authentication

No sign up.

No login.

No user accounts.

---

### User Profiles

No profile creation.

No profile management.

No permissions system.

---

### Database Infrastructure

No database is required for the MVP.

Data should be loaded from local files.

---

### Docker Dependencies

The MVP must remain functional without Docker containers.

The interface should not depend on backend processing services.

---

### Administrative Interfaces

No administration panel.

No management dashboard.

No moderation tools.

---

### Advanced Processing

No live hazard processing.

No flood simulation.

No computationally intensive modelling.

---

# 5. Demonstration Data

The MVP may use:

- Local JSON files
- Local GeoJSON files
- Demonstration records
- Example exposure metrics

The objective is to demonstrate platform workflow.

Demonstration values should remain realistic and internally consistent.

---

# 6. Map Philosophy

Maps should appear functional and valuable from the first interaction.

The demonstration should prioritize:

- Visual quality
- Geographic context
- Information clarity

Maps should not feel like placeholders.

Maps should feel like a working product.

---

# 7. Infrastructure Assessment Philosophy

The assessment workflow exists to demonstrate historical exposure analysis.

Outputs may include:

- Exposure indicators
- Hazard indicators
- Terrain observations
- Development guidance

Outputs should never imply:

- Construction approval
- Structural certification
- Building collapse prediction

The platform provides historical context.

It does not provide engineering conclusions.

---

# 8. Presentation Priorities

When development decisions must be made, prioritize:

### First

Visual quality.

---

### Second

User experience.

---

### Third

Map interaction quality.

---

### Fourth

Information architecture.

---

### Fifth

Technical complexity.

A visually clear and convincing platform is more valuable than a technically complex system that cannot be effectively demonstrated.

---

# 9. Demonstration Scenario

Recommended demonstration flow:

Home

↓

Platform Overview

↓

Dashboard

↓

Cyclone Selection

↓

Hazard Visualization

↓

Exposure Analysis

↓

Infrastructure Assessment

↓

Methodology

↓

Project Discussion

The entire workflow should be completable within five minutes.

---

# 10. User Expectations

Users interacting with the MVP should leave with an understanding of:

- What the platform does.
- Why it exists.
- How it works.
- What insights it produces.
- How it could evolve in the future.

The demonstration should communicate a working vision rather than a collection of disconnected screens.

---

# 11. Development Boundary

Whenever a feature is proposed, evaluate it against the following question:

Does this feature improve the presentation experience?

If the answer is no, defer the feature until a later phase.

The current objective is not to build the final platform.

The current objective is to create the strongest possible demonstration of the final platform.
