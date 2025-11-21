# CyberDojo — Server (src)

This README summarizes the server-side implementation, how to run it locally, and the available HTTP APIs with small curl examples.

Contents
- Overview
- Run locally
- Environment
- Important folders
- API reference (examples)
- Notes & security

---

## Overview

The server is a Node.js + TypeScript Express app. It provides CRUD for Scenarios, creates and manages Runs (executions of scenarios), and records Alerts detected by the detection engine.

Key responsibilities:
- Persist models with Mongoose (MongoDB).
- Orchestrate scenario execution via the AttackEngine (executes http steps using the HttpExecutor).
- Emit run logs in real-time via SSE (`/api/runs/:runId/stream`).

---

## Run locally

Requirements:
- Node.js (16+), npm
- MongoDB available at `MONGO_URI` (defaults to `mongodb://localhost:27017/cyberdojo`) or run a local Docker Mongo image.

Install and start:

```powershell
# from project root
cd server
npm install
npm run dev
```

Server defaults to port `3000` (see `src/index.ts`). If the DB connection fails the server will currently fail to start — start MongoDB first or modify the start logic (dev convenience).

Health check:

```powershell
curl http://localhost:3000/health
```

---


## Important folders (src)

- `controllers/` — Express handlers wired to routes
- `routes/` — Express routing (mounted under `/api` in `app.ts`)
- `services/` — Business logic (scenarios, runs, alerts)
- `repositories/` — Database access (Mongoose models)
- `core/attack` — Attack engine and HTTP executor
- `utils/` — runEvents emitter used for SSE

---

## API reference (examples)

All endpoints are mounted under `/api/`. Replace `:id` / `:runId` with actual IDs from your DB responses.

1) Scenarios

- List scenarios
  - GET /api/scenarios
  - Example:
    ```powershell
    curl http://localhost:3000/api/scenarios
    ```
  - Response shape:
    ```json
    { "data": [ { "_id": "...", "name": "Example", "description": "...", "steps": [...] } ] }
    ```

- Get scenario
  - GET /api/scenarios/:id
  - Example:
    ```powershell
    curl http://localhost:3000/api/scenarios/64a1...
    ```

- Create scenario
  - POST /api/scenarios
  - Body: JSON
  - Example:
    ```powershell
    curl -X POST http://localhost:3000/api/scenarios -H "Content-Type: application/json" -d '{"name":"My","description":"...","steps":[{"type":"http","method":"GET","url":"https://httpbin.org/get"}]}'
    ```

- Update scenario
  - PUT /api/scenarios/:id

- Run scenario
  - POST /api/scenarios/:id/run
  - Starts a run (creates a Run record and schedules execution via the AttackEngine). Returns the created run object.
  - Example:
    ```powershell
    curl -X POST http://localhost:3000/api/scenarios/64a1.../run
    ```

2) Runs

- List runs
  - GET /api/runs

- Create run (alternative to POST /scenarios/:id/run)
  - POST /api/runs
  - Body: `{ "scenarioId": "<id>" }`

- Get run
  - GET /api/runs/:runId
  - Example:
    ```powershell
    curl http://localhost:3000/api/runs/<runId>
    ```

- Stream logs (SSE)
  - GET /api/runs/:runId/stream
  - Use EventSource in browsers or `curl` to inspect the stream.
  - Example (curl):
    ```powershell
    curl http://localhost:3000/api/runs/<runId>/stream
    ```
  - The server writes lines like: `data: {"log":"Starting scenario..."}`

3) Alerts

- List alerts
  - GET /api/alerts

- Create alert
  - POST /api/alerts
  - Body: `{ "run": "<runId>", "rule": "<ruleId>", "severity": "high", "details": "..." }`

---

## Example: end-to-end

1. Create a scenario (POST /api/scenarios)
2. Start it (POST /api/scenarios/:id/run) — response contains the run id
3. Stream logs:
   - `curl http://localhost:3000/api/runs/<runId>/stream`
4. Fetch run status/logs via `GET /api/runs/:runId`

---

## Notes & security

- The AttackEngine executes HTTP steps from scenarios. This can allow arbitrary outbound HTTP calls. For a production system you must:
  - Restrict or validate target hosts (allowlist) to avoid SSRF and abuse.
  - Add authentication and authorization on APIs that start runs.
  - Rate-limit run creation to avoid abuse.

- SSE (`/api/runs/:runId/stream`) keeps a long-lived connection open and uses an in-process EventEmitter (`src/utils/runEvents.ts`) to push appended logs. This is fine for a small-scale demo but consider a scalable pub/sub for many clients (Redis Streams / WebSocket cluster) in production.

---

## New Features & Updates (2025)

- **GET /api/summary** — Returns aggregate counts for scenarios, runs (by status), and alerts (by severity) for dashboard use.
  - Example:
    ```powershell
    curl http://localhost:3000/api/summary
    ```
  - Response shape:
    ```json
    {
      "data": {
        "scenariosCount": 12,
        "runs": { "pending": 0, "running": 0, "completed": 12, "failed": 0 },
        "alerts": { "low": 0, "medium": 0, "high": 0 }
      }
    }
    ```

- **Server-side scenario search** — `GET /api/scenarios?q=keyword` supports searching by name/description (case-insensitive).
  - Example:
    ```powershell
    curl "http://localhost:3000/api/scenarios?q=test"
    ```

- **AttackEngine target URL allowlist** — Only allows HTTP steps to hosts listed in the `ATTACK_ALLOWLIST` env variable (comma-separated, e.g. `localhost,example.com`).
  - Blocked steps are logged in the run log as `Step X blocked by allowlist: <url>`.
  - Set in `.env` or shell:
    ```powershell
    $env:ATTACK_ALLOWLIST='localhost,example.com'
    ```

- **Client dashboard** now fetches `/api/summary` and visualizes counts using Chart.js (see client/README.md).

---

EOF
