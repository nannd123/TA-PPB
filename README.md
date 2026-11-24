# Quizora

Quizora is a mobile-first daily knowledge quiz PWA built with React, Vite, an
Express REST API, and Supabase PostgreSQL.

## Project layout

- `frontend/` - React and Vite application
- `backend/` - Express API
- `docs/` - project requirements and context
- `reference/` - course modules and assignment reference

## Requirements

- Node.js 22 or later
- npm
- Supabase project credentials are required for database-backed API routes

## Run locally

Open two terminals from the project root.

### Backend

```powershell
Set-Location .\backend
Copy-Item .env.example .env
npm install
npm run dev
```

The health endpoint is available at `http://localhost:3000/health`.

The API requires `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `backend/.env`.
The backend handles username/password registration, login, and Supabase token
verification. Keep all Supabase credentials on the backend; the frontend does
not need a Supabase key. Usernames are mapped to internal `.invalid` addresses,
which are automatically confirmed by the backend, so users do not need a real
email address or email confirmation.

Apply the SQL migrations and development seed in Supabase before using the
database-backed endpoints. See [`docs/API_CONTRACT.md`](./docs/API_CONTRACT.md)
and [`docs/DATABASE_SCHEMA.md`](./docs/DATABASE_SCHEMA.md).

Daily Quiz is scheduled on demand when `GET /api/quizzes/daily` is requested.
The database function validates the five-question package, serializes
concurrent requests, and persists one assignment per Asia/Jakarta date, so no
background worker or always-on backend process is required.

### Frontend

```powershell
Set-Location .\frontend
Copy-Item .env.example .env
npm install
npm run dev
```

The frontend only uses `VITE_API_BASE_URL` to locate the backend. The Vite
development server prints the local URL when it starts.

Without database credentials, the API health check works while database-backed
endpoints return `503`. Never put server-side Supabase credentials in the
frontend or commit `.env` files.

### PWA preview

The frontend uses a manually registered Service Worker in production builds.
To test installation and offline behavior, build and preview the frontend:

```powershell
Set-Location .\frontend
npm run build
npm run preview
```

Serve the preview over localhost or HTTPS. The Service Worker caches the app
shell and static assets, but deliberately does not cache API responses or quiz
submissions. Quiz data and answer submission still require a network connection.
