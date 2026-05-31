# R3 — Monorepo Setup Handoff
> Context document for continuing this work in Claude Code

---

## Project Overview

**Project Name:** R3  
**Client:** Air Police / Law Enforcement, Indonesia  
**Objective:** Real-time command center to livestream 50 drones simultaneously on a large "video tron" display  
**Long-term goal:** Evolve into a tiered SaaS product

---

## Current Build Status

| Layer | Status | Notes |
|---|---|---|
| Frontend | ✅ Done | React + Vite, presented to client |
| Infrastructure | ✅ Done | OVHcloud Bare Metal, 64GB RAM + high-VRAM GPU |
| Video | ✅ Done | LiveKit self-hosted, LiveKit Ingress/Egress |
| Backend | 🔲 Not started | NestJS decided, not scaffolded yet |

---

## Tech Stack

### Frontend (existing)
- React + React Router
- shadcn/ui + Tailwind CSS
- MapLibre GL / Deck.gl (mapping)
- Vite

### Backend (to be built)
- NestJS (TypeScript)
- PostgreSQL
- TimescaleDB (time-series telemetry)
- Redis
- MQTT (drone telemetry ingestion)
- WebSocket Gateway (real-time push to frontend)

### Video Infrastructure
- LiveKit (self-hosted WebRTC)
- LiveKit Ingress: RTSP → WebRTC via FFmpeg
- LiveKit Egress: recording
- Stream URLs: `https://stream.r3.army/live/drone1` through `drone50`

### Design
- Dark mode, military command center aesthetic
- Monospace fonts (Share Tech Mono)
- Scanline effects, glowing status indicators
- Reference: DJI FlightHub 2, FlytBase

---

## Monorepo Plan

### Tooling
- **Package manager:** pnpm workspaces
- **Build orchestrator:** Turborepo

### Target Structure
```
r3/
├── apps/
│   ├── web/          ← existing frontend (moved here, DO NOT rewrite)
│   └── api/          ← new NestJS backend (scaffold from scratch)
├── packages/
│   └── types/        ← shared TypeScript interfaces
├── turbo.json
├── package.json      ← root workspace package
└── pnpm-workspace.yaml
```

### Migration Note
The existing frontend repo should be moved into `apps/web` — not rewritten. Git history must be preserved. Only the root `package.json` and workspace config files are new.

---

## Database Schema

### Users & Roles

```sql
users (
  id             SERIAL PRIMARY KEY,
  name           VARCHAR,
  email          VARCHAR UNIQUE NOT NULL,
  password_hash  VARCHAR NOT NULL,
  role           ENUM('super_admin', 'admin', 'user'),
  created_at     TIMESTAMP DEFAULT now()
)
```

**Roles:**
- `super_admin` — full access, manage users, all drones, system config
- `admin` — manage users within scope, view all drones
- `user` — view drones only (stream operator)

---

### Drone Groups

```sql
drone_groups (
  id           SERIAL PRIMARY KEY,
  name         VARCHAR NOT NULL,   -- e.g. "North Sector", "Perimeter Team"
  description  TEXT,
  created_at   TIMESTAMP DEFAULT now()
)
```

---

### Drones

```sql
drones (
  id          SERIAL PRIMARY KEY,
  code        VARCHAR NOT NULL,    -- "drone1" .. "drone50"
  stream_url  VARCHAR NOT NULL,    -- "https://stream.r3.army/live/drone1"
  label       VARCHAR,             -- "Drone Alpha 01" (display name)
  group_id    INT REFERENCES drone_groups(id),  -- nullable
  status      ENUM('active', 'offline', 'maintenance'),
  battery     INT,                 -- 0–100, updated via telemetry
  lat         FLOAT,
  lng         FLOAT,
  updated_at  TIMESTAMP
)
```

**Seed note:** All 50 stream URLs follow the pattern `https://stream.r3.army/live/drone{n}` — seed with a script, not manual entry.

---

### Future: Access Control (NOT in this delivery)

