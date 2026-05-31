# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**DroneWatch** — 50-drone fleet command center for air police / law enforcement. Monorepo with React frontend (`apps/web`) and NestJS backend (`apps/api`).

Login credentials for dev: `OPS-ADMIN1` / `admin`

## Commands

```bash
# Root (runs all apps via Turborepo)
pnpm install       # install all deps
pnpm dev           # dev server for all apps
pnpm build         # build all apps

# Frontend only (apps/web)
pnpm --filter @reis-command/web dev       # → http://localhost:5173
pnpm --filter @reis-command/web build

# Backend only (apps/api)
pnpm --filter @reis-command/api dev       # → http://localhost:3000
pnpm --filter @reis-command/api build
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
- `src/components/stream/DroneCanvas.jsx` — animated canvas fake feed. Replace with HLS.js `<video>` player in Phase 3.

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
- **Phase 3** — NestJS backend live: PostgreSQL, JWT auth, HLS.js stream integration (replace canvas fakes)
- **Phase 4** — MQTT telemetry, WebSocket gateway, TimescaleDB, MapLibre maps

## Tech Stack

**Frontend:** React 18 · Vite · React Router v6 · Tailwind CSS v3 · lucide-react · HLS.js (stream playback)
**Backend:** NestJS · PostgreSQL · JWT auth
**Streaming:** RTMP ingress → HLS output at `stream.r3.army/live/drone{n}/` (exact .m3u8 path TBD)
**Deployed:** OVHcloud Bare Metal
