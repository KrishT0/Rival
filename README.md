# Rival - Task Management Application

A full-stack task management application built for the Rival Full-Stack Developer Assessment.

**Live app:** https://rival-green.vercel.app/

**Backend API:** https://rival-backend-fnmh.onrender.com

> Note: the backend is hosted on Render's free tier, which spins down after inactivity. The first request after idle time may take 30-60 seconds to respond.

## Tech Stack

- **Frontend:** Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4, shadcn/ui (Base UI primitives), React Hook Form, Zod
- **Backend:** Go, chi router, pgx (raw SQL, no ORM)
- **Database:** PostgreSQL (Neon in production, Docker locally)
- **Auth:** JWT stored in an httpOnly cookie, bcrypt password hashing
- **Deployment:** Vercel (frontend), Render (backend), Neon (database)
- **CI/CD:** GitHub Actions (backend tests + build, frontend build) on every push and pull request

## Project Structure

```

├── .github/workflows/    CI pipeline (GitHub Actions)
├── backend/              Go REST API
│   ├── cmd/server/       Application entry point
│   ├── internal/
│   │   ├── handler/      HTTP handlers
│   │   ├── service/      Business logic and validation
│   │   ├── repository/   Database queries (pgx)
│   │   ├── middleware/   JWT auth middleware
│   │   ├── model/        Domain types
│   │   ├── database/     DB connection pool
│   │   └── util/         Shared response helpers
│   └── migrations/       SQL schema and seed data
├── frontend/             Next.js application
│   ├── app/
│   │   ├── page.tsx      Landing page with login/signup
│   │   └── tasks/        Task dashboard (protected route)
│   ├── actions/          Server actions (auth, tasks)
│   └── proxy.ts          Route protection (redirect if unauthenticated)
├── scripts/pre-commit    Git hook: backend tests + frontend build
├── docker-compose.yml    Local PostgreSQL setup
└── Makefile              Convenience commands for local dev
```

## Setup

### Prerequisites

- Go 1.22+
- Node.js 20+ and pnpm
- Docker (for local PostgreSQL)
- Git Bash (if on Windows, for `make` commands)

### 1. Clone the repository

```bash
git clone https://github.com/KrishT0/Rival.git
cd Rival
```

### 2. Environment variables

Copy the example env files and fill in values:

```bash
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local
```

**`backend/.env`**

```dotenv
DATABASE_URL=postgres://postgres:postgres@localhost:5433/rival
JWT_SECRET=your-secret-key
PORT=3001
ALLOWED_ORIGINS=http://localhost:3000
```

**`frontend/.env.local`**

```dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_DEMO_MAIL=demo@example.com
NEXT_PUBLIC_DEMO_PASSWORD=demo123
```

### 3. Install dependencies

```bash
cd backend && go mod download && cd ..
cd frontend && pnpm install && cd ..
```

### 4. Run locally

The `Makefile` starts PostgreSQL (Docker), the Go backend, and the Next.js frontend together.

> **Windows users:** run `make` commands from Git Bash, not PowerShell or CMD.

```bash
make dev
```

This will:

1. Start a PostgreSQL container on `localhost:5433`, automatically running the schema migration and seed data on first start
2. Start the Go backend on `http://localhost:3001`
3. Start the Next.js frontend on `http://localhost:3000`

To stop the database container:

```bash
make down
```

To reset the database (re-run migrations and seed from scratch):

```bash
docker compose down -v
make dev
```

Other useful targets:

```bash
make backend       # run only the Go backend
make frontend      # run only the Next.js frontend
make install-hooks # install the pre-commit hook (backend tests + frontend build)
```

### 5. Demo account

A demo user is seeded automatically via `backend/migrations/002_seed.sql`:

```
email:    demo@example.com
password: demo123
```

This account comes with 15 pre-populated tasks for testing filters, search, sort, and pagination.

## API Reference

Base URL: `http://localhost:3001` (local) or `https://rival-backend-fnmh.onrender.com` (deployed)

### Auth

