# CyberDojo Client

This is the React + Vite frontend for the CyberDojo security training platform.

## Features
- Dashboard with scenario, run, and alert counts
- Chart.js visualizations for run status and alert severity
- Scenario management (list, create, preview, run)
- Real-time run logs (SSE)
- Toast notifications for feedback
- Light/dark theme toggle
- Responsive layout

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- Backend server running (see `../server/README.md`)

### Install dependencies
```powershell
npm install
```

### Start development server
```powershell
npm run dev
```

The app will be available at `http://localhost:5173` (default Vite port).

### API Proxy
During development, API requests to `/api/*` are proxied to the backend server (default: `http://localhost:3000`).

### Environment variables
Create a `.env` file in the `client/` folder or set environment variables in your shell. Vite exposes variables that start with `VITE_` via `import.meta.env`.

Recommended variables (defaults shown):

- `VITE_API_BASE_URL` — base path for API requests (default `/api`).
- `VITE_APP_ENV` — application environment (`development` or `production`).
- `VITE_ENABLE_SSE` — whether SSE endpoints should be used by the client (`true`|`false`).

Example `client/.env`:
```dotenv
VITE_API_BASE_URL=/api
VITE_APP_ENV=development
VITE_ENABLE_SSE=true
```

## Folder Structure
- `src/` — main source code
  - `api/` — API wrappers
  - `components/` — reusable UI components
  - `features/` — feature modules (dashboard, scenarios, runs, alerts)
  - `hooks/` — custom React hooks
  - `styles/` — CSS files
  - `types/` — TypeScript types
  - `utils/` — utility functions

## Main Pages
- **Dashboard**: `/dashboard` — summary stats and charts
- **Scenarios**: `/scenarios` — list, details, create, preview, run
- **Runs**: `/runs` — run history and details
- **Alerts**: `/alerts` — alert dashboard

## Key Dependencies
- React
- Vite
- Chart.js + react-chartjs-2
- React Router

## Customization
- Theme can be toggled (light/dark)
- Toast notifications are available globally

## Feedback & Issues
For bug reports or feature requests, please open an issue in the main repository.
