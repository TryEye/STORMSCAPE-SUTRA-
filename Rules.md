## Build Rules

These rules are binding for all future development.

If a proposed implementation conflicts with a rule, the rule takes precedence.

---

# 1. Platform Goal

The current objective is a presentation-quality MVP.

Every decision should improve:

- Clarity
- Usability
- Visual quality
- Demonstration value

Avoid features that increase complexity without improving the demonstration.

---

# 2. Technology Stack

Frontend

- Next.js App Router
- TypeScript
- Tailwind CSS
- MapLibre
- Framer Motion
- Recharts

Preferred UI Components

- shadcn/ui

---

# 3. What Not To Build

Do not implement:

- Authentication
- User accounts
- Login systems
- Registration systems
- Admin panels
- Role management
- Payment systems
- Chat systems
- Notifications
- Real-time collaboration
- CMS functionality

These features are outside the MVP scope.

---

# 4. Data Rules

The MVP must function using local data.

Data should be sourced from:

- JSON
- GeoJSON

Avoid introducing:

- Databases
- External APIs
- Backend dependencies

unless specifically required.

---

# 5. Map Rules

Maps are the primary product surface.

Maps should receive higher priority than:

- Landing page animations
- Decorative effects
- Marketing content

Map usability takes precedence over visual novelty.

---

# 6. Design Rules

The platform should resemble:

- Environmental intelligence software
- Geospatial analysis software
- Mapping systems

Avoid:

- Generic SaaS styling
- Purple AI interfaces
- Crypto-inspired dashboards
- Cyberpunk aesthetics

---

# 7. Assessment Rules

Assessment outputs must use:

- Historical Exposure
- Exposure Indicator
- Hazard Indicator
- Planning Guidance

Never use:

- Building Collapse Prediction
- Structural Failure Prediction
- Safety Certification
- Construction Approval

The application does not perform structural engineering analysis.

---

# 8. Architecture Rules

The frontend should remain compatible with future integration of:

- Processing services
- Geospatial engines
- Data pipelines

Current implementation should avoid assumptions that prevent later expansion.

---

# 9. Performance Rules

Prioritize:

- Fast load times
- Lightweight assets
- Minimal dependencies
- Responsive interactions

The platform should feel smooth on typical laptops used during project presentations.

---

# 10. Documentation Rules

When significant changes occur:

Update:

- Memory.md
- Architecture.md

when required.

Documentation should remain consistent with implementation.

---

# 11. Map-First Principle

When deciding between:

A larger map

or

Additional cards

Choose the larger map.

The platform exists to communicate geographical information.

Maps are the primary content.

Everything else supports the map.

---

# 12. MVP Success Test

Before adding a new feature ask:

Does this improve the presentation experience?

If the answer is no:

Do not build it yet.
