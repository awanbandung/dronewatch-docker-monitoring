# reis-command — R3 Fleet Command Platform

50-drone fleet command center for air police / law enforcement.  
Monorepo: React frontend (`apps/web`) + NestJS backend (`apps/api`).

---

## Prerequisites

- **Node.js** 20+
- **pnpm** 10+ (`npm install -g pnpm`)
- **PostgreSQL** running locally (or Docker — see below)
- **Docker** (optional, for PostgreSQL)

---

## Quick Start

### 1. Install dependencies
```bash
pnpm install
```

### 2. Set up the database

If you're using Docker (PostgreSQL already running):
```bash
docker exec postgres16 psql -U postgres -c 'CREATE DATABASE reis_command;'
```

Or create manually in your local PostgreSQL:
```bash
createdb reis_command
```

### 3. Configure environment
```bash
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env — set DB_PASS and a strong JWT_SECRET
```

### 4. Seed the database
```bash
pnpm --filter @reis-command/api seed
# Creates: 1 super_admin user + 50 drones with stream URLs
```

### 5. Start everything
```bash
pnpm dev
# Frontend → http://localhost:5173
# Backend  → http://localhost:3000/api
```

### 6. Log in
```
URL:      http://localhost:5173
Username: OPS-ADMIN1
Password: admin
```

---

## Drone Status Management

Drones stream via RTMP ingress → WebRTC/WHEP. To mark a drone as live:

```bash
# Mark drone1-3 as active (streaming)
docker exec postgres16 psql -U postgres -d reis_command \
  -c "UPDATE drones SET status='active' WHERE code IN ('drone1','drone2','drone3');"

# Mark all drones active
docker exec postgres16 psql -U postgres -d reis_command \
  -c "UPDATE drones SET status='active';"
```

Stream endpoints:
- **Ingest (RTMP):** `rtmp://ingest.r3.army/live/drone{n}` (drones push here)
- **Watch (WHEP):** `https://stream.r3.army/live/drone{n}/whep` (browser pulls here)

---

## Commands

```bash
# Root — runs all apps via Turborepo
pnpm dev           # start all apps
pnpm build         # build all apps

# Frontend only
pnpm --filter @reis-command/web dev       # → http://localhost:5173
pnpm --filter @reis-command/web build

# Backend only
pnpm --filter @reis-command/api dev       # → http://localhost:3000
pnpm --filter @reis-command/api build
pnpm --filter @reis-command/api seed      # seed DB

# Database migrations (run when schema is stable)
pnpm --filter @reis-command/api migration:generate src/migrations/InitSchema
pnpm --filter @reis-command/api migration:run
pnpm --filter @reis-command/api migration:revert
```

---

## Project Structure

```
reis-command/
├── apps/
│   ├── web/                      # React + Vite frontend
│   │   └── src/
│   │       ├── App.jsx           # Route table + RequireAuth guard
│   │       ├── lib/
│   │       │   ├── api.js        # API client (JWT auth header)
│   │       │   └── normalizeDrone.js  # Maps API → UI drone shape
│   │       ├── hooks/
│   │       │   ├── useAuth.js    # Login/logout/token state
│   │       │   ├── useDrones.js  # Fetch drone list from API
│   │       │   └── useTelemetry.js    # Simulated telemetry (Phase 4: replace with WS)
│   │       ├── components/stream/
│   │       │   ├── DroneVideo.jsx     # WebRTC/WHEP player
│   │       │   └── DroneThumb.jsx     # Grid thumbnail
│   │       └── pages/
│   │           ├── LoginPage.jsx
│   │           ├── DashboardPage.jsx
│   │           ├── StreamingPage.jsx
│   │           └── ComingSoon.jsx
│   │
│   └── api/                      # NestJS backend
│       └── src/
│           ├── app.module.ts     # Root module (TypeORM + ConfigModule)
│           ├── auth/             # JWT auth (login, /me)
│           ├── drones/           # GET /drones, GET /drones/:id
│           ├── users/            # User CRUD (admin only)
│           ├── entities/         # TypeORM entities
│           └── seed.ts           # DB seed script
└── turbo.json
```

---

## Routes

| Route | Page | Auth |
|---|---|---|
| `/login` | LoginPage | Public |
| `/dashboard` | DashboardPage | Required |
| `/streaming` | StreamingPage | Required |
| `/gps` | ComingSoon | Required — Phase 2 |
| `/inventory` | ComingSoon | Required — Phase 2 |

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login → JWT |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/drones` | JWT | All 50 drones |
| GET | `/api/drones/:id` | JWT | Single drone |
| GET | `/api/users` | admin+ | List users |
| POST | `/api/users` | admin+ | Create user |
| DELETE | `/api/users/:id` | super_admin | Delete user |

---

## Tech Stack

| Layer | Tech |
|---|---|
| Frontend | React 18 · Vite · React Router v6 · Tailwind CSS v3 |
| Backend | NestJS · TypeORM · PostgreSQL · JWT |
| Streaming | RTMP ingress → WebRTC/WHEP (MediaMTX) |
| Build | Turborepo + pnpm workspaces |
| Deploy | OVHcloud Bare Metal |
