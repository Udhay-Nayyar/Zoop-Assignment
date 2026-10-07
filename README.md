# Delivery Agent Management System

A small full-stack application for managing delivery agents. The Express API provides validated CRUD operations, searchable and paginated listings, and Redis cache-aside acceleration with database-backed fallback; the Next.js frontend provides a responsive interface for browsing, creating, editing, and deleting agents.

## Tech stack

| Area | Technology |
| --- | --- |
| Backend API | Node.js + Express (plain JavaScript, CommonJS) |
| Database | PostgreSQL 16 |
| Cache | Redis 7 with ioredis |
| Frontend | Next.js App Router + Tailwind CSS |
| Tests | Jest + Supertest |
| Local infrastructure | Docker Compose |

## Features

- Create, read, update, and delete delivery agents.
- Paginated listings with case-insensitive search, status and service-area filters, and sorting.
- Redis caching for individual records and list responses, with graceful database-backed fallback when Redis is unavailable.
- Validated input and consistent JSON error responses.
- Backend unit/service tests and a responsive frontend with URL-backed list controls.

## Architecture

The backend follows `routes -> controllers -> services -> repositories`. Services own cache access; repositories own database access. Controllers translate HTTP requests and responses, while validators and middleware handle request validation and errors. The frontend calls same-origin `/api` paths, which Next.js rewrites to the backend
using `VITE_API_URL`.

```text
delivery-agent-management/
├── README.md
├── .gitignore
├── docker-compose.yml
├── backend/
│   ├── .env.example
│   ├── CACHING.md
│   ├── package.json
│   ├── migrations/
│   │   ├── 001_create_agents.sql
│   │   └── 002_add_search_indexes.sql
│   ├── scripts/
│   │   ├── migrate.js
│   │   └── seed.js
│   ├── src/
│   │   ├── app.js
│   │   ├── server.js
│   │   ├── cache/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── errors/
│   │   ├── middlewares/
│   │   ├── repositories/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── validators/
│   └── tests/
└── frontend/
    ├── .env.example
    ├── package.json
    ├── app/
    └── src/
        ├── components/
        ├── hooks/
        └── lib/
```

## Prerequisites

- Git (to clone the repository); the checked environment used **2.47.1.windows.1**.
- Node.js 18.18 or newer and npm. The checked environment used Node.js **v24.15.0** and npm **11.12.1**.
- Docker Engine with Docker Compose. The checked environment used Docker **29.6.2** and Compose **v5.3.1**; PostgreSQL **16** and Redis **7** are the Compose images.

## Quick start

Replace `<repository-url>` with the clone URL for your copy of this project. Start Docker Desktop / Docker Engine first. These commands use the default ports and local development configuration.

```sh
git clone <repository-url> delivery-agent-management
cd delivery-agent-management
docker compose up -d --wait
```

In the first terminal, install and start the backend:

```sh
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev
```

In a second terminal at the repository root, install and start the frontend:

```sh
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

Open:

- Frontend: <http://localhost:3001>
- API: <http://localhost:3000>
- Health: <http://localhost:3000/health>

For single-instance AWS EC2 production deployment instructions, see
[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md).

The Compose database and Redis ports, and the backend URLs, must agree. Defaults are PostgreSQL on `localhost:5432` and Redis on `localhost:6379`. If either port is already occupied, use the Compose port variables and update the corresponding backend URLs before starting the backend; see [Troubleshooting](#troubleshooting).

On Windows PowerShell, this example starts Compose on alternate host ports. In `backend/.env`, change `PORT` to `3100`, change the PostgreSQL URL's port from `5432` to `55432`, and change `REDIS_URL`'s port from `6379` to `56379`. In `frontend/.env.local`, set `VITE_API_URL=http://localhost:3100`. Start the frontend on port 3101 with `npm run dev -- -p 3101`.

```powershell
$env:POSTGRES_PORT = "55432"
$env:REDIS_PORT = "56379"
docker compose up -d --wait
```

## Environment variables

### Backend (`backend/.env`)

All backend variables have local-development defaults and are optional for the default Docker Compose setup. Set deployment-specific values outside source control.