| Method | Endpoint       | Description                                                          |
| ------ | -------------- | -------------------------------------------------------------------- |
| POST   | `/auth/signup` | Create a new account. Returns a JWT token and user object.           |
| POST   | `/auth/login`  | Log in with email and password. Returns a JWT token and user object. |

**Request body** (both endpoints):

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

### Tasks

All task routes require `Authorization: Bearer <token>` and only operate on the authenticated user's own tasks.

| Method | Endpoint     | Description                                                                                |
| ------ | ------------ | ------------------------------------------------------------------------------------------ |
| GET    | `/tasks`     | List tasks. Supports `status`, `search`, `sort_by`, `order`, `page`, `limit` query params. |
| GET    | `/tasks/:id` | Fetch a single task by ID.                                                                 |
| POST   | `/tasks`     | Create a task.                                                                             |
| PATCH  | `/tasks/:id` | Update a task (partial update).                                                            |
| DELETE | `/tasks/:id` | Delete a task.                                                                             |

**Query parameters for `GET /tasks`**

| Param     | Values                               | Default              |
| --------- | ------------------------------------ | -------------------- |
| `status`  | `todo`, `in_progress`, `done`        | (none — returns all) |
| `search`  | text, matches task title             | (none)               |
| `sort_by` | `due_date`, `priority`, `created_at` | `created_at`         |
| `order`   | `asc`, `desc`                        | `desc`               |
| `page`    | integer                              | `1`                  |
| `limit`   | integer (max 100)                    | `20`                 |

**Create/update request body**

```json
{
  "title": "Finish report",
  "description": "Quarterly summary for the team",
  "status": "todo",
  "priority": "high",
  "due_date": "2026-07-01T00:00:00Z"
}
```

`status` must be one of `todo`, `in_progress`, `done`. `priority` must be one of `low`, `medium`, `high`. `due_date` must be RFC3339 format.

**Error response shape**

```json
{
  "error": "description of what went wrong"
}
```

## Testing

Backend service-layer tests cover validation logic (empty title, invalid status, invalid email, title length limits):

```bash
cd backend
go test ./internal/service/... -v
```

## CI/CD

### Local pre-commit hook

`scripts/pre-commit` runs backend tests and a frontend production build before each commit, giving fast local feedback before pushing.

```bash
make install-hooks
```

### GitHub Actions

`.github/workflows/ci.yml` runs on every push and pull request to `main`, in a clean environment independent of any local setup:

- **Backend job:** runs `go test ./internal/service/...` and verifies the binary builds (`go build ./cmd/server`)
- **Frontend job:** installs dependencies with a frozen lockfile and runs `pnpm build`

The pre-commit hook and CI serve complementary purposes: the hook gives immediate local feedback and can be skipped (`git commit --no-verify`) or never installed by a collaborator, while CI is the authoritative, unskippable check that runs for every push regardless of local setup.

## Assumptions and Trade-offs

- **Auth storage:** the JWT is stored in an httpOnly cookie set by Next.js server actions, rather than `localStorage`. This protects the token from XSS but means all task API calls are proxied through Next.js server actions (which read the cookie and forward `Authorization: Bearer <token>` to the Go backend).
- **"Mark Complete" sets `status: done`** and the task remains visible with a "Completed" badge; the button becomes disabled once a task is done. Tasks can be filtered to show only `done` items. Deleting a task is a separate action, available from the overflow menu on each card.
- **Filters, search, and sort are client-side state**, not reflected in the URL. This was chosen for simplicity; URL-synced filters (shareable/bookmarkable views) would be a natural next step.
- **Role-based access (admin)** and other "Plus Features" (real-time updates, optimistic UI, attachments, activity log) were deprioritized given the assessment's 3-5 day window, except for **dark mode**, **Dockerized local setup**, and **CI pipeline**, which are implemented.
- **Dark mode** is implemented via `next-themes` with a toggle in the task dashboard header, persisted automatically across sessions.
- **Render free tier cold starts:** the deployed backend may take up to a minute to respond on the first request after a period of inactivity.
