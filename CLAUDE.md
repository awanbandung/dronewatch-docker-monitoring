# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DroneWatch** — React frontend prototype for a 50-drone fleet command center targeting air police / law enforcement. Phase 1 is a pure UI prototype with simulated data; future phases wire in a NestJS backend, LiveKit WebRTC video, and MapLibre maps.

Login credentials for dev: `OPS-ADMIN1` / `admin`

## Commands

```bash
npm install       # install deps
npm run dev       # dev server → http://localhost:5173
npm run build     # production build
npm run preview   # preview production build locally
```

No test runner is configured yet.

## Architecture

**Routing:** HashRouter with 5 routes. `App.jsx` is the sole route table — add new routes there.

| Route | Page | Status |
|---|---|---|
| `/login` | LoginPage | Active |
| `/dashboard` | DashboardPage | Active |
| `/streaming` | StreamingPage | Active |
| `/gps`, `/inventory` | ComingSoon | Phase 2 placeholder |

**Shared layout:** `TopNav` and `BottomBar` are included per-page, not via a wrapper layout component.

**Mock data layer (temporary):**
- `src/data/drones.js` — 50 statically-generated drones. Replace with WebSocket/MQTT in Phase 3.
- `src/hooks/useTelemetry.js` — simulated telemetry ticker. Replace with real WS hook in Phase 3.
- `src/components/stream/DroneCanvas.jsx` — animated canvas fake feed. Replace with LiveKit `<VideoTrack />` in Phase 4.

**Path alias:** `@` maps to `./src` (configured in `vite.config.js`).

## Design System

All tokens are defined in `tailwind.config.js` and mirrored as CSS vars in `src/index.css`.

Key tokens: `bg-base` (#0b0e14) · `bg-panel` · `bg-card` · `accent` (#00c8f0) · `danger` · `warning` · `success`

Fonts: `font-mono` (Share Tech Mono — telemetry values) · `font-hd` (Barlow Condensed — section headers) · `font-ui` (Barlow — body)

Global scanline overlay is applied via `body::after` in `index.css` — do not replicate it per-component.

Reusable CSS component classes (`.card-accent-top`, `.sec-hd`) are defined in `src/index.css` `@layer components`.

## Drone Status Model

Each drone has `status: 'green' | 'yellow' | 'red' | 'inactive'`. This drives color coding throughout the UI and is the primary filtering dimension on the streaming grid.

## Phase Roadmap

- **Phase 2** — GPS Tracker (`/gps`) and Inventory Asset (`/inventory`) pages
- **Phase 3** — NestJS backend: PostgreSQL/TimescaleDB, Redis, MQTT, WebSocket gateway
- **Phase 4** — LiveKit integration: replace canvas fakes with real WebRTC video tracks

## Tech Stack

React 18 · Vite · React Router v6 · Tailwind CSS v3 · lucide-react icons · clsx + tailwind-merge · LiveKit SDK (installed, used in Phase 4) · Deployed on OVHcloud Bare Metal
