# Turborepo Monorepo Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Restructure the existing React frontend repo into a pnpm + Turborepo monorepo with `apps/web`, `apps/api` (empty), and `packages/types` (empty), then point it at a new GitHub remote.

**Architecture:** Move all frontend source into `apps/web/`, add Turborepo config at the root, and replace npm with pnpm workspaces. The git history is preserved — we are NOT re-cloning; we reorganize in place and re-point the remote.

**Tech Stack:** pnpm workspaces · Turborepo · Vite/React (unchanged inside `apps/web`)

---

## File Map

| Action | Path | Purpose |
|--------|------|---------|
| Create | `apps/web/` | Frontend workspace (current root files move here) |
| Create | `apps/api/` | Empty placeholder for future NestJS |
| Create | `packages/types/` | Empty placeholder for shared types |
| Move | `src/` → `apps/web/src/` | React source |
| Move | `index.html` → `apps/web/index.html` | Vite entry |
| Move | `vite.config.js` → `apps/web/vite.config.js` | Vite config |
| Move | `tailwind.config.js` → `apps/web/tailwind.config.js` | Tailwind |
| Move | `postcss.config.js` → `apps/web/postcss.config.js` | PostCSS |
| Move | `package.json` → `apps/web/package.json` | App deps |
| Create | `package.json` (root) | Workspace root with turbo |
| Create | `pnpm-workspace.yaml` | pnpm workspace definition |
| Create | `turbo.json` | Turborepo task pipeline |
| Replace | `.gitignore` | Add turbo/.pnpm-store entries |
| Delete | `package-lock.json` | Replaced by pnpm |

---

## Task 1: Verify prerequisites

**Files:** none

- [ ] **Step 1.1: Check pnpm is installed**

```bash
pnpm --version
```

Expected: version string like `9.x.x`. If missing: `npm install -g pnpm`

- [ ] **Step 1.2: Check Node version**

```bash
node --version
```

Expected: `v18.x.x` or higher.

---

## Task 2: Create folder structure

**Files:**
- Create: `apps/web/` (directory)
- Create: `apps/api/` (directory)
- Create: `packages/types/` (directory)

- [ ] **Step 2.1: Create workspace directories**

```bash
mkdir -p apps/web apps/api packages/types
```

Expected: no output, directories exist.

---

## Task 3: Move frontend files into apps/web

**Files:**
- Move: `src/` → `apps/web/src/`
- Move: `index.html` → `apps/web/index.html`
- Move: `vite.config.js` → `apps/web/vite.config.js`
- Move: `tailwind.config.js` → `apps/web/tailwind.config.js`
- Move: `postcss.config.js` → `apps/web/postcss.config.js`
- Move: `package.json` → `apps/web/package.json`

- [ ] **Step 3.1: Move source and config files**

```bash
mv src apps/web/src
mv index.html apps/web/index.html
mv vite.config.js apps/web/vite.config.js
mv tailwind.config.js apps/web/tailwind.config.js
mv postcss.config.js apps/web/postcss.config.js
mv package.json apps/web/package.json
```

- [ ] **Step 3.2: Delete npm lock file (pnpm replaces it)**

```bash
rm package-lock.json
```

- [ ] **Step 3.3: Confirm root only has expected files**

```bash
ls -la
```

Expected at root: `.git/`, `.gitignore`, `.claude/`, `apps/`, `docs/`, `original-html/`, `CLAUDE.md`, `CONTEXT.md`, `README.md`, `node_modules/` (will be removed when pnpm installs), `dist/` (gitignored).

---

## Task 4: Update apps/web/package.json

**Files:**
- Modify: `apps/web/package.json`

- [ ] **Step 4.1: Change package name to workspace scope**

Edit `apps/web/package.json` — change the `name` field from `"dronewatch"` to `"@reis-command/web"`. The rest of the file stays identical:

```json
{
  "name": "@reis-command/web",
  "private": true,
  "version": "2.4.1",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.26.1",
    "@livekit/components-react": "^2.5.0",
    "livekit-client": "^2.4.0",
    "lucide-react": "^0.446.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.2"
  },
  "devDependencies": {
    "@types/react": "^18.3.5",
    "@types/react-dom": "^18.3.0",
    "@vitejs/plugin-react": "^4.3.1",
    "autoprefixer": "^10.4.20",
    "postcss": "^8.4.45",
    "tailwindcss": "^3.4.11",
    "vite": "^5.4.3"
  }
}
```

