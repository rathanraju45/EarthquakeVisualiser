# Earthquake Visualizer — Software Requirements Specification (SRS)

> **Project:** Global Earthquake Visualizer (Client-only)
> **Audience:** Geography student / Educators / Developers
> **Tech stack:** React.js (frontend) + React-Leaflet + Fetch/Axios (no backend)
> **Data Source:** USGS GeoJSON feed — `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson`
> **Goal:** Interactive, responsive map-based visualization of recent earthquakes (past 24 hours) to help students explore seismic patterns.

---

# 1. Document Purpose

This SRS describes the architecture design and development plan for a client-only (no backend) earthquake visualization web application. It defines functional and non-functional requirements, component architecture, data flow, UI/UX, testing strategy, deployment steps, and project milestones.

---

# 2. High-level System Overview

A single-page React application that fetches USGS GeoJSON, parses features, and visualizes earthquakes as interactive map layers using React-Leaflet. The UI includes map, filtering controls, legend, summary stats, and responsive layouts for desktop and mobile. Data fetching and caching are handled client-side with periodic refreshes.

---

# 3. Scope & Constraints

* **In scope**

  * Fetching live USGS `all_day` GeoJSON feed.
  * Rendering earthquake points on a slippy map (Leaflet tiles).
  * Interactive popups with earthquake details and link to USGS event page.
  * Filters: magnitude range, time window (preset), optional regional bounding / map-bounds filter.
  * Visual encodings: marker size by magnitude, color by depth or magnitude.
  * Clustering for dense areas on lower zooms.
  * Responsive design (mobile-first considerations).
  * Client-side caching with TTL and manual refresh control.
  * Unit, integration, and E2E tests.

* **Out of scope**

  * Any server-side components, long-term historical storage, or heavy analytics requiring backend compute.
  * Authentication / multi-user features.

---

# 4. Functional Requirements (FR)

FR-1: The app shall fetch the USGS GeoJSON feed on load.
FR-2: The app shall parse `features[]` and extract coordinates and properties for each earthquake.
FR-3: The map shall display an interactive marker for each earthquake.
FR-4: The app shall provide a popup showing magnitude, place, depth, time (formatted), and a link to the USGS event page.
FR-5: The app shall allow the user to filter earthquakes by magnitude range.
FR-6: The app shall allow the user to filter earthquakes by basic time windows (e.g., last 1h, 6h, 12h, 24h) — client-side derived from the feed’s timestamp.
FR-7: The app shall support marker clustering.
FR-8: The app shall size and/or color markers according to magnitude and/or depth.
FR-9: The app shall show summary statistics (total quakes shown, strongest magnitude, average magnitude).
FR-10: The app shall refresh data on user request and optionally on a fixed interval (configurable).
FR-11: The app shall be responsive and usable on desktop and mobile.
FR-12: The app shall provide an accessible legend and UI controls.
FR-13: The app shall handle API errors gracefully and show user-friendly messages.

---

# 5. Non-functional Requirements (NFR)

NFR-1: **Performance** — Initial load should render primary UI within 3s on average broadband; markers rendering should be optimized (clustering and lazy rendering).
NFR-2: **Availability** — App is client-hosted (e.g., GitHub Pages, Netlify); rely on USGS uptime.
NFR-3: **Scalability** — Handle feeds containing several thousand features (use clustering and virtualization).
NFR-4: **Security** — No sensitive data; follow CSP best-practices and sanitize any external links.
NFR-5: **Responsiveness** — Layout adapts to small (≤360px), medium, and large screens.
NFR-6: **Accessibility** — Keyboard navigable controls, ARIA labels, color contrast compliance.
NFR-7: **Testability** — Unit, integration, E2E tests included.
NFR-8: **Maintainability** — Component-driven React structure with clear separation of concerns.

---

# 6. Architecture — Component Diagram (Logical)

High-level client-only architecture:

* **App (root)**

  * **HeaderBar** — app title, last-updated timestamp, refresh button, settings toggle
  * **Sidebar / Drawer** — filters (magnitude slider, time window), summary stats, legend, about
  * **MapView** — React-Leaflet MapContainer

    * **TileLayer** — base tiles (OpenStreetMap or other provider)
    * **EarthquakeLayer** — manages markers / circles / clusters

      * **ClusterGroup** — react-leaflet-markercluster or similar (wraps markers)
      * **EarthquakeMarker** — circle marker sized/colored by magnitude/depth
      * **Popup** — info view
  * **Footer** — data attribution (USGS), disclaimers
  * **ErrorBoundary / Toasts** — user-facing error messages
  * **ClientCache & FetchService** (singleton hooks/util)

    * fetchWithCache(url, ttl)
    * parseGeoJSON()
  * **State Management**

    * Local component state + React Context for global app state (filters, data, UI preferences)
    * Optional: lightweight state library (Zustand) if complexity grows

