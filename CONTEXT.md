# CONTEXT.md

Domain language, design decisions, and operational context for the DroneWatch fleet command platform.

---

## Product Identity

**DroneWatch** — Fleet Command Platform  
**Client context:** Air police / law enforcement, Papua region (Nduga area), on-premise OVHcloud Bare Metal deployment  
**Primary display:** Large command center "Video Tron" wall screen — always-on, passive display mode  
**Default login:** `OPS-ADMIN1` / `admin` (dev only)

---

## Domain Language

### Operator & Auth
| Term | Meaning |
|---|---|
| Operator ID | Format `OPS-XXXXXXXX` — 6–8 alphanumeric chars after prefix |
| Division | Organizational unit: AIR UNIT ALPHA/BRAVO/CHARLIE, INTEL OPS, COMMAND HQ |
| Access Level | OPERATOR < SUPERVISOR < COMMANDER < ADMIN |
| Terminal | The physical workstation / client machine |

### Drone Fleet
| Term | Meaning |
|---|---|
| Area | Operational zone grouping, Areas 1–5, each holds 10 drones |
| Drone ID | `DRN-001` through `DRN-050` — zero-padded 3-digit |
| Serial Number | `SN` + 8 digits |
| Zona Operasi | Named operational perimeter on the map (e.g., "ZONA OPERASI ALPHA") |
| RTH | Return To Home — auto-return command on low battery |
| Loitering | Drone hovering in place — a valid flight status |
| Waypoint | GPS checkpoint in a mission plan |
| Geofence | Virtual boundary; crossing triggers a warning alert |

### Status Model
Drones use exactly 4 statuses — use these strings everywhere:

| Status | Color | Meaning | Battery range |
|---|---|---|---|
| `green` | `#00e676` (success) | Operasional — active, healthy | 30–95% |
| `yellow` | `#f0a500` (warning) | Low Battery — approaching RTH threshold | 5–24% |
| `red` | `#ff4040` (danger) | Lost Signal / Critical | 0% |
| `inactive` | `#4a5568` (inactive) | Standby — on the ground | 100% |

### Telemetry Fields
| Field | Unit | Label in UI |
|---|---|---|
| Altitude | m AGL | KETINGGIAN |
| Speed | km/h (grid) / m/s (HUD big readout) | KECEPATAN |
| Battery | % | BATTERY |
| MSL | m (mean sea level) | MSL ALT |
| Heading | degrees 0–359 | HDG |
| GPS | decimal lat/lon | GPS KOORDINAT |
| Flight time | HH:MM:SS | FLIGHT TIME / Uptime Penerbangan |
| RSSI | signal bars (1–5) | RSSI KOMLEK |

### Alert Severity
| Class | Color | Trigger examples |
|---|---|---|
| `crit` | danger border-left | Lost signal, battery critical |
| `warn` | warning border-left | Low battery, geofence approach |
| `info` | accent border-left | Drone deployed, waypoint reached |

### Inventory Items (reference data from original HTML)
STARLINK, DJI MATRICE (300 / 350), AUTEL EVO (II / MAX), BATTERY PACK, RTK MODULE

Badge states: READY (ok), LOW STOCK / % REPAIR (warn), N OFFLINE (bad)

### GPS Tracker Statuses (Indonesian)
- **AKTIF** — active / operational
- **EN ROUTE** — in transit
- **OFFLINE** — not responding

---

## UI Architecture & Layout Decisions

### Shared Chrome
- **TopNav** (42px, fixed): brand logo → tab strip → right cluster (LIVE badge, operator, WIB clock)
- **KPI Strip** (64px, dashboard only): 5 KPIs — GPS Alert Active, Drone Status Yellow/Red, Asset Readiness, Drones Active, Mission Uptime
- **BottomBar** (28px, fixed): server/infra status dots on left, operator + clock on right
- All chrome uses `rgba(10,13,20,0.97)` or `bg-panel` — never solid black

### Layout System
- `overflow: hidden` on `html/body` — entire UI is a fixed viewport, no page scroll
- Body content sits between `top: 42px` (or `106px` on dashboard with KPI strip) and `bottom: 28px`
- Panels use `position: fixed` with explicit top/bottom offsets — not CSS grid on the outer layout

### Dashboard Layout
- Left: SVG operation map (flex: 1) with drone pins — replace with MapLibre GL in Phase 3
- Right: 320px panel — Live Streaming thumbnails (2-col grid) → GPS Tracker → Inventory Asset → Active Alerts

### Streaming Page Layout
- Top section (flex: 1): Featured feed (flex: 1) | Right column (300px fixed)
- Right column: Mini Nav Map (flex: 1) → Drone Summary → Drone Log
- Bottom strip: Drone grid (horizontal scroll, 110px thumbnails, 68px tall canvases)

### Drone Grid (Streaming)
- 50 thumbnails, horizontal scroll strip at bottom
- Filter pills: ALL / OPERASIONAL / LOW BATTERY / LOST SIGNAL / STANDBY
- Search by drone ID or area label
- Selected drone highlighted with 2px accent border

### Multi-View Pane
A large video cell in a multi-drone focus layout. Each pane shows: video feed + Drone ID + battery % + status color dot. Does **not** include the full telemetry HUD (no compass, no KETINGGIAN/KECEPATAN rows).