| Name | Required? | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `3000` | HTTP port for Express. |
| `DATABASE_URL` | No | Local Compose PostgreSQL URL (`delivery_agents` database) | PostgreSQL connection string. |
| `REDIS_URL` | No | `redis://localhost:6379` | Redis connection URL; Redis is optional for API availability. |
| `CACHE_TTL_AGENT_SECONDS` | No | `300` | Cache lifetime for individual agent records. |
| `CACHE_TTL_LIST_SECONDS` | No | `60` | Cache lifetime for agent-list responses. |
| `NODE_ENV` | No | `development` | Runtime environment (`development`, `test`, or `production`). |

### Frontend (`frontend/.env.local`)

| Name | Required? | Default | Description |
| --- | --- | --- | --- |
| `VITE_API_URL` | No | `http://localhost:3000` | Backend origin used by the Next.js API and health rewrites. Set to `http://54.161.105.66` for production. |

### Docker Compose overrides

| Name | Required? | Default | Description |
| --- | --- | --- | --- |
| `POSTGRES_DB` | No | `delivery_agents` | Database initialized in the PostgreSQL container. |
| `POSTGRES_USER` | No | `postgres` | Local Compose database user. |
| `POSTGRES_PASSWORD` | No | A development-only placeholder | Local Compose database password; override it for any shared or deployed environment. |
| `POSTGRES_PORT` | No | `5432` | Host port mapped to PostgreSQL's container port. |
| `REDIS_PORT` | No | `6379` | Host port mapped to Redis's container port. |

The PostgreSQL Compose password is intended only for local development. Do not reuse it or commit real credentials.

## Database

PostgreSQL is used because agent data is structured, relational constraints can enforce uniqueness and valid status values, and SQL supports the filtering and offset pagination used by the API. PostgreSQL's `pg_trgm` extension provides GIN trigram indexes for substring `ILIKE` searches.

The `agents` table contains:

| Column | Type | Rules |
| --- | --- | --- |
| `id` | UUID | Primary key; generated by `gen_random_uuid()`. |
| `full_name` | `VARCHAR(120)` | Required. |
| `phone` | `VARCHAR(20)` | Required and unique (`agents_phone_key`). |
| `email` | `VARCHAR(255)` | Required; unique case-insensitively via `agents_email_lower_key` on `LOWER(email)`. |
| `service_area` | `VARCHAR(120)` | Required. |
| `status` | `VARCHAR(10)` | Required; defaults to `active`; restricted to `active` or `inactive`. |
| `created_at` | `TIMESTAMPTZ` | Required; defaults to the current time. |
| `updated_at` | `TIMESTAMPTZ` | Required; defaults to the current time and is maintained by a `BEFORE UPDATE` trigger. |

The schema also has indexes on status, service area, and descending creation time, plus trigram GIN indexes on full name, email, and service area.

`npm run migrate` reads SQL files in filename order, applies unapplied files transactionally, and records successful filenames in `schema_migrations`; it is safe to run repeatedly. The agent seed script is also idempotent.

To reset local data, stop this Compose project and remove its named volumes. **This permanently deletes its database and Redis data.**

```sh
docker compose down -v
docker compose up -d --wait
cd backend
npm run migrate
npm run seed
```

## API reference

Base path: `/api/agents`. Agent JSON fields are `id`, `fullName`, `phone`, `email`, `serviceArea`, `status`, `createdAt`, and `updatedAt`.

| Method | Path | Success | Common errors |
| --- | --- | --- | --- |
| `GET` | `/health` | `200` (database up; status may be `degraded` if Redis is down) | `503` if the database is down |
| `GET` | `/api/agents` | `200`, `{ data, meta }` | `400` for invalid or unknown query parameters |
| `POST` | `/api/agents` | `201`, created agent | `400` invalid body; `409` duplicate email or phone |
| `GET` | `/api/agents/:id` | `200`, agent | `400` malformed UUID; `404` missing agent |
| `PATCH` | `/api/agents/:id` | `200`, updated agent | `400` invalid UUID/body; `404` missing agent; `409` duplicate email or phone |
| `PUT` | `/api/agents/:id` | `200`, updated agent | Same as `PATCH` (the current implementation applies the provided fields) |
| `DELETE` | `/api/agents/:id` | `204`, no response body | `400` malformed UUID; `404` missing agent |

`GET /api/agents` accepts the following query parameters. Empty strings are treated as omitted.