---

# 7. Data Flow

1. On app mount, `FetchService` requests USGS feed (cache checked first).
2. GeoJSON parsed into internal model: `[ { id, lat, lon, depth, mag, place, time, url, raw } ]`.
3. Parsed data stored in global context (or React Query cache).
4. UI components (Sidebar & Map) subscribe to filtered view of that data.
5. Map renders markers (clustered) for the filtered dataset.
6. User interactions (filter change, zoom) update context — map re-renders accordingly.
7. Manual refresh or interval triggers re-fetch and updates data + last-updated timestamp.

---

# 8. Data Model (Client-side)

Each earthquake record (internal representation):

* `id` (string) — USGS feature id
* `latitude` (number)
* `longitude` (number)
* `depth` (number, kilometers)
* `magnitude` (number)
* `place` (string)
* `time` (number, epoch ms)
* `url` (string) — USGS event link
* `raw` (object) — optional raw feature for deeper data

Derived fields:

* `formattedTime` (string) — localized ISO or human-friendly
* `severityColor` (string) — computed color class
* `markerRadius` (number) — computed radius for CircleMarker

---

# 9. UI / UX Design & Elements

### Primary Views

* **Map-first layout**: Map occupies main viewport; sidebar overlays on large screens and a slide-in drawer on mobile.
* **Mobile behavior**: Collapsible filter drawer and floating "last-updated" + refresh button.

### Controls & Widgets

* **Filter Controls**

  * Magnitude slider (min 0 — max 10, step 0.1)
  * Time window presets (1h, 6h, 12h, 24h)
  * Toggle: color by depth / color by magnitude
  * Toggle: cluster on/off
* **Legend**

  * Color scale for depth or magnitude with labels
  * Size scale for magnitude marker sizing
* **Summary Card**

  * Total earthquakes (current filters)
  * Highest magnitude and location
  * Average magnitude
* **Marker Popup**

  * Magnitude (bold)
  * Place
  * Depth
  * Time (formatted with timezone)
  * Link: “View on USGS”
* **Error / Loading**

  * Skeleton map overlay while loading
  * Toast or banner on fetch failure with retry button

### Accessibility

* Keyboard focusable controls and popups
* Labels for input controls and map zoom buttons
* High contrast color themes / option to switch to high-contrast mode

---

# 10. Styling & Responsiveness

* **CSS Approach:** CSS Modules, TailwindCSS, or styled-components (choose one).
* **Mobile-first breakpoints:** `sm`, `md`, `lg` with layout adjustments:

  * Mobile: Map full-screen, bottom-floating filter button, drawer overlays map.
  * Desktop: Sidebar visible left (30% width), map on right (70%).
* **Map container:** ensure the map invalidates/updates size on container changes (call `invalidateSize()` or use React-Leaflet mechanisms).

---

# 11. Client-side Caching Strategy

* **Why:** reduce repeated network fetches, improve UX when API latency spikes.
* **Mechanism:** in-memory cache via React Query or a simple utility:

  * Cache key: endpoint URL
  * TTL: default 5–10 minutes (configurable in settings)
  * On load: check cache → if expired fetch new → update cache + timestamp.
* **Manual refresh:** bypass cache and fetch fresh data.

---

# 12. Error Handling & Resilience

* Validate response structure (`type === "FeatureCollection"` and `features` array).
* Graceful fallback UI if USGS feed returns invalid data.
* Show a friendly banner with retry button and suggest network check.
* Log errors to console (or optional lightweight client-side telemetry, e.g., Sentry, if desired).

---

# 13. Testing Plan

### Unit Tests

* Components: HeaderBar, Sidebar, Legend, SummaryCard render & accept props.
* Utilities: GeoJSON parser, magnitude/size/color calculators.
* Hooks: caching hook, filter hook behavior.

**Tools:** Jest + React Testing Library

### Integration Tests

* Map integration: ensure EarthquakeLayer renders markers for provided mock data.
* Filter integration: changing filters updates markers count and summary stats.