### Focused Pane
The pane last clicked by the operator in multi-view. The right sidebar (Peta Navigasi, Drone Summary, Drone Log) always tracks the Focused Pane's drone. Highlighted with accent border. Distinct from drone `status: green` (Operasional) — "focused" refers to UI state, not drone health.

### Pin / Unpin
- **Pin**: operator clicks the PIN button on a thumbnail in the bottom grid → drone enters the main view as a new pane. In multi-view, clicks only ever ADD — they never replace an existing pane.
- **Unpin**: operator clicks × on a pane → removes it from the main view. The only way to remove a pane in multi-view; no accidental replacement possible.
- If the grid thumbnail belongs to an already-pinned drone, clicking it scrolls/highlights that pane instead of adding a duplicate.

### Multi-View (Streaming page mode)
When multiple drones are pinned to the main view, the feed area splits into equal-width panes — 1 drone = full width, 2 = 50/50, 3 = thirds, etc. The right sidebar (Peta Navigasi, Drone Summary, Drone Log) tracks whichever pane is active (clicked). The right sidebar is collapsible to give full horizontal space to the feeds.

Pane limits by context:
- Mobile: 1
- Tablet: 4–6
- Desktop: 12
- Video Tron: 50

Auto-layout: balanced square grid. `cols = ceil(sqrt(N))`, `rows = ceil(N / cols)`. Panes fill available space equally. At ≥5 panes, sidebar and bottom grid auto-collapse (wall mode). Column-count override available in header for power users.

### Video Tron
Physical: 8m wide, 2 × 4m panels side by side (Ruang Meeting Utama / Section B). Combined resolution estimated 7680×2160. At 50 drones: 10×5 grid = ~768×432px per cell — readable at wall distance. Served via dedicated `/wall` fullscreen route with no chrome (no TopNav, no BottomBar).

---

## Design System Decisions

### Typography roles
- `font-mono` (Share Tech Mono): all telemetry values, timestamps, status labels, monospaced data
- `font-hd` (Barlow Condensed): section headers, KPI values, large readout numbers, brand name
- `font-ui` (Barlow): body text, descriptions

### Microinteraction patterns established in original HTML
- **Glowing status dots**: `box-shadow: 0 0 6px <color>` + CSS pulse animation — applied to green status only; red pulses faster (0.8s)
- **Card accent line**: 2px gradient line at top of cards — `linear-gradient(90deg, transparent, accent, transparent)`
- **HUD boxes**: `rgba(0,0,0,0.6)` background + `rgba(255,255,255,0.12)` border — used for all overlaid telemetry panels
- **Corner bracket decoration** (login page only): 4 fixed-position `<div>` corners with accent border
- **Scanline overlay**: applied via `body::after`, 4px repeating gradient — global, never duplicate per-component
- **Grid background** (login page only): 40px cyan grid at 3% opacity + radial vignette

### Bilingual pattern
UI labels mix Indonesian and English deliberately:
- Section titles in English (DRONE SUMMARY, ACTIVE ALERTS)
- Telemetry field labels in Indonesian (KETINGGIAN, KECEPATAN)
- Alert messages in English; alert drone IDs/areas in English
- Operational zone labels in Indonesian (PETA OPERASI UTAMA, ZONA OPERASI ALPHA)
- GPS status values in Indonesian (AKTIF, EN ROUTE, TIDAK AKTIF)
- This is intentional — match the pattern, don't normalize to one language

### Node / Server identifiers (use consistently)
- Server node: `OVH-BM-JKT-01`
- Operator reference: `CDR-NDUGA-01` / Level: COMMANDER
- Region coordinates: `-6.2088 / 106.8456` (Jakarta) for login screen
- Drone area coordinates: Papua highlands, approx `-4.2064 / 138.350`

---

## Mobile

- **Detection**: device width (not login-based). Role-based routing added in Phase 3 when backend lands.
- **User**: Field officer — read-only situational awareness
- **Entry screen**: Drone selector (list of all drones with status color + area label) → tap → full-screen single feed
- **Max panes**: 1
- **UI**: minimal — no desktop chrome, no right sidebar, no bottom grid

## Drone Fleet Size

- **Confirmed**: 50 drones for current client deployment
- **Architecture**: data-driven, not hardcoded — system must scale if count grows
- **Spec discrepancy**: client spec document shows "72 Drone" — confirmed with client that 50 is correct

## What's Mock (Phase 1) vs. Real (Future Phases)

| Component | Current (mock) | Future replacement |
|---|---|---|
| `src/data/drones.js` | 50 statically generated drones | WebSocket / MQTT gateway (Phase 3) |
| `src/hooks/useTelemetry.js` | `setInterval` random drift | Real WS telemetry hook (Phase 3) |
| `DroneCanvas.jsx` | Canvas noise animation | LiveKit `<VideoTrack />` (Phase 4) |
| Operation map | Inline SVG with hand-placed pins | MapLibre GL (Phase 3) |
| Mini nav map | Static SVG | MapLibre GL minimap (Phase 3) |
| Auth | Hardcoded credentials | NestJS auth + Redis session (Phase 3) |