```sql
-- Per-group access (assign user to group, not individual drones)
group_access (
  user_id   INT REFERENCES users(id),
  group_id  INT REFERENCES drone_groups(id),
  PRIMARY KEY (user_id, group_id)
)

-- Per-drone access (fine-grained, even further future)
drone_access (
  user_id   INT REFERENCES users(id),
  drone_id  INT REFERENCES drones(id),
  PRIMARY KEY (user_id, drone_id)
)
```

These tables should be created in the schema now but left empty — no logic needed yet. This avoids a painful migration later.

---

## API Design (initial endpoints)

```
GET  /api/drones              → list all drones with status, battery, lat/lng, stream_url
GET  /api/drones/:id          → single drone detail
GET  /api/drone-groups        → list all groups
POST /api/auth/login          → returns JWT
GET  /api/auth/me             → current user profile
```

Frontend uses `stream_url` from the API response to connect to LiveKit — no hardcoded URLs in frontend.

---

## Shared Types Package (`packages/types`)

Minimum types to share between `apps/web` and `apps/api`:

```typescript
// Drone
export interface Drone {
  id: number
  code: string
  stream_url: string
  label: string
  group_id: number | null
  status: 'active' | 'offline' | 'maintenance'
  battery: number
  lat: number
  lng: number
  updated_at: string
}

// Drone Group
export interface DroneGroup {
  id: number
  name: string
  description: string | null
}

// User
export type UserRole = 'super_admin' | 'admin' | 'user'

export interface User {
  id: number
  name: string
  email: string
  role: UserRole
}

// Auth
export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  access_token: string
  user: User
}
```

---

## SaaS Roadmap (future context, not current delivery)

| Tier | Features |
|---|---|
| **Phase 1 (current delivery)** | 50 streams, on-prem deploy, basic telemetry, 3 roles |
| **Free Tier** | 3 drones, 1 operator, 30-min recording |
| **Pro Tier** | 20 drones, team sharing, click-to-fly |
| **Enterprise** | 50+ drones, AI detection (YOLOv8), full remote control (MAVLink/DJI SDK), audit logs |

---

## Three Frontend Views (already built)

1. **Login** — branded auth screen
2. **Dashboard** — passive "tron" display: map, KPI strip (battery alerts, drone count), thumbnail feed strip
3. **Streaming** (primary) — featured large feed, 50-drone searchable grid, mini nav map, telemetry overlay, controls (record, snapshot, fullscreen)

---

## What To Do in Claude Code

### Step 1 — Confirm existing frontend structure
Before doing anything, run:
```bash
ls -la
cat package.json
```
Note the package manager (look for `package-lock.json` / `pnpm-lock.yaml` / `yarn.lock`), package name, and root folder structure.

### Step 2 — Set up monorepo root
- Create `pnpm-workspace.yaml`
- Create root `package.json` (workspace root, private: true)
- Install Turborepo: `pnpm add turbo -D -w`
- Create `turbo.json`

### Step 3 — Move frontend into apps/web
- `mkdir -p apps/web`
- Move all existing files into `apps/web/`
- Update `apps/web/package.json` name to `@r3/web`
- Verify it still runs: `pnpm --filter @r3/web dev`

### Step 4 — Scaffold NestJS backend
```bash
cd apps
npx @nestjs/cli new api --package-manager pnpm
```
- Rename package to `@r3/api`
- Add initial modules: `auth`, `drones`, `drone-groups`, `users`

### Step 5 — Create shared types package
- `mkdir -p packages/types/src`
- Create `packages/types/package.json` with name `@r3/types`
- Add `tsconfig.json`
- Add the shared interfaces above
- Add `@r3/types` as dependency in both `apps/web` and `apps/api`

---

## Important Constraints

- Do NOT rewrite the existing frontend — migrate it as-is
- Git history must be preserved (use `git mv` not copy-paste)
- All 50 drone stream URLs follow pattern `https://stream.r3.army/live/drone{n}` — seeded via script
- Per-drone and per-group access control is NOT in scope for this delivery — schema only
- Backend choice is NestJS (not FastAPI) — TypeScript consistency across the monorepo