| Parameter | Rules and default |
| --- | --- |
| `page` | Integer >= 1; default `1`. |
| `limit` | Integer 1–100; default `10`. |
| `status` | Optional `active` or `inactive`. |
| `serviceArea` | Optional trimmed string, maximum 120 characters; case-insensitive exact match. |
| `q` | Optional trimmed string, maximum 100 characters; case-insensitive partial search over name, email, phone, and service area. `%` and `_` are treated literally. |
| `sortBy` | `createdAt`, `updatedAt`, or `fullName`; default `createdAt`. |
| `order` | `asc` or `desc`; default `desc`. |

Validation and application errors use this shape:

```json
{
  "error": {
    "code": "BAD_REQUEST",
    "message": "Request validation failed",
    "details": [{ "field": "page", "message": "..." }]
  }
}
```

`details` is present on application errors (and may be empty). Malformed JSON returns `400` with code `INVALID_JSON`; unexpected errors return a generic `500` response without SQL details or stack traces.

Examples (use an existing record's ID for the get, update, and delete requests):

```sh
# Create
curl -i -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Ravi Kumar","phone":"+919911223344","email":"ravi@example.test","serviceArea":"Koramangala"}'

# List with filters, sorting, and pagination
curl -i "http://localhost:3000/api/agents?page=1&limit=10&status=active&serviceArea=whitefield&q=ravi&sortBy=fullName&order=asc"

# Get one
curl -i "http://localhost:3000/api/agents/<agent-id>"

# Update
curl -i -X PATCH "http://localhost:3000/api/agents/<agent-id>" \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'

# Delete
curl -i -X DELETE "http://localhost:3000/api/agents/<agent-id>"

# Conflict example: after creating the example agent above, reuse its email
curl -i -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Another Agent","phone":"+919900000099","email":"ravi@example.test","serviceArea":"Indiranagar"}'
```

## Redis caching

Redis is an optional cache; PostgreSQL remains the source of truth. See [backend/CACHING.md](./backend/CACHING.md) for the full key normalization and consistency description.

| Key | TTL | Purpose |
| --- | --- | --- |
| `agent:<id>` | `CACHE_TTL_AGENT_SECONDS` (default 300 seconds) | Cached individual agent. |
| `agents:list:v<version>:<normalized-query>` | `CACHE_TTL_LIST_SECONDS` (default 60 seconds) | Cached `{ data, meta }` for one list query. |
| `agents:list:version` | No TTL | Version counter used to invalidate every old list-query key together. |

Each filter, sort, and pagination combination has its own list key; query keys are normalized and sorted, and `q` and `serviceArea` are lowercased. Successful create/update/delete operations increment the list version. Update and delete also remove the affected individual key. Failed writes do not invalidate cache entries. Old list keys are not scanned or deleted; they expire by TTL.

Successful cached `GET /api/agents` and `GET /api/agents/:id` responses include `X-Cache: MISS` or `X-Cache: HIT`. Write responses do not include this header. If Redis is unavailable or a cache command fails, the API continues using PostgreSQL; cache misses/writes/invalidation are best-effort. Health reports `degraded` when Redis is down but still returns HTTP `200` if PostgreSQL is up.

Copy-paste demonstration using a new agent:

```sh
AGENT_ID=$(curl -sS -X POST http://localhost:3000/api/agents \
  -H "Content-Type: application/json" \
  -d '{"fullName":"Cache Demo","phone":"+919911223345","email":"cache-demo@example.test","serviceArea":"Koramangala"}' \
  | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>console.log(JSON.parse(s).id))")

# First read: MISS. Second read: HIT.
curl -i "http://localhost:3000/api/agents/$AGENT_ID"
curl -i "http://localhost:3000/api/agents/$AGENT_ID"

# Successful write removes the record cache and bumps the list version.
curl -i -X PATCH "http://localhost:3000/api/agents/$AGENT_ID" \
  -H "Content-Type: application/json" \
  -d '{"serviceArea":"Whitefield"}'

# Fresh database-backed response: MISS, with serviceArea "Whitefield".
curl -i "http://localhost:3000/api/agents/$AGENT_ID"
```

Known tradeoffs: a read racing with a write can repopulate a stale value until its TTL expires; if Redis is down during a successful write, pre-existing cache data may remain stale until its TTL expires after Redis returns. See [backend/CACHING.md](./backend/CACHING.md).

## Testing

The integration suite uses a dedicated PostgreSQL database named
`delivery_agents_test` and Redis logical database 1. Start PostgreSQL and Redis
first; the test setup connects to the PostgreSQL `postgres` database to create
the test database when it does not exist, and applies migrations. From
`backend/`, create the ignored test environment file and run Jest:

```powershell
Copy-Item .env.test.example .env.test
npm install
npm test
```

Set `DATABASE_URL` in `.env.test` to a PostgreSQL URL whose database name ends
in `_test`; the default is `delivery_agents_test`. `REDIS_URL` defaults to
`redis://localhost:6379/1`, and the example uses short cache TTLs. Adjust the
host/port if your local Compose services use alternate ports. A safety guard
aborts Jest before setup if `NODE_ENV` is not `test` or the configured database
name does not end in `_test`. The tests truncate the `agents` table and flush
the selected Redis logical database; do not point these variables at
development data.

The suites exercise real Supertest requests against the Express app without
starting a listener:

- `agents.crud.test.js`: create/read/update/delete, validation, conflicts,
  malformed JSON, not-found behavior, and safe error responses.
- `agents.list.test.js`: pagination, metadata, filters, search, literal LIKE
  characters, stable ordering, and invalid query values.
- `agents.cache.test.js`: cache MISS/HIT behavior, normalized keys, TTLs, write
  invalidation across queries, and failed-write/not-found behavior.
- `agents.redis-down.test.js`: database-backed API behavior during Redis
  disconnection, health status, reconnection, and resumed caching.
- `health.test.js`: live PostgreSQL and Redis health checks.
- `validators.test.js` and `cacheKeys.test.js`: pure validation and cache-key
  unit tests.

Run coverage with `npm run test:coverage`. The migration runner is exported for
test setup and `npm run migrate` remains the normal application migration
command.

## Manual UI checklist

With Docker, the backend, and frontend running:

- Open `/agents`; verify the list, pagination, and responsive cards/table.
- Search for an agent, refresh, and use Back; query state should be reflected in the URL.
- Filter by status/service area and change sorting or page size.
- Create an agent; verify the success toast and detail page.
- Edit an agent; verify the updated value appears in the detail and list.
- Try invalid data and a duplicate email/phone; verify field-level messages.
- Delete an agent and confirm it disappears from the list.
- Visit a valid but nonexistent UUID; verify the friendly not-found state.

## Design decisions and tradeoffs

- **UUID IDs:** stable identifiers that do not expose sequential row counts.
- **PATCH and PUT:** both update the provided fields on the same route for client compatibility; PUT is not a full resource replacement.
- **Offset pagination:** straightforward page-number navigation; very deep pages can become slower than cursor pagination.
- **Delete-and-refill cache strategy:** record keys are deleted and list keys are invalidated by a version bump rather than scanning Redis.
- **Redis is optional:** requests use PostgreSQL when cache service is unavailable, trading performance for availability.

## Possible improvements

- Authentication and authorization.
- Rate limiting and request audit logging.
- Soft deletion and retention policies.
- Docker images and production Compose profiles for backend and frontend.
- CI for tests, lint, migration validation, and frontend build.
- Real integration tests with a guarded, isolated test database and Redis DB.

## Troubleshooting

- **Port already in use:** change `POSTGRES_PORT` or `REDIS_PORT` for Compose and update `DATABASE_URL` or `REDIS_URL` in `backend/.env` to match. If the frontend or backend port is occupied, set backend `PORT` or adjust the frontend dev command/rewrite configuration. Ensure `VITE_API_URL` matches the actual backend origin.
- **Docker is not running:** start Docker Desktop / Docker Engine, then retry `docker compose up -d --wait`.
- **Migration fails:** check PostgreSQL health with `docker compose ps`, confirm `DATABASE_URL` targets the Compose database, and inspect logs with `docker compose logs postgres`. Migration `002` needs permission to create the `pg_trgm` extension.
- **Redis is down:** API reads and writes continue using PostgreSQL; cache headers may show `MISS`, and health reports Redis as `down` with overall `degraded` status while the database is available. Check `docker compose logs redis`.
- **Resetting data:** `docker compose down -v` deletes this Compose project's named volumes and all local database/Redis data; run migrations and seed again afterward.