**Tools:** React Testing Library, msw (mock service worker) to mock USGS responses.

### End-to-End Tests

* Scenarios:

  * App loads -> markers visible -> click a marker -> popup appears with correct details.
  * Apply magnitude filter -> only appropriate markers shown.
  * Refresh -> data updates and last-updated timestamp changes.
  * Responsive: open drawer on mobile, use filters.
* **Tool:** Cypress

### Accessibility Tests

* Axe-core integration to catch contrast, ARIA, and keyboard issues.

---

# 14. Performance Considerations

* Use clustering to minimize DOM marker count.
* Use `CircleMarker` instead of full `Marker` SVGs if many points.
* Memoize heavy computations (color scales, filtered lists).
* Debounce filter inputs to prevent re-render storms.
* Lazy-load optional UI components (e.g., About modal) for faster initial render.

---

# 15. Security & Privacy

* Sanitize any external URLs before injecting into DOM; open external links in new tabs with `rel="noopener noreferrer"`.
* Content Security Policy headers should be configured at host (Netlify / GitHub Pages allow limited headers).
* No personal data handled — no auth needed.

---

# 16. Deployment & Hosting

* **Build process:** Standard React build (`npm run build`).
* **Host Options:** GitHub Pages, Netlify, Vercel, or any static site host.
* **CI/CD:** GitHub Actions to run tests and build on push to main, then deploy to hosting provider.
* **Asset caching:** configure long cache for static assets; ensure automatic cache-busting via hashed filenames.

---

# 17. Monitoring & Analytics (Optional)

* Lightweight usage analytics (e.g., Plausible, Google Analytics) to track feature use (filters, map interactions).
* Error monitoring (Sentry) for runtime issues.

---

# 18. Project Milestones & Suggested Timeline (example)

> Assumes 2-week sprint-ish approach; adjust to availability.

* **Milestone 0 — Setup (1 day)**

  * Initialize React project
  * Install React-Leaflet and dependencies
  * Setup linting, prettier, testing infra

* **Milestone 1 — Core Map & Fetch (2–3 days)**

  * Implement FetchService + cache
  * Parse GeoJSON and store in context
  * Render MapContainer + TileLayer
  * Render basic markers for Earthquakes

* **Milestone 2 — Interactivity & UI (3–4 days)**

  * Marker popups with formatted info
  * Filters (magnitude, time window)
  * Header with last-updated and refresh

* **Milestone 3 — Visual Enhancements (2–3 days)**

  * Marker sizing & coloring
  * Legend & summary stats
  * Marker clustering

* **Milestone 4 — Responsiveness & Accessibility (2 days)**

  * Responsive layout and drawer
  * ARIA attributes and keyboard navigation

* **Milestone 5 — Testing & Polish (3 days)**

  * Unit tests for utilities and components
  * Integration tests for filter-map interaction
  * Cypress E2E tests for key user flows
  * Performance and UX polish

* **Milestone 6 — Deploy & CI (1 day)**

  * CI pipeline (run tests on PRs)
  * Deploy to chosen host
  * Smoke test live app

---

# 19. Risks & Mitigations

* **Risk:** USGS feed downtime or schema changes.
  **Mitigation:** Validate response and show helpful error; provide cached fallback view.

* **Risk:** Too many markers causing slow render.
  **Mitigation:** Use marker clustering and optimized marker types (CircleMarker), memoization.

* **Risk:** Cross-origin issues with tiles or external resources.
  **Mitigation:** Choose reputable tile provider (OSM or Mapbox with token) and configure CORS-safe fetches.

---

# 20. Optional Enhancements (future)

* Time animation (playback of earthquakes across the day).
* Heatmap overlay to show density.
* Save favorite regions / bookmarks (localStorage).
* Historical data integration via separate USGS endpoints (weekly/monthly) and lightweight visual analytics (trend charts).
* Export current view as PNG or GeoJSON.

---

# 21. Deliverables

* SRS (this document)
* React codebase with modular components and clear README (startup, environment, deploy)
* Test suites (unit, integration, E2E)
* Deployed live demo link (optional)

---

# 22. Next Steps (practical actions)

1. Choose UI library (Tailwind vs Material vs plain CSS).
2. Initialize React project and commit initial scaffold.
3. Implement FetchService and render a minimal map with one sample marker (then iterate).
4. Build filters and add clustering.
5. Add tests alongside feature development.

---