---

## Task 5: Create root package.json

**Files:**
- Create: `package.json` (repo root)

- [ ] **Step 5.1: Write root package.json**

Create `/package.json` at the repo root:

```json
{
  "name": "reis-command",
  "private": true,
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "type-check": "turbo type-check"
  },
  "devDependencies": {
    "turbo": "latest"
  }
}
```

---

## Task 6: Create pnpm-workspace.yaml

**Files:**
- Create: `pnpm-workspace.yaml` (repo root)

- [ ] **Step 6.1: Write workspace config**

```yaml
packages:
  - "apps/*"
  - "packages/*"
```

---

## Task 7: Create turbo.json

**Files:**
- Create: `turbo.json` (repo root)

- [ ] **Step 7.1: Write Turborepo pipeline**

```json
{
  "$schema": "https://turbo.build/schema.json",
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {},
    "type-check": {}
  }
}
```

---

## Task 8: Replace root .gitignore

**Files:**
- Replace: `.gitignore`

- [ ] **Step 8.1: Write new .gitignore**

Replace the existing `.gitignore` with one that also covers pnpm and turbo artifacts:

```gitignore
# Dependencies
node_modules/
.pnpm-store/

# Build outputs
dist/
build/
.next/
.nuxt/

# Turbo
.turbo/

# Environment
.env
.env.local
.env.*.local

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*
pnpm-debug.log*
```

---

## Task 9: Install dependencies with pnpm

**Files:** none (installs into `apps/web/node_modules/` and root `node_modules/`)

- [ ] **Step 9.1: Remove old node_modules**

```bash
rm -rf node_modules
```

- [ ] **Step 9.2: Install with pnpm**

```bash
pnpm install
```

Expected: pnpm reads `pnpm-workspace.yaml`, installs turbo at root, installs all `apps/web` deps into `apps/web/node_modules`. Should complete without errors.

---

## Task 10: Verify frontend works

**Files:** none

- [ ] **Step 10.1: Start dev server via filter**

```bash
pnpm --filter @reis-command/web dev
```

Expected: Vite starts at `http://localhost:5173`. Open it — login page loads, dashboard and streaming work as before.

- [ ] **Step 10.2: Verify turbo dev also works**

```bash
pnpm dev
```

Expected: turbo runs `dev` across all workspaces. Only `apps/web` has a dev script so behaviour is identical to above.

- [ ] **Step 10.3: Stop dev server (Ctrl+C)**

---

## Task 11: Commit monorepo structure

**Files:** all staged

- [ ] **Step 11.1: Stage everything**

```bash
git add .
```

- [ ] **Step 11.2: Verify staged files look right**

```bash
git status
```

Expected: new files `apps/web/*`, `turbo.json`, `pnpm-workspace.yaml`, `package.json` (root), modified `.gitignore`, deleted `package.json` (old location), deleted `package-lock.json`, etc.

- [ ] **Step 11.3: Commit**

```bash
git commit -m "chore: init turborepo monorepo structure"
```

---

## Task 12: Point to new GitHub remote

> **Manual step:** Create the new private GitHub repo named `reis-command` at github.com before running these commands. Initialize it with a README so the remote exists.

- [ ] **Step 12.1: Change remote URL**

```bash
git remote set-url origin git@github.com:hwindo/reis-command.git
```

Adjust `hwindo` to your actual GitHub username/org.

- [ ] **Step 12.2: Verify remote changed**

```bash
git remote -v
```

Expected: `origin  git@github.com:hwindo/reis-command.git`

- [ ] **Step 12.3: Push with force (new remote has only the README commit)**

```bash
git push --force origin main
```

> Force push is required here because the new remote has a divergent README commit that we do not want to merge into our history.

---

## Final State

```
reis-command/
├── apps/
│   ├── web/          ✅ existing frontend (Vite + React)
│   └── api/          ⬜ empty (NestJS – Phase 3)
├── packages/
│   └── types/        ⬜ empty (shared types – Phase 3)
├── turbo.json
├── pnpm-workspace.yaml
├── package.json      (workspace root)
├── .gitignore
├── CLAUDE.md
├── CONTEXT.md
└── README.md
```

Dev commands after this:

| Command | Effect |
|---------|--------|
| `pnpm dev` | Turbo runs dev across all workspaces |
| `pnpm --filter @reis-command/web dev` | Frontend only |
| `pnpm build` | Turbo builds all workspaces |
