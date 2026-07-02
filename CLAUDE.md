# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend (`backend/`)
```bash
npm run dev      # Start with nodemon (auto-reload)
npm start        # Start without auto-reload
```

### Frontend (`frontend/`)
```bash
npm run dev      # Vite dev server on http://localhost:5173
npm run build    # Production build
npm run preview  # Preview production build
```

### Infrastructure
```bash
docker compose up -d    # Start PostgreSQL on port 5432
docker compose down     # Stop
```

### Full local dev setup
1. `docker compose up -d`
2. Copy `backend/.env.example` → `backend/.env` and set `JWT_SECRET`
3. `cd backend && npm install && npm run dev`
4. `cd frontend && npm install && npm run dev`

The backend auto-creates tables and seeds 3 demo accounts on first start: `admin/admin123`, `editor/editor123`, `viewer/viewer123`.

## Architecture

### Request flow
Browser → Vite dev server (`:5173`) → proxy `/api/*` → Express backend (`:3001`) → PostgreSQL

In production the proxy is removed; the frontend build is served separately and hits the backend directly.

### Auth
JWT stored in `localStorage` (`dc_token`, `dc_user`). The Axios client in `frontend/src/api/client.js` injects `Authorization: Bearer <token>` on every request and redirects to `/login` on 401. The backend verifies the token in `backend/src/middleware/auth.js` via `authenticate`, then `requireRole(...roles)` enforces RBAC.

Three roles: **admin** (full CRUD on persons + users), **editor** (read + write persons), **viewer** (read only).

### Backend structure
- `src/index.js` — entry point: Express setup, DB init (`CREATE TABLE IF NOT EXISTS`), seed, server start
- `src/db/index.js` — single `pg.Pool` exported as `{ query, pool }`
- `src/middleware/auth.js` — `authenticate` + `requireRole` middlewares
- `src/routes/auth.js` — `POST /api/auth/login`, `GET /api/auth/me`
- `src/routes/persons.js` — CRUD + `GET /api/persons/stats`
- `src/routes/users.js` — admin-only CRUD (password never returned)

All DB queries use parameterised `$1, $2, …` placeholders (no ORM).

### Frontend structure
- `src/api/client.js` — pre-configured Axios instance (baseURL `/api`, auth interceptor, 401 redirect)
- `src/contexts/AuthContext.jsx` — `user`, `loading`, `login()`, `logout()` via React context
- `src/App.jsx` — route tree with `ProtectedRoute` (auth + optional role check) and `PublicRoute`
- Pages: `Login`, `Persons` (main list), `Users` (admin only)
- Components: `Layout` (nav shell), `PersonModal`, `UserModal`

### Data model
**persons**: `id`, `nom`, `prenom`, `date_naissance`, `nationalite`, `categorie`, `description`, `is_alive` (bool, default `true`), `deceased_at`, `created_by` (FK → users), `created_at`, `updated_at` (auto-trigger)

**users**: `id`, `username` (unique), `email`, `password_hash`, `role` (`admin|editor|viewer`), `created_at`

### Key constraints
- `DELETE /api/users/:id` blocks self-deletion (returns 400)
- Persons `updated_at` is managed by a PostgreSQL trigger, not application code
- The Vite proxy (`/api` → `:3001`) only applies in dev; `frontend/src/api/client.js` uses `baseURL: '/api'` (relative), so it works in both environments
