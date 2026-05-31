# @reis-command/api

NestJS backend for the R3 fleet command platform.

See the [root README](../../README.md) for full setup and run instructions.

## Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/login` | Public | Login → JWT |
| GET | `/api/auth/me` | JWT | Current user |
| GET | `/api/drones` | JWT | All 50 drones |
| GET | `/api/drones/:id` | JWT | Single drone |
| GET | `/api/users` | admin+ | List users |
| POST | `/api/users` | admin+ | Create user |
| DELETE | `/api/users/:id` | super_admin | Delete user |

## Commands

```bash
pnpm dev          # → http://localhost:3000
pnpm build
pnpm seed         # seed DB with admin user + 50 drones
pnpm migration:generate src/migrations/<Name>
pnpm migration:run
pnpm migration:revert
```
