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

The backend auto-creates tables (and applies schema migrations idempotently) on every start, and seeds 2 demo accounts: `admin/admin123`, `joueur/joueur123`.

## Architecture

### Request flow
Browser → Vite dev server (`:5173`) → proxy `/api/*` → Express backend (`:3001`) → PostgreSQL

In production the proxy is removed; the frontend build is served separately and hits the backend directly.

### Auth
JWT stored in `localStorage` (`dc_token`, `dc_user`). The Axios client in `frontend/src/api/client.js` injects `Authorization: Bearer <token>` on every request and redirects to `/login` on 401. The backend verifies the token in `backend/src/middleware/auth.js` via `authenticate`, then `requireRole(...roles)` enforces RBAC.

Two roles: **admin** (users CRUD, validation of player proposals, direct edits, leaderboard, game rules) and **joueur** (builds a selection of living personalities, proposes new people, reports deaths, proposes edits — everything subject to admin validation when the `validation_admin` rule is on).

### Backend structure
- `src/index.js` — entry point: Express setup, DB init + idempotent migrations, seeds, server start. `express-async-errors` is loaded here so async route errors reach the global error middleware.
- `src/db/index.js` — single `pg.Pool` exported as `{ query, pool }` (SSL auto-enabled for non-local hosts)
- `src/middleware/auth.js` — `authenticate` + `requireRole` middlewares
- `src/regles.js` — `getRegle(code)` with in-memory TTL cache; `invalidateRegles()` called on rule updates
- `src/services/deathService.js` — `applyDeath(personId, dateDeces, pointsRuleActive)`: sets `date_deces`, clears pending report, awards points (100 − age at death, min 0) to selections
- `src/routes/auth.js` — `POST /api/auth/login`, `GET /api/auth/me`
- `src/routes/users.js` — users CRUD (admin) + `GET /leaderboard`
- `src/routes/personnalites.js` — search, admin list/edit/delete, create proposals, death reports (`report-death`, `validate-death`, `death-report`), player edit proposals (`propose-edit`)
- `src/routes/personEdits.js` — admin queue for player-proposed edits
- `src/routes/selections.js` — player selections (limit driven by the `limite_selection` rule)
- `src/routes/regles.js` — game rules read/toggle
- `scripts/sync-personalities-to-neon.js` — additive data sync local → Neon (dry-run by default, `--apply` to write)
- `scripts/backup-neon.ps1` — full Neon backup via ephemeral `postgres:18-alpine` Docker container

All DB queries use parameterised `$1, $2, …` placeholders (no ORM).

### Frontend structure
- `src/api/client.js` — pre-configured Axios instance (baseURL from `VITE_API_URL` or `/api`, auth interceptor, 401 redirect)
- `src/contexts/AuthContext.jsx` — `user`, `loading`, `login()`, `logout()` via React context
- `src/App.jsx` — route tree with `ProtectedRoute` (auth check + role) and `PublicRoute`
- `src/lib/format.js` — `formatDate`, `calculateAge`, `formatAge`, `today()` (shared date helpers)
- `src/lib/personOptions.js` — shared category/nationality option lists
- Pages: `Login`, `Selection` (player home), `Users`, `PendingValidation`, `Personalities`, `Leaderboard`, `Regles` (admin)
- Components: `Layout` (nav shell), `UserModal`, `CreatePersonModal`, `EditPersonModal`, `ReportDeathModal`, `AdminPersonModal`, `PasswordInput`

### Data model
**users**: `id`, `username` (unique), `email`, `password_hash`, `role` (`admin|joueur`), `created_at`

**personnalite** (single table for living AND deceased people): `id`, `nom`, `prenom`, `categorie`, `nationalite`, `date_naissance`, `date_deces` (**NULL = alive; a non-NULL date is what defines death**), `a_verifier` (source/notes), `statut` (`en_attente|validee` — admin validation of new proposals), `created_by`, `date_deces_proposee` + `deces_signale_par` (pending death report awaiting admin validation). Seeded from `src/data/alivePerson.csv` + `src/data/deathPerson.csv` when the corresponding population is empty.

**playerSelection**: `user_id`, `person_id` → `personnalite`, `points` (set when the person's death is validated), unique per (user, person).

**personEdit**: pending player-proposed edits to a `personnalite` row; deleted once validated or rejected.

**regles**: `code` (unique), `nom`, `description`, `active`, `valeur` — game rules toggleable by admins (`points_calcul`, `validation_admin`, `limite_selection`).

Legacy `alivePerson`/`deathPerson` tables are merged into `personnalite` automatically by the idempotent migration in `initDB()` (runs at backend startup, including on Render/Neon at next deploy).

### Key constraints
- `DELETE /api/users/:id` blocks self-deletion (returns 400)
- The Vite proxy (`/api` → `:3001`) only applies in dev; `frontend/src/api/client.js` uses `baseURL: '/api'` (relative), so it works in both environments
