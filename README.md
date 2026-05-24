# DroneWatch — React Frontend

Fleet Command Platform UI — Phase 1

## Quick Start (Claude Code / Terminal)

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev

# 3. Open in browser
# → http://localhost:5173
# → Login with: OPS-ADMIN1 / admin
```

## Project Structure

```
src/
├── main.jsx                    # Entry point, HashRouter
├── App.jsx                     # Route definitions
├── index.css                   # Design tokens, Tailwind base
│
├── data/
│   └── drones.js               # 50 mock drones — replace with WebSocket in Phase C
│
├── hooks/
│   ├── useClock.js             # Live WIB clock
│   └── useTelemetry.js         # Simulated telemetry — replace with WS in Phase C
│
├── components/
│   ├── layout/
│   │   ├── TopNav.jsx          # Shared nav with tabs, live clock, operator info
│   │   └── BottomBar.jsx       # Shared bottom status bar
│   └── stream/
│       ├── DroneCanvas.jsx     # Animated aerial feed — replace with LiveKit <VideoTrack /> in Phase D
│       └── DroneThumb.jsx      # Reusable thumbnail — used in dashboard + streaming grid
│
└── pages/
    ├── LoginPage.jsx           # /login — auth screen
    ├── DashboardPage.jsx       # /dashboard — ops overview
    ├── StreamingPage.jsx       # /streaming — operator workstation
    └── ComingSoon.jsx          # /gps and /inventory — Phase 2 placeholder
```

## Routes

| Route        | Page            | Status     |
|--------------|-----------------|------------|
| `/login`     | LoginPage        | ✅ Active  |
| `/dashboard` | DashboardPage    | ✅ Active  |
| `/streaming` | StreamingPage    | ✅ Active  |
| `/gps`       | ComingSoon       | 🚧 Phase 2 |
| `/inventory` | ComingSoon       | 🚧 Phase 2 |

## Phase Roadmap

### Phase 1 (this repo) — Frontend UI prototype
- [x] Login screen with operator auth
- [x] Dashboard — operation map, KPI strip, GPS tracker, inventory, alerts
- [x] Streaming — featured feed, telemetry HUD, mini nav map, 50-drone grid
- [x] GPS Tracker & Inventory Asset — coming soon placeholders

### Phase 2 — Additional pages (Claude.ai)
- [ ] GPS Tracker page (`/gps`)
- [ ] Inventory Asset page (`/inventory`)

### Phase 3 — Backend (Claude Code)
- [ ] NestJS backend scaffold
- [ ] PostgreSQL + TimescaleDB schema
- [ ] Redis session/pub-sub
- [ ] MQTT gateway for drone telemetry
- [ ] WebSocket gateway (replace `useTelemetry` simulation)
- [ ] LiveKit room management API

### Phase 4 — LiveKit Integration (Claude Code)
- [ ] Replace `<DroneCanvas />` with LiveKit `<VideoTrack />`
- [ ] Replace `<DroneThumb canvas />` with LiveKit room participants
- [ ] LiveKit Ingress: RTSP → WebRTC via FFmpeg
- [ ] LiveKit Egress: recording to object storage

## Design System

See `tailwind.config.js` and `src/index.css` for the full token set.

Key values:
- Background: `#0b0e14`
- Accent: `#00c8f0` (cyan)
- Danger: `#ff4040` · Warning: `#f0a500` · Success: `#00e676`
- Fonts: Share Tech Mono (telemetry) · Barlow Condensed (headers) · Barlow (body)

## Tech Stack

| Layer | Tech |
|---|---|
| Framework | React 18 + Vite |
| Routing | React Router v6 (HashRouter) |
| Styling | Tailwind CSS v3 + custom CSS |
| Video (Phase D) | LiveKit `@livekit/components-react` |
| Mapping (Phase C) | MapLibre GL (replace SVG maps) |
| Build | Vite |
| Deploy | OVHcloud Bare Metal (on-prem) |
